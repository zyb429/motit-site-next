// src/app/api/categories/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Ищем категорию по числовому id ИЛИ по document_id
async function findCategoryId(rawId: string): Promise<number | null> {
  const num = Number(rawId);
  if (Number.isFinite(num) && num > 0) {
    const byId = await prisma.categories.findUnique({
      where: { id: num },
      select: { id: true },
    });
    if (byId) return byId.id;
  }
  const byDoc = await prisma.categories.findFirst({
    where: { document_id: rawId },
    select: { id: true },
  });
  return byDoc?.id ?? null;
}

// PUT /api/categories/:id — обновить категорию
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { id: rawId } = await params;
    const categoryId = await findCategoryId(rawId);
    if (!categoryId) {
      return NextResponse.json(
        { error: "Категория не найдена" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const payload = body?.data ?? body ?? {};

    const { name, slug, description, icon } = payload;

    const data: Record<string, unknown> = { updated_at: new Date() };
    if (name !== undefined) data.name = name;
    if (slug !== undefined) data.slug = slug;
    if (description !== undefined) data.description = description;
    if (icon !== undefined) data.icon = icon;

    if (Object.keys(data).length === 1) {
      return NextResponse.json({ error: "Нет данных" }, { status: 400 });
    }

    const updated = await prisma.categories.update({
      where: { id: categoryId },
      data,
    });

    return NextResponse.json({
      data: {
        id: updated.id,
        documentId: updated.document_id ?? null,
        name: updated.name ?? "",
        slug: updated.slug ?? null,
        description: updated.description ?? null,
        icon: updated.icon ?? null,
      },
    });
  } catch (error) {
    console.error("[api/categories/:id] PUT error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}

// DELETE /api/categories/:id — удалить категорию
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { id: rawId } = await params;
    const categoryId = await findCategoryId(rawId);
    if (!categoryId) {
      return NextResponse.json(
        { error: "Категория не найдена" },
        { status: 404 },
      );
    }

    await prisma.posts_categories_links.deleteMany({
      where: { category_id: categoryId },
    });

    await prisma.categories.delete({ where: { id: categoryId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/categories/:id] DELETE error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}
