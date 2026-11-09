// src/app/api/posts/[id]/save-state/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ favorited: false, listIds: [] });

  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const [favorite, listItems] = await Promise.all([
    prisma.favorite.findUnique({
      where: { userId_postId: { userId: user.id, postId } },
    }),
    prisma.postListItem.findMany({
      where: { postId, list: { userId: user.id } },
      select: { listId: true },
    }),
  ]);

  return NextResponse.json({
    favorited: !!favorite,
    listIds: listItems.map((i) => i.listId),
  });
}