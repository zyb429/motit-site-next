// src/app/api/lists/[listId]/items/route.ts
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ listId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { listId } = await params;
  const body = (await req.json().catch(() => ({}))) as { postId?: unknown };
  const postId = body.postId;
  if (typeof postId !== "number" || !Number.isInteger(postId) || postId <= 0) {
    return NextResponse.json({ error: "Invalid postId" }, { status: 400 });
  }

  const list = await prisma.postList.findFirst({
    where: { id: Number(listId), userId: user.id },
  });
  if (!list) return NextResponse.json({ error: "List not found" }, { status: 404 });

  await prisma.postListItem.upsert({
    where: { listId_postId: { listId: list.id, postId } },
    update: {},
    create: { listId: list.id, postId },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ listId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { listId } = await params;
  const body = (await req.json().catch(() => ({}))) as { postId?: unknown };
  const postId = body.postId;
  if (typeof postId !== "number") {
    return NextResponse.json({ error: "Invalid postId" }, { status: 400 });
  }

  await prisma.postListItem.deleteMany({
    where: {
      listId: Number(listId),
      postId,
      list: { userId: user.id },
    },
  });

  return NextResponse.json({ ok: true });
}
