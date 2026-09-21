// src/app/api/posts/[id]/delete/route.ts
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
    const postId = await findPostId(rawId);
    if (!postId) {
      return NextResponse.json({ error: "Пост не найден" }, { status: 404 });
    }

    // Сначала отвязываем связи
    await prisma.posts_categories_links.deleteMany({ where: { post_id: postId } });

    // Потом сам пост
    await prisma.posts.delete({ where: { id: postId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/posts/:id/delete] DELETE error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}
