// src/app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function findPostId(rawId: string): Promise<number | null> {
  const num = Number(rawId);
  if (Number.isFinite(num) && num > 0) {
    const byId = await prisma.posts.findUnique({
      where: { id: num },
      select: { id: true },
    });
    if (byId) return byId.id;
  }
  const byDoc = await prisma.posts.findFirst({
    where: { document_id: rawId },
    select: { id: true },
  });
  return byDoc?.id ?? null;
}

// GET /api/posts/:id
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await params;
    const postId = await findPostId(rawId);
    if (!postId) {
      return NextResponse.json({ error: "Пост не найден" }, { status: 404 });
    }

    const post = await prisma.posts.findUnique({
      where: { id: postId },
      include: {
        author: { include: { avatar: true } },
        posts_categories_links: {
          include: { categories: true },
        },
        featured_image: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Пост не найден" }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        id: post.id,
        documentId: post.document_id ?? null,
        title: post.title ?? "",
        slug: post.slug ?? null,
        content: post.content ?? null,
        excerpt: post.excerpt ?? null,
        post_status: post.post_status ?? null,
        views: post.views ?? 0,
        is_featured: post.is_featured ?? false,
        meta_title: post.meta_title ?? null,
        meta_description: post.meta_description ?? null,
        publishedAt: post.published_at?.toISOString() ?? null,
        updatedAt: post.updated_at?.toISOString() ?? null,
        featured_image: post.featured_image
          ? {
            id: post.featured_image.id,
            url: post.featured_image.url ?? null,
            name: post.featured_image.name ?? null,
          }
          : null,
        author: post.author
          ? {
            id: post.author.id,
            username: post.author.username ?? "",
            full_name: post.author.full_name ?? null,
          }
          : null,
        categories:
          post.posts_categories_links
            ?.map((l) => l.categories)
            .filter(Boolean)
            .map((c) => ({
              id: c.id,
              documentId: c.document_id ?? null,
              name: c.name ?? "",
              slug: c.slug ?? null,
            })) ?? [],
      },
    });
  } catch (error) {
    console.error("[api/posts/:id] GET error:", error);
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}

// PUT /api/posts/:id
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
    const postId = await findPostId(rawId);
    if (!postId) {
      return NextResponse.json({ error: "Пост не найден" }, { status: 404 });
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

    const now = new Date();
    const data: Record<string, unknown> = { updated_at: now };

    if (title !== undefined) data.title = title;
    if (slug !== undefined) data.slug = slug;
    if (content !== undefined) data.content = content;
    if (excerpt !== undefined) data.excerpt = excerpt;
    if (meta_title !== undefined) data.meta_title = meta_title;
    if (meta_description !== undefined)
      data.meta_description = meta_description;
    if (is_featured !== undefined) data.is_featured = is_featured;
    if (views !== undefined) data.views = views;

    // Featured image
    if (featured_image !== undefined) {
      data.featured_image_id = featured_image ? Number(featured_image) : null;
    }

    if (post_status !== undefined) {
      data.post_status = post_status;
      data.published_at = post_status === "published" ? now : null;
    }

    // Автор
    if (author !== undefined) {
      if (typeof author === "number") data.author_id = author;
      else if (typeof author === "string") {
        const found = await prisma.users.findFirst({
          where: { OR: [{ username: author }, { document_id: author }] },
          select: { id: true },
        });
        data.author_id = found?.id ?? null;
      } else if (author && typeof author === "object") {
        if (author.id) data.author_id = Number(author.id);
        else if (author.documentId) {
          const found = await prisma.users.findFirst({
            where: { document_id: author.documentId },
            select: { id: true },
          });
          data.author_id = found?.id ?? null;
        }
      }
    }

    const updated = await prisma.posts.update({
      where: { id: postId },
      data,
      include: { featured_image: true },
    });

    // Категории — заменяем связи
    if (Array.isArray(categories)) {
      const categoryIds: number[] = [];
      for (const c of categories) {
        if (typeof c === "number") categoryIds.push(c);
        else if (typeof c === "string") {
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

      await prisma.posts_categories_links.deleteMany({
        where: { post_id: postId },
      });
      if (categoryIds.length > 0) {
        await prisma.posts_categories_links.createMany({
          data: categoryIds.map((categoryId) => ({
            post_id: postId,
            category_id: categoryId,
          })),
          skipDuplicates: true,
        });
      }
    }

    return NextResponse.json({
      data: {
        id: updated.id,
        documentId: updated.document_id ?? null,
        title: updated.title ?? "",
        slug: updated.slug ?? null,
        post_status: updated.post_status ?? null,
        publishedAt: updated.published_at?.toISOString() ?? null,
        updatedAt: updated.updated_at?.toISOString() ?? null,
        featured_image: updated.featured_image
          ? {
            id: updated.featured_image.id,
            url: updated.featured_image.url ?? null,
            name: updated.featured_image.name ?? null,
          }
          : null,
      },
    });
  } catch (error) {
    console.error("[api/posts/:id] PUT error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}
