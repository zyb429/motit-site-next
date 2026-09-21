// src/app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) return null;
  return user;
}

// PATCH /api/admin/users/:id — смена роли / blocked / full_name / phone
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  try {
    const { id: rawId } = await params;
    const userId = Number(rawId);
    if (!Number.isFinite(userId) || userId <= 0) {
      return NextResponse.json({ error: "Неверный id" }, { status: 400 });
    }

    const body = await request.json();
    const { roleId, blocked, full_name, phone } = body ?? {};

    // 1. Смена роли
    if (roleId !== undefined) {
      if (admin.id === userId) {
        return NextResponse.json(
          { error: "Нельзя изменить свою собственную роль" },
          { status: 400 },
        );
      }

      const roleExists = await prisma.roles.findUnique({
        where: { id: Number(roleId) },
      });
      if (!roleExists) {
        return NextResponse.json({ error: "Роль не найдена" }, { status: 400 });
      }

      await prisma.users_role_lnk.deleteMany({ where: { user_id: userId } });
      await prisma.users_role_lnk.create({
        data: { user_id: userId, role_id: Number(roleId) },
      });

      const updated = await prisma.users.findUnique({
        where: { id: userId },
        include: { users_role_lnk: { include: { roles: true } } },
      });

      const role = updated?.users_role_lnk?.[0]?.roles ?? null;

      return NextResponse.json({
        data: {
          id: updated?.id,
          username: updated?.username ?? "",
          email: updated?.email ?? "",
          full_name: updated?.full_name ?? null,
          phone: updated?.phone ?? null,
          blocked: updated?.blocked ?? false,
          role: role
            ? { id: role.id, name: role.name ?? "" }
            : null,
        },
      });
    }

    // 2. Обновление остальных полей
    const data: Record<string, unknown> = {};
    if (blocked !== undefined) {
      if (admin.id === userId && blocked === true) {
        return NextResponse.json(
          { error: "Нельзя заблокировать самого себя" },
          { status: 400 },
        );
      }
      data.blocked = blocked;
    }
    if (full_name !== undefined) data.full_name = full_name;
    if (phone !== undefined) data.phone = phone;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Нет данных" }, { status: 400 });
    }

    data.updated_at = new Date();

    const updated = await prisma.users.update({
      where: { id: userId },
      data,
      include: { users_role_lnk: { include: { roles: true } } },
    });

    const role = updated.users_role_lnk?.[0]?.roles ?? null;

    return NextResponse.json({
      data: {
        id: updated.id,
        username: updated.username ?? "",
        email: updated.email ?? "",
        full_name: updated.full_name ?? null,
        phone: updated.phone ?? null,
        blocked: updated.blocked ?? false,
        role: role
          ? { id: role.id, name: role.name ?? "" }
          : null,
      },
    });
  } catch (error) {
    console.error("[api/admin/users/:id] PATCH error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/users/:id
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  try {
    const { id: rawId } = await params;
    const userId = Number(rawId);

    if (!Number.isFinite(userId) || userId <= 0) {
      return NextResponse.json({ error: "Неверный id" }, { status: 400 });
    }

    if (admin.id === userId) {
      return NextResponse.json(
        { error: "Нельзя удалить самого себя" },
        { status: 400 },
      );
    }

    // Отвязываем роли. Остальные связи удалятся каскадом (FK ON DELETE CASCADE/SET NULL).
    await prisma.users_role_lnk.deleteMany({ where: { user_id: userId } });

    await prisma.users.delete({ where: { id: userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/admin/users/:id] DELETE error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}
