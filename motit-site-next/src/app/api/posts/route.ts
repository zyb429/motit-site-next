// src/app/api/posts/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

// POST /api/posts — создать пост
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 },
      );
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
      categories,
      author,
      featured_image,
    } = payload;

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { error: "Поле title обязательно" },
        { status: 400 },
      );
    }

    const categoryIds: number[] = [];

    if (Array.isArray(categories)) {
      for (const category of categories) {
        if (typeof category === "number") {
          categoryIds.push(category);
          continue;
        }

        if (typeof category === "string") {
          const found = await prisma.categories.findFirst({
            where: {
              document_id: category,
            },
            select: {
              id: true,
            },
          });

          if (found) {
            categoryIds.push(found.id);
          }

          continue;
        }

        if (category && typeof category === "object") {
          if (category.id) {
            categoryIds.push(Number(category.id));
            continue;
          }

          if (category.documentId) {
            const found = await prisma.categories.findFirst({
              where: {
                document_id: category.documentId,
              },
              select: {
                id: true,
              },
            });

            if (found) {
              categoryIds.push(found.id);
            }
          }
        }
      }
    }

    let authorId: number | null = null;

    if (typeof author === "number") {
      authorId = author;
    } else if (typeof author === "string") {
      const found = await prisma.users.findFirst({
        where: {
          OR: [
            {
              username: author,
            },
            {
              document_id: author,
            },
          ],
        },
        select: {
          id: true,
        },
      });

      if (found) {
        authorId = found.id;
      }
    } else if (author && typeof author === "object") {
      if (author.id) {
        authorId = Number(author.id);
      } else if (author.documentId) {
        const found = await prisma.users.findFirst({
          where: {
            document_id: author.documentId,
          },
          select: {
            id: true,
          },
        });

        if (found) {
          authorId = found.id;
        }
      }
    }

    if (!authorId) {
      authorId = user.id;
    }

    const now = new Date();
    const isPublished = post_status === "published";

    // Клиент может прислать slug. Если он не указан,
    // создаём его из заголовка.
    const requestedSlug =
      typeof slug === "string" && slug.trim().length > 0
        ? slug.trim()
        : title
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\p{L}\p{N}-]+/gu, "")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "") || `post-${Date.now()}`;

    // Гарантируем уникальность slug.
    let finalSlug = requestedSlug;

    const slugExists = await prisma.posts.findFirst({
      where: {
        slug: finalSlug,
      },
      select: {
        id: true,
      },
    });

    if (slugExists) {
      const slugDate = now;

      const pad = (value: number) =>
        String(value).padStart(2, "0");

      const datePart = [
        slugDate.getFullYear(),
        pad(slugDate.getMonth() + 1),
        pad(slugDate.getDate()),
      ].join("-");

      const timePart = [
        pad(slugDate.getHours()),
        pad(slugDate.getMinutes()),
        pad(slugDate.getSeconds()),
      ].join("");

      finalSlug = `${requestedSlug}-${datePart}-${timePart}`;

      const stillExists = await prisma.posts.findFirst({
        where: {
          slug: finalSlug,
        },
        select: {
          id: true,
        },
      });

      if (stillExists) {
        finalSlug = `${requestedSlug}-${Date.now()}`;
      }
    }

    const created = await prisma.posts.create({
      data: {
        document_id: randomUUID(),
        title,
        slug: finalSlug,
        content: content ?? null,
        excerpt: excerpt ?? null,
        post_status: post_status ?? "draft",
        meta_title: meta_title ?? null,
        meta_description: meta_description ?? null,
        is_featured: is_featured ?? false,
        views: views ?? 0,
        author_id: authorId,
        featured_image_id: featured_image
          ? Number(featured_image)
          : null,
        published_at: isPublished ? now : null,
        created_at: now,
        updated_at: now,
      },
    });

    if (categoryIds.length > 0) {
      await prisma.posts_categories_links.createMany({
        data: categoryIds.map((categoryId) => ({
          post_id: created.id,
          category_id: categoryId,
        })),
        skipDuplicates: true,
      });
    }

    await logActivity({
      actorUuid: user.uuid,
      targetType: "post",
      targetId: created.id,
      action: "create",
      meta: {
        title: created.title,
        slug: created.slug,
        status: created.post_status,
      },
    });

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
  } catch (error: any) {
    console.error("[api/posts] POST error:", error);

    if (error?.code === "P2002") {
      return NextResponse.json(
        {
          error: {
            message: "Пост с таким URL (slug) уже существует",
          },
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}