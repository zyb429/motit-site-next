// src/app/api/admin/users/[id]/organizations/[uuid]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) return null;
  return user;
}

// PATCH /api/admin/users/:id/organizations/:uuid
// Body: { roleInCompany?: string, isPrimary?: boolean }
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; uuid: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  try {
    const { id: rawId, uuid } = await params;
    const userId = Number(rawId);
    if (!Number.isFinite(userId) || userId <= 0) {
      return NextResponse.json({ error: "Неверный id" }, { status: 400 });
    }

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const { roleInCompany, isPrimary } = body ?? {};

    const data: Record<string, unknown> = { updated_at: new Date() };

    if (roleInCompany !== undefined) {
      data.role_in_company =
        typeof roleInCompany === "string" && roleInCompany.trim()
          ? roleInCompany.trim()
          : "member";
    }

    if (isPrimary !== undefined) {
      if (Boolean(isPrimary)) {
        await prisma.client_organizations.updateMany({
          where: {
            client_user_uuid: user.uuid,
            NOT: { organization_uuid: uuid },
          },
          data: { is_primary: false },
        });
      }
      data.is_primary = Boolean(isPrimary);
    }

    const updated = await prisma.client_organizations.update({
      where: {
        client_user_uuid_organization_uuid: {
          client_user_uuid: user.uuid,
          organization_uuid: uuid,
        },
      },
      data,
      include: { organizations: true },
    });

    return NextResponse.json({
      link: {
        uuid: updated.organizations.uuid,
        name: updated.organizations.name,
        inn: updated.organizations.inn ?? null,
        role_in_company: updated.role_in_company ?? "member",
        is_primary: updated.is_primary ?? false,
        is_active: updated.organizations.is_active ?? true,
      },
    });
  } catch (error) {
    console.error(
      "[api/admin/users/:id/organizations/:uuid] PATCH error:",
      error,
    );
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/users/:id/organizations/:uuid
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; uuid: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  try {
    const { id: rawId, uuid } = await params;
    const userId = Number(rawId);
    if (!Number.isFinite(userId) || userId <= 0) {
      return NextResponse.json({ error: "Неверный id" }, { status: 400 });
    }

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 },
      );
    }

    await prisma.client_organizations.delete({
      where: {
        client_user_uuid_organization_uuid: {
          client_user_uuid: user.uuid,
          organization_uuid: uuid,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      "[api/admin/users/:id/organizations/:uuid] DELETE error:",
      error,
    );
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}
