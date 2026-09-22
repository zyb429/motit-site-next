// src/app/api/admin/organizations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) return null;
  return user;
}

// GET /api/admin/organizations?q=&take=&skip=
export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const take = Math.min(Number(url.searchParams.get("take") ?? 100), 500);
  const skip = Math.max(Number(url.searchParams.get("skip") ?? 0), 0);

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { inn: { contains: q } },
      { email: { contains: q } },
      { phone: { contains: q } },
      { address: { contains: q } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.organizations.findMany({
      where,
      orderBy: { name: "asc" },
      take,
      skip,
      include: {
        _count: { select: { client_organizations: true } },
      },
    }),
    prisma.organizations.count({ where }),
  ]);

  return NextResponse.json({
    items: items.map((o) => ({
      uuid: o.uuid,
      name: o.name,
      inn: o.inn,
      email: o.email,
      phone: o.phone,
      address: o.address,
      is_active: o.is_active,
      clientsCount: o._count.client_organizations,
    })),
    total,
  });
}

// POST /api/admin/organizations
export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, inn, address, email, phone } = body ?? {};

    if (typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Название должно быть не короче 2 символов" },
        { status: 400 },
      );
    }

    const org = await prisma.organizations.create({
      data: {
        name: name.trim(),
        inn: typeof inn === "string" && inn.trim() ? inn.trim() : null,
        address:
          typeof address === "string" && address.trim() ? address.trim() : null,
        email:
          typeof email === "string" && email.trim() ? email.trim() : null,
        phone:
          typeof phone === "string" && phone.trim() ? phone.trim() : null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ organization: org });
  } catch (error) {
    console.error("[api/admin/organizations] POST error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}
