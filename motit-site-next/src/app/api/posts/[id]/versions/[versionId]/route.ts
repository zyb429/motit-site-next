// src/app/api/posts/[id]/versions/[versionId]/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { renderPostContent } from "@/lib/render-post"

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

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string; versionId: string }> },
) {
  const user = await getCurrentUser()
  if (!user) return new NextResponse("Unauthorized", { status: 401 })

  const { id: rawId, versionId } = await params
  const postId = await findPostId(rawId)
  if (!postId) return new NextResponse("Post not found", { status: 404 })

  const vId = Number(versionId)
  if (!Number.isInteger(vId) || vId <= 0) {
    return new NextResponse("Bad version id", { status: 400 })
  }

  const version = await prisma.postVersion.findFirst({
    where: { id: vId, post_id: postId },
  })
  if (!version) return new NextResponse("Version not found", { status: 404 })

  return NextResponse.json({
    version,
    html: renderPostContent(version.content),
  })
}