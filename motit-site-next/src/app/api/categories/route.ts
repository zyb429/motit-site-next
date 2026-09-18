// src/app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { randomUUID } from "crypto";

// GET /api/categories — список категорий
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Number(searchParams.get("page") ?? "1") || 1;
    const pageSize = Number(searchParams.get("pageSize") ?? "100") || 100;
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      prisma.categories.findMany({
        orderBy: { name: "asc" },
        skip,
        take: pageSize,
      }),
      prisma.categories.count(),
    ]);

    return NextResponse.json({
      data: items.map((c) => ({
        id: c.id,
        documentId: c.document_id ?? null,
        name: c.name ?? "",
        slug: c.slug ?? null,
        description: c.description ?? null,
        icon: c.icon ?? null,
      })),
      meta: {
        pagination: {
          page,
          pageSize,
          pageCount: Math.ceil(total / pageSize),
          total,
        },
      },
    });
  } catch (error) {
    console.error("[api/categories] GET error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}

// POST /api/categories — создать категорию
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const body = await request.json();
    // фронт может передавать { data: { name, slug, ... } } или { name, slug, ... }
    const payload = body?.data ?? body;

    const { name, slug, description, icon } = payload ?? {};

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Поле name обязательно" },
        { status: 400 },
      );
    }

    const created = await prisma.categories.create({
      data: {
        document_id: randomUUID(),
        name,
        slug: slug ?? name.toLowerCase().replace(/\s+/g, "-"),
        description: description ?? null,
        icon: icon ?? null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      data: {
        id: created.id,
        documentId: created.document_id ?? null,
        name: created.name ?? "",
        slug: created.slug ?? null,
        description: created.description ?? null,
        icon: created.icon ?? null,
      },
    });
  } catch (error) {
    console.error("[api/categories] POST error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}
