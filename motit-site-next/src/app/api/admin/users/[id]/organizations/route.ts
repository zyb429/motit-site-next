// src/app/api/admin/users/[id]/organizations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) return null;
  return user;
}

// POST /api/admin/users/:id/organizations
// Body: { organizationUuid: string, roleInCompany?: string, isPrimary?: boolean }
export async function POST(
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
    const { organizationUuid, roleInCompany, isPrimary } = body ?? {};

    if (typeof organizationUuid !== "string" || !organizationUuid.trim()) {
      return NextResponse.json(
        { error: "Не указана организация" },
        { status: 400 },
      );
    }

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 },
      );
    }

    const org = await prisma.organizations.findUnique({
      where: { uuid: organizationUuid.trim() },
    });
    if (!org) {
      return NextResponse.json(
        { error: "Организация не найдена" },
        { status: 404 },
      );
    }

    const existing = await prisma.client_organizations.findUnique({
      where: {
        client_user_uuid_organization_uuid: {
          client_user_uuid: user.uuid,
          organization_uuid: org.uuid,
        },
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Пользователь уже привязан к этой организации" },
        { status: 409 },
      );
    }

    if (isPrimary) {
      await prisma.client_organizations.updateMany({
        where: { client_user_uuid: user.uuid },
        data: { is_primary: false },
      });
    }

    const link = await prisma.client_organizations.create({
      data: {
        client_user_uuid: user.uuid,
        organization_uuid: org.uuid,
        role_in_company:
          typeof roleInCompany === "string" && roleInCompany.trim()
            ? roleInCompany.trim()
            : "member",
        is_primary: Boolean(isPrimary),
        joined_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
      include: { organizations: true },
    });

    return NextResponse.json({
      link: {
        uuid: link.organizations.uuid,
        name: link.organizations.name,
        inn: link.organizations.inn ?? null,
        role_in_company: link.role_in_company ?? "member",
        is_primary: link.is_primary ?? false,
        is_active: link.organizations.is_active ?? true,
      },
    });
  } catch (error) {
    console.error(
      "[api/admin/users/:id/organizations] POST error:",
      error,
    );
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}
