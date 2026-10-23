// src/lib/post-versions.ts
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@generated/prisma"

const MAX_VERSIONS = 50 // ← лимит версий на пост

export async function snapshotPost(postId: number, userId: number | null) {
  const post = await prisma.posts.findUnique({
    where: { id: postId },
    select: {
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      post_status: true,
      meta_title: true,
      meta_description: true,
    },
  })
  if (!post) return null

  const created = await prisma.postVersion.create({
    data: {
      post_id: postId,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content as Prisma.InputJsonValue,
      post_status: post.post_status,
      meta_title: post.meta_title,
      meta_description: post.meta_description,
      created_by_id: userId ?? null,
    },
  })

  // Ограничение: удаляем версии старше последних MAX_VERSIONS
  const old = await prisma.postVersion.findMany({
    where: { post_id: postId },
    orderBy: { created_at: "desc" },
    skip: MAX_VERSIONS,
    select: { id: true },
  })

  if (old.length > 0) {
    await prisma.postVersion.deleteMany({
      where: { id: { in: old.map((v) => v.id) } },
    })
  }

  return created
}

export async function rollbackToVersion(postId: number, versionId: number) {
  const version = await prisma.postVersion.findUnique({
    where: { id: versionId },
  })
  if (!version || version.post_id !== postId) {
    throw new Error("Версия не найдена или принадлежит другому посту")
  }

  return prisma.posts.update({
    where: { id: postId },
    data: {
      title: version.title,
      slug: version.slug,
      excerpt: version.excerpt,
      content: version.content as Prisma.InputJsonValue,
      post_status: version.post_status,
      meta_title: version.meta_title,
      meta_description: version.meta_description,
      updated_at: new Date(),
    },
  })
}