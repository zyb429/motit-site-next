// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
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
    const where: any = {};

    if (q) {
      where.OR = [
        { username: { contains: q } },
        { email: { contains: q } },
        { full_name: { contains: q } },
      ];
    }

    if (roleFilter) {
      where.users_role_lnk = {
        some: { up_roles: { name: roleFilter } },
      };
    }

    const users = await prisma.users.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: 100,
      include: {
        users_role_lnk: { include: { up_roles: true } },
      },
    });

    return NextResponse.json({
      data: users.map((u) => {
        const role = u.users_role_lnk?.[0]?.up_roles ?? null;
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
