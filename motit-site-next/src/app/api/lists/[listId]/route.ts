// src/app/api/lists/[listId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ listId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { listId } = await params;
  const list = await prisma.postList.findFirst({
    where: { id: Number(listId), userId: user.id },
  });
  if (!list) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.postList.delete({ where: { id: list.id } });
  return NextResponse.json({ ok: true });
}