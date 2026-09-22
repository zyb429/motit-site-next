// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) return null;
  return user;
}

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  try {
    const url = new URL(request.url);
    const q = (url.searchParams.get("q") ?? "").trim();
    const roleFilter = (url.searchParams.get("role") ?? "").trim();

    // Формируем where
    const where: Prisma.usersWhereInput = {};

    if (q) {
      where.OR = [
        { username: { contains: q } },
        { email: { contains: q } },
        { full_name: { contains: q } },
      ];
    }

    if (roleFilter) {
      where.users_role_lnk = {
        some: { roles: { name: roleFilter } },
      };
    }

    const users = await prisma.users.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: 100,
      include: {
        users_role_lnk: { include: { roles: true } },
      },
    });

    return NextResponse.json({
      data: users.map((u) => {
        const role = u.users_role_lnk?.[0]?.roles ?? null;
        return {
          id: u.id,
          documentId: u.document_id ?? null,
          username: u.username ?? "",
          email: u.email ?? "",
          full_name: u.full_name ?? null,
          phone: u.phone ?? null,
          blocked: u.blocked ?? false,
          confirmed: u.confirmed ?? false,
          createdAt: u.created_at?.toISOString() ?? null,
          avatar: null,
          role: role
            ? { id: role.id, name: role.name ?? "", type: role.type ?? "" }
            : null,
        };
      }),
    });
  } catch (error) {
    console.error("[api/admin/users] GET error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { username, email, password, full_name, phone, roleId } = body ?? {};

    // ===== Валидация =====
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
    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Пароль должен быть не короче 6 символов" },
        { status: 400 },
      );
    }

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();

    // ===== Проверка занятости =====
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

    // ===== Проверка роли =====
    let roleIdNum: number | null = null;
    if (roleId !== undefined && roleId !== null && roleId !== "") {
      const roleExists = await prisma.roles.findUnique({
        where: { id: Number(roleId) },
      });
      if (!roleExists) {
        return NextResponse.json({ error: "Роль не найдена" }, { status: 400 });
      }
      roleIdNum = Number(roleId);
    }

    // ===== Создание =====
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.users.create({
        data: {
          username: trimmedUsername,
          email: trimmedEmail,
          password: hashedPassword,
          full_name:
            typeof full_name === "string" && full_name.trim()
              ? full_name.trim()
              : null,
          phone:
            typeof phone === "string" && phone.trim() ? phone.trim() : null,
          confirmed: true, // в админке создаём сразу подтверждённым
          blocked: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      if (roleIdNum != null) {
        await tx.users_role_lnk.create({
          data: { user_id: created.id, role_id: roleIdNum },
        });
      }

      return created;
    });

    const role = roleIdNum
      ? await prisma.roles.findUnique({ where: { id: roleIdNum } })
      : null;

    return NextResponse.json({
      data: {
        id: user.id,
        documentId: user.document_id ?? null,
        username: user.username ?? "",
        email: user.email ?? "",
        full_name: user.full_name ?? null,
        phone: user.phone ?? null,
        blocked: user.blocked ?? false,
        confirmed: user.confirmed ?? false,
        createdAt: user.created_at?.toISOString() ?? null,
        avatar: null,
        role: role
          ? { id: role.id, name: role.name ?? "", type: role.type ?? "" }
          : null,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const target = (error.meta?.target as string[] | undefined) ?? [];
      const field = target.includes("email")
        ? "Email"
        : target.includes("username")
          ? "Username"
          : "Значение";
      return NextResponse.json(
        { error: `${field} уже занят` },
        { status: 409 },
      );
    }
    console.error("[api/admin/users] POST error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}
