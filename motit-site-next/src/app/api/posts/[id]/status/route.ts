// src/app/api/posts/[id]/status/route.ts
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

export async function PATCH(
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
    const { post_status } = body;

    if (!post_status) {
      return NextResponse.json(
        { error: "Нужен post_status" },
        { status: 400 },
      );
    }

    const now = new Date();

    const updated = await prisma.posts.update({
      where: { id: postId },
      data: {
        post_status,
        published_at: post_status === "published" ? now : null,
        updated_at: now,
      },
    });

    return NextResponse.json({
      data: {
        id: updated.id,
        documentId: updated.document_id ?? null,
        post_status: updated.post_status ?? null,
        publishedAt: updated.published_at?.toISOString() ?? null,
      },
    });
  } catch (error) {
    console.error("[api/posts/:id/status] PATCH error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}
