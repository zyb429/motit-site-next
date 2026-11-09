// src/app/api/favorites/[postId]/route.ts
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { postId } = await params;
  const id = Number(postId);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid postId" }, { status: 400 });
  }

  await prisma.favorite.deleteMany({
    where: { userId: user.id, postId: id },
  });

  return NextResponse.json({ ok: true });
}
