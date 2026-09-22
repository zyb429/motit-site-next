// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password, full_name, phone } = body ?? {};

    // Валидация
    if (typeof username !== "string" || username.trim().length < 3) {
      return NextResponse.json(
        { error: "Username должен быть не короче 3 символов" },
        { status: 400 },
      );
    }
    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return NextResponse.json({ error: "Некорректный email" }, { status: 400 });
    }
    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Пароль должен быть не короче 8 символов" },
        { status: 400 },
      );
    }
    if (typeof phone !== "string" || !phone.trim()) {
      return NextResponse.json(
        { error: "Телефон обязателен" },
        { status: 400 },
      );
    }
    if (!/^\+?[0-9\s\-()]{7,20}$/.test(phone.trim())) {
      return NextResponse.json(
        { error: "Некорректный номер телефона" },
        { status: 400 },
      );
    }

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();

    // Проверка занятости username/email
    const existing = await prisma.users.findFirst({
      where: {
        OR: [{ username: trimmedUsername }, { email: trimmedEmail }],
      },
    });
    if (existing) {
      const field = existing.email === trimmedEmail ? "Email" : "Username";
      return NextResponse.json(
        { error: `${field} уже занят` },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаём пользователя. uuid и created_at/updated_at
    // имеют default в схеме, поэтому можно не передавать.
    const user = await prisma.users.create({
      data: {
        username: trimmedUsername,
        email: trimmedEmail,
        password: hashedPassword,
        full_name:
          typeof full_name === "string" && full_name.trim()
            ? full_name.trim()
            : null,
        phone: phone.trim(),
        confirmed: false,
        blocked: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Назначаем роль "client" по умолчанию
    const defaultRole = await prisma.roles.findFirst({
      where: { name: "client" },
    });
    if (defaultRole) {
      await prisma.users_role_lnk.create({
        data: { user_id: user.id, role_id: defaultRole.id },
      });
    }

    return NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error("[api/auth/register] error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}
