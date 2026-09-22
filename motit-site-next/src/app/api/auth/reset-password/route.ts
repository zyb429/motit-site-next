// src/app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (typeof token !== "string" || !token.trim()) {
      return NextResponse.json({ error: "Неверный токен" }, { status: 400 });
    }
    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Пароль должен быть не короче 8 символов" },
        { status: 400 },
      );
    }

    const user = await prisma.users.findFirst({
      where: { reset_password_token: token.trim() },
    });

    if (!user || !user.reset_password_expires) {
      return NextResponse.json(
        { error: "Ссылка недействительна" },
        { status: 400 },
      );
    }

    if (user.reset_password_expires < new Date()) {
      return NextResponse.json(
        { error: "Ссылка истекла, запросите новую" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.users.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        reset_password_token: null,
        reset_password_expires: null,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/auth/reset-password] error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}
