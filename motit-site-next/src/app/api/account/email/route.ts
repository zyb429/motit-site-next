// motit-site-next/src/app/api/account/email/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmailChangeConfirmation } from "@/lib/mailer";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { newEmail, password } = await req.json().catch(() => ({}));

  if (typeof newEmail !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
    return NextResponse.json({ error: "Некорректный email" }, { status: 400 });
  }
  if (typeof password !== "string" || !password) {
    return NextResponse.json({ error: "Введите текущий пароль" }, { status: 400 });
  }

  const user = await prisma.users.findUnique({
    where: { id: Number(session.user.id) },
  });
  if (!user?.password_hash) {
    return NextResponse.json({ error: "Нет пароля у аккаунта" }, { status: 400 });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Неверный пароль" }, { status: 403 });
  }

  if (user.email === newEmail) {
    return NextResponse.json({ error: "Это уже ваш текущий email" }, { status: 400 });
  }

  const existing = await prisma.users.findUnique({ where: { email: newEmail } });
  if (existing) {
    return NextResponse.json({ error: "Email уже используется" }, { status: 409 });
  }

  // Удаляем предыдущие неиспользованные токены этого пользователя
  await prisma.emailChangeToken.deleteMany({ where: { user_uuid: user.uuid } });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 час

  await prisma.emailChangeToken.create({
    data: {
      user_uuid: user.uuid,
      new_email: newEmail,
      token,
      expires_at: expiresAt,
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.AUTH_URL ?? "http://localhost:3000";
  const confirmUrl = `${baseUrl}/account/confirm-email?token=${token}`;

  // Отправляем асинхронно, не блокируя ответ
  sendEmailChangeConfirmation(newEmail, confirmUrl).catch((err) =>
    console.error("[email change] send failed:", err),
  );

  return NextResponse.json({ ok: true, message: "Письмо отправлено на новый адрес." });
}