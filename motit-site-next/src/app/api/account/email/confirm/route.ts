// src/app/api/account/email/confirm/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { token } = await req.json().catch(() => ({}));

  if (typeof token !== "string" || !token) {
    return NextResponse.json({ error: "Токен не передан" }, { status: 400 });
  }

  const record = await prisma.emailChangeToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!record) {
    return NextResponse.json(
      { error: "Ссылка недействительна или уже использована" },
      { status: 400 },
    );
  }

  if (record.expires_at < new Date()) {
    await prisma.emailChangeToken.delete({ where: { id: record.id } });
    return NextResponse.json({ error: "Срок действия ссылки истёк" }, { status: 400 });
  }

  const taken = await prisma.users.findUnique({ where: { email: record.new_email } });
  if (taken && taken.id !== record.user.id) {
    await prisma.emailChangeToken.delete({ where: { id: record.id } });
    return NextResponse.json(
      { error: "Email уже занят другим пользователем" },
      { status: 409 },
    );
  }

  await prisma.$transaction([
    prisma.users.update({
      where: { id: record.user.id },
      data: { email: record.new_email },
    }),
    prisma.emailChangeToken.delete({ where: { id: record.id } }),
  ]);

  return NextResponse.json({ ok: true });
}