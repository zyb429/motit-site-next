// motit-site-next/src/lib/mailer.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmailChangeConfirmation(to: string, confirmUrl: string) {
  const fromName = process.env.SMTP_FROM_NAME ?? "Motit";
  const fromEmail = process.env.SMTP_FROM_EMAIL ?? process.env.SMTP_USER ?? "noreply@motit.by";

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: "Подтверждение смены email",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <h2>Смена email</h2>
        <p>Вы запросили смену email на этот адрес. Подтвердите действие:</p>
        <p><a href="${confirmUrl}"
              style="display:inline-block;padding:10px 20px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;">
          Подтвердить email
        </a></p>
        <p style="color:#888;font-size:12px;">
          Ссылка действует 1 час. Если вы не запрашивали смену — проигнорируйте письмо.
        </p>
      </div>
    `,
  });
}