// src/app/api/posts/[id]/versions/[versionId]/rollback/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { rollbackToVersion } from "@/lib/post-versions"

export const dynamic = "force-dynamic"

async function findPostId(rawId: string): Promise<number | null> {
  const num = Number(rawId)
  if (Number.isFinite(num) && num > 0) {
    const byId = await prisma.posts.findUnique({
      where: { id: num },
      select: { id: true },
    })
    if (byId) return byId.id
  }
  const byDoc = await prisma.posts.findFirst({
    where: { document_id: rawId },
    select: { id: true },
  })
  return byDoc?.id ?? null
}

export async function POST(
  _: Request,
  { params }: { params: Promise<{ id: string; versionId: string }> },
) {
  const user = await getCurrentUser()
  if (!user) return new NextResponse("Unauthorized", { status: 401 })

  const { id: rawId, versionId } = await params
  const postId = await findPostId(rawId)
  if (!postId) return new NextResponse("Post not found", { status: 404 })

  try {
    const updated = await rollbackToVersion(postId, Number(versionId))
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Rollback failed" },
      { status: 400 },
    )
  }
}