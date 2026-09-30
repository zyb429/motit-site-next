import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      name,
      job_title,
      company_name,
      email,
      phone,
      message,
      privacyAgreed,
      privacyAgreedAt,
    } = data;

    // ---------- 1. Валидация ----------
    if (!privacyAgreed) {
      return NextResponse.json(
        {
          success: false,
          error: "Необходимо согласие на обработку персональных данных",
          field: "privacyAgreed",
        },
        { status: 400 },
      );
    }

    if (!name || String(name).trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Имя должно содержать минимум 2 символа", field: "name" },
        { status: 400 },
      );
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
      return NextResponse.json(
        { success: false, error: "Введите корректный email", field: "email" },
        { status: 400 },
      );
    }

    // ---------- 2. Сохраняем в БД (тикет) ----------
    let ticketUuid: string | null = null;
    try {
      ticketUuid = await createTicketFromContact({
        name: String(name).trim(),
        email: String(email).trim(),
        phone: phone ? String(phone).trim() : null,
        company_name: company_name ? String(company_name).trim() : null,
        job_title: job_title ? String(job_title).trim() : null,
        message: message ? String(message).trim() : null,
        privacyAgreedAt: privacyAgreedAt ?? new Date().toISOString(),
      });
    } catch (dbError) {
      // Не роняем форму, если БД недоступна — письмо всё равно отправим
      console.error("❌ Ошибка сохранения заявки в БД:", dbError);
    }

    // ---------- 3. Отправка email ----------
    if (!process.env.SMTP_HOST) {
      console.warn("⚠️ SMTP не настроен! Письмо не отправлено.");
      return NextResponse.json({
        success: true,
        message: "SMTP не настроен, но заявка сохранена",
        testMode: true,
        ticketUuid,
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      requireTLS: true,
    });

    await transporter.verify();

    const htmlContent = buildHtml({ name, job_title, company_name, email, phone, message, privacyAgreedAt });

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || "Сайт"}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: process.env.CONTACT_EMAIL,
      subject: `Новая заявка от ${name}`,
      html: htmlContent,
      text: buildText({ name, email, phone, message, privacyAgreedAt, ticketUuid }),
      replyTo: email,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Письмо отправлено:", process.env.CONTACT_EMAIL);
    console.log("📧 ID письма:", info.messageId);
    if (ticketUuid) console.log("🎫 Тикет создан:", ticketUuid);

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      ticketUuid,
      message: `Письмо отправлено на ${process.env.CONTACT_EMAIL}`,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Неизвестная ошибка";
    console.error("❌ Ошибка отправки письма:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

/* ============================================================
 *  Сохранение заявки в виде тикета
 * ============================================================ */
type ContactPayload = {
  name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  job_title: string | null;
  message: string | null;
  privacyAgreedAt: string;
};

async function createTicketFromContact(p: ContactPayload): Promise<string> {
  // Категория "site-request" (создать сидом или один раз руками)
  const category = await prisma.ticket_categories.findUnique({
    where: { slug: "site-request" },
  });

  // Статус "new" по code (в твоей таблице statuses.code уникален)
  const status = await prisma.statuses.findUnique({
    where: { code: "new" },
  });

  const title = p.company_name
    ? `Заявка с сайта: ${p.company_name}`
    : `Заявка с сайта: ${p.name}`;

  const descriptionParts = [
    p.message,
    p.job_title ? `Должность: ${p.job_title}` : null,
    p.company_name ? `Компания: ${p.company_name}` : null,
    `Согласие на обработку ПД: да (${new Date(p.privacyAgreedAt).toISOString()})`,
  ].filter(Boolean);

  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const ticket = await tx.tickets.create({
      data: {
        uuid: randomUUID(),
        title,
        description: descriptionParts.join("\n\n"),
        contact_name: p.name,
        contact_email: p.email,
        contact_phone: p.phone,
        category_uuid: category?.uuid ?? null,
        status_uuid: status?.uuid ?? null,
        created_at: now,
        updated_at: now,
      },
    });

    // Чат, привязанный к тикету
    const chat = await tx.chats.create({
      data: {
        uuid: randomUUID(),
        kind: "ticket",
        name: title,
        ticket_uuid: ticket.uuid,
        created_at: now,
        updated_at: now,
      },
    });

    // Добавляем админов и воркеров как участников,
    // чтобы они могли отвечать на заявку с сайта
    const staff = await tx.users.findMany({
      where: {
        users_role_lnk: {
          some: { roles: { name: { in: ["admin", "worker"] } } },
        },
        blocked: false,
      },
      select: { uuid: true },
    });

    if (staff.length > 0) {
      await tx.chat_members.createMany({
        data: staff.map((u) => ({
          uuid: randomUUID(),
          chat_uuid: chat.uuid,
          user_uuid: u.uuid,
          role: "member",
          joined_at: now,
        })),
        skipDuplicates: true,
      });
    }

    // История статусов
    if (status?.uuid) {
      await tx.ticket_status_history.create({
        data: {
          uuid: randomUUID(),
          ticket_uuid: ticket.uuid,
          status_uuid: status.uuid,
          comment: "Создан из формы на сайте",
          created_at: now,
        },
      });
    }

    return ticket.uuid;
  });
}

/* ============================================================
 *  Шаблоны письма
 * ============================================================ */
function buildHtml(d: {
  name: string;
  job_title?: string;
  company_name?: string;
  email: string;
  phone?: string;
  message?: string;
  privacyAgreedAt?: string;
}) {
  const esc = (s?: string) =>
    (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  return `
    <!DOCTYPE html>
    <html><head><style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: #0a1920; color: #2dd4bf; padding: 20px; border-radius: 8px 8px 0 0; }
      .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
      .field { margin-bottom: 15px; }
      .label { font-weight: bold; color: #475569; }
      .value { margin-top: 5px; padding: 10px; background: white; border-radius: 4px; border: 1px solid #e2e8f0; }
      .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
    </style></head><body>
      <div class="container">
        <div class="header"><h2>📩 Новая заявка с сайта</h2></div>
        <div class="content">
          <div class="field"><div class="label">👤 Имя</div><div class="value">${esc(d.name)}</div></div>
          ${d.job_title ? `<div class="field"><div class="label">Должность</div><div class="value">${esc(d.job_title)}</div></div>` : ""}
          ${d.company_name ? `<div class="field"><div class="label">🏢 Компания</div><div class="value">${esc(d.company_name)}</div></div>` : ""}
          <div class="field"><div class="label">📧 Email</div><div class="value">${esc(d.email)}</div></div>
          ${d.phone ? `<div class="field"><div class="label">📱 Телефон</div><div class="value">${esc(d.phone)}</div></div>` : ""}
          <div class="field"><div class="label">💬 Сообщение</div><div class="value">${esc(d.message).replace(/\n/g, "<br>")}</div></div>
          <div class="field"><div class="label">📋 Согласие на обработку ПД</div>
            <div class="value">✅ Да
              <div style="font-size:12px;color:#64748b;margin-top:5px;">
                Время согласия: ${d.privacyAgreedAt ? new Date(d.privacyAgreedAt).toLocaleString("ru-RU") : new Date().toLocaleString("ru-RU")}
              </div>
            </div>
          </div>
          <div class="footer">Отправлено: ${new Date().toLocaleString("ru-RU")}</div>
        </div>
      </div>
    </body></html>
  `;
}

function buildText(d: {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  privacyAgreedAt?: string;
  ticketUuid: string | null;
}) {
  return `
Новая заявка с сайта Motit

Имя: ${d.name}
Email: ${d.email}
${d.phone ? `Телефон: ${d.phone}` : ""}
Сообщение: ${d.message ?? ""}

---
Согласие на обработку ПД: ДА ✅
Время согласия: ${d.privacyAgreedAt ? new Date(d.privacyAgreedAt).toLocaleString("ru-RU") : new Date().toLocaleString("ru-RU")}
${d.ticketUuid ? `Тикет: ${d.ticketUuid}` : ""}
---
Отправлено: ${new Date().toLocaleString("ru-RU")}
  `.trim();
}
