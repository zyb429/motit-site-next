// src/app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// POST /api/posts — создать пост
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const body = await request.json();
    const payload = body?.data ?? body ?? {};

    const {
      title,
      slug,
      content,
      excerpt,
      post_status,
      meta_title,
      meta_description,
      is_featured,
      views,
      categories, // массив id, document_id или объекты { id }
      author, // id, document_id или объект
      featured_image,
    } = payload;

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { error: "Поле title обязательно" },
        { status: 400 },
      );
    }

    // Разбираем категории: массив id/строк/объектов
    const categoryIds: number[] = [];
    if (Array.isArray(categories)) {
      for (const c of categories) {
        if (typeof c === "number") {
          categoryIds.push(c);
        } else if (typeof c === "string") {
          const found = await prisma.categories.findFirst({
            where: { document_id: c },
            select: { id: true },
          });
          if (found) categoryIds.push(found.id);
        } else if (c && typeof c === "object" && c.id) {
          categoryIds.push(Number(c.id));
        } else if (c && typeof c === "object" && c.documentId) {
          const found = await prisma.categories.findFirst({
            where: { document_id: c.documentId },
            select: { id: true },
          });
          if (found) categoryIds.push(found.id);
        }
      }
    }

    // Разбираем автора
    let authorId: number | null = null;
    if (typeof author === "number") {
      authorId = author;
    } else if (typeof author === "string") {
      const found = await prisma.users.findFirst({
        where: { OR: [{ username: author }, { document_id: author }] },
        select: { id: true },
      });
      if (found) authorId = found.id;
    } else if (author && typeof author === "object") {
      if (author.id) authorId = Number(author.id);
      else if (author.documentId) {
        const found = await prisma.users.findFirst({
          where: { document_id: author.documentId },
          select: { id: true },
        });
        if (found) authorId = found.id;
      }
    }
    // если author не задан — считаем текущего пользователя
    if (!authorId) authorId = user.id;

    const now = new Date();
    const isPublished = post_status === "published";

    const created = await prisma.posts.create({
      data: {
        document_id: randomUUID(),
        title,
        slug: slug ?? title.toLowerCase().replace(/\s+/g, "-"),
        content: content ?? null,
        excerpt: excerpt ?? null,
        post_status: post_status ?? "draft",
        meta_title: meta_title ?? null,
        meta_description: meta_description ?? null,
        is_featured: is_featured ?? false,
        views: views ?? 0,
        author_id: authorId,
        featured_image_id: featured_image ? Number(featured_image) : null,
        published_at: isPublished ? now : null,
        created_at: now,
        updated_at: now,
      },
    });

    // Связи с категориями
    if (categoryIds.length > 0) {
      await prisma.posts_categories_lnk.createMany({
        data: categoryIds.map((categoryId) => ({
          post_id: created.id,
          category_id: categoryId,
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json({
      data: {
        id: created.id,
        documentId: created.document_id ?? null,
        title: created.title ?? "",
        slug: created.slug ?? null,
        post_status: created.post_status ?? null,
        publishedAt: created.published_at?.toISOString() ?? null,
      },
    });
  } catch (error) {
    console.error("[api/posts] POST error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}
