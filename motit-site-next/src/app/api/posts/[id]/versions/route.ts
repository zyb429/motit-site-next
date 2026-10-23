// src/app/api/posts/[id]/versions/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

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
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser()
  if (!user) return new NextResponse("Unauthorized", { status: 401 })

  const { id: rawId } = await params
  const postId = await findPostId(rawId)

  console.log("[versions] rawId =", rawId, "| postId =", postId)

  if (!postId) return new NextResponse("Post not found", { status: 404 })

  const versions = await prisma.postVersion.findMany({
    where: { post_id: postId },
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      title: true,
      created_at: true,
      created_by: {
        select: { id: true, full_name: true, username: true },
      },
    },
  })

  console.log("[versions] found", versions.length, "for post_id =", postId)

  return NextResponse.json(versions)
}