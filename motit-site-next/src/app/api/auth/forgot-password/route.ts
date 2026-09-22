// src/app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (typeof email !== "string" || !email.trim()) {
      return NextResponse.json({ error: "Введите email" }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = await prisma.users.findFirst({
      where: { email: trimmedEmail },
    });

    // Не раскрываем, существует ли email — всегда success
    if (!user) {
      return NextResponse.json({ success: true });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 час

    await prisma.users.update({
      where: { id: user.id },
      data: {
        reset_password_token: token,
        reset_password_expires: expires,
        updated_at: new Date(),
      },
    });

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const resetUrl = `${siteUrl}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: trimmedEmail,
      subject: "Сброс пароля — Motit",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0a1920;">Сброс пароля</h2>
          <p>Вы запросили сброс пароля для аккаунта Motit.</p>
          <p>Перейдите по ссылке, чтобы установить новый пароль:</p>
          <p>
            <a href="${resetUrl}"
               style="display:inline-block;padding:12px 24px;background:#2dd4bf;color:#0a1920;text-decoration:none;border-radius:8px;font-weight:bold;">
              Сбросить пароль
            </a>
          </p>
          <p style="color: #666; font-size: 12px;">
            Ссылка действительна 1 час. Если вы не запрашивали сброс — проигнорируйте это письмо.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/auth/forgot-password] error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}
