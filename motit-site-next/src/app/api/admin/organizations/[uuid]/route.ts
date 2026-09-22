// src/app/api/admin/organizations/[uuid]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) return null;
  return user;
}

// PATCH /api/admin/organizations/:uuid
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  try {
    const { uuid } = await params;
    const body = await request.json();
    const { name, inn, address, email, phone, is_active } = body ?? {};

    const data: Record<string, unknown> = { updated_at: new Date() };

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length < 2) {
        return NextResponse.json(
          { error: "Название должно быть не короче 2 символов" },
          { status: 400 },
        );
      }
      data.name = name.trim();
    }
    if (inn !== undefined) {
      data.inn = typeof inn === "string" && inn.trim() ? inn.trim() : null;
    }
    if (address !== undefined) {
      data.address =
        typeof address === "string" && address.trim() ? address.trim() : null;
    }
    if (email !== undefined) {
      data.email =
        typeof email === "string" && email.trim() ? email.trim() : null;
    }
    if (phone !== undefined) {
      data.phone =
        typeof phone === "string" && phone.trim() ? phone.trim() : null;
    }
    if (is_active !== undefined) {
      data.is_active = Boolean(is_active);
    }

    const org = await prisma.organizations.update({
      where: { uuid },
      data,
    });

    return NextResponse.json({ organization: org });
  } catch (error) {
    console.error("[api/admin/organizations/:uuid] PATCH error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/organizations/:uuid
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  try {
    const { uuid } = await params;

    // Сначала отвязываем пользователей (иначе FK может не дать удалить)
    await prisma.client_organizations.deleteMany({
      where: { organization_uuid: uuid },
    });

    await prisma.organizations.delete({ where: { uuid } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/admin/organizations/:uuid] DELETE error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}
