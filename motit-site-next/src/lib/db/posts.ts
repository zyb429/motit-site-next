// src/lib/db/posts.ts
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type PostFeaturedImage = {
  id: number;
  url: string | null;
  name: string | null;
} | null;

export type PostListItem = {
  id: number;
  documentId: string | null;
  title: string | null;
  slug: string | null;
  excerpt: string | null;
  post_status: string | null;
  views: number | null;
  is_featured: boolean | null;
  meta_title: string | null;
  meta_description: string | null;
  publishedAt: string | null;
  updatedAt: string | null;
  author: {
    id: number;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  categories: { id: number; name: string; slug: string | null }[];
  featuredImage: PostFeaturedImage;
};

export type PostDetail = PostListItem & {
  content: unknown;
};

const POST_INCLUDE = {
  users: {
    include: {
      users_role_lnk: { include: { roles: true } },
      avatar: true,
    },
  },
  posts_categories_links: { include: { categories: true } },
  featured_image: true,
} satisfies Prisma.postsInclude;

type PostWithRelations = Prisma.postsGetPayload<{
  include: typeof POST_INCLUDE;
}>;

function mapPost(
  p: PostWithRelations,
  opts: { withContent?: boolean } = {},
): PostListItem | PostDetail {
  const base: PostListItem = {
    id: p.id,
    documentId: p.document_id ?? null,
    title: p.title ?? null,
    slug: p.slug ?? null,
    excerpt: p.excerpt ?? null,
    post_status: p.post_status ?? null,
    views: p.views ?? null,
    is_featured: p.is_featured ?? null,
    meta_title: p.meta_title ?? null,
    meta_description: p.meta_description ?? null,
    publishedAt: p.published_at ? p.published_at.toISOString() : null,
    updatedAt: p.updated_at ? p.updated_at.toISOString() : null,
    author: p.users
      ? {
          id: p.users.id,
          username: p.users.username ?? "",
          full_name: p.users.full_name ?? null,
          avatar_url: p.users.avatar?.url ?? null,
        }
      : null,
    categories:
      p.posts_categories_links
        ?.map((l) => l.categories)
        .filter((c): c is NonNullable<typeof c> => Boolean(c))
        .map((c) => ({
          id: c.id,
          name: c.name ?? "",
          slug: c.slug ?? null,
        })) ?? [],
    featuredImage: p.featured_image
      ? {
          id: p.featured_image.id,
          url: p.featured_image.url ?? null,
          name: p.featured_image.name ?? null,
        }
      : null,
  };

  if (opts.withContent) {
    return { ...base, content: p.content ?? null } as PostDetail;
  }
  return base;
}

export async function getPostsPrisma(
  options: {
    status?: "draft" | "published" | "archived";
    categorySlug?: string;
    authorUsername?: string;
    take?: number;
    skip?: number;
  } = {},
): Promise<PostListItem[]> {
  const where: Prisma.postsWhereInput = {};
  if (options.status) where.post_status = options.status;
  if (options.categorySlug) {
    where.posts_categories_links = {
      some: { categories: { slug: options.categorySlug } },
    };
  }
  if (options.authorUsername) {
    where.users = { username: options.authorUsername };
  }

  const rows = await prisma.posts.findMany({
    where,
    orderBy: [{ published_at: "desc" }],
    take: options.take ?? 100,
    skip: options.skip ?? 0,
    include: POST_INCLUDE,
  });

  return rows.map((r) => mapPost(r) as PostListItem);
}

export async function getPostBySlugPrisma(
  slug: string,
  opts: { withContent?: boolean } = {},
): Promise<PostDetail | PostListItem | null> {
  const row = await prisma.posts.findFirst({
    where: { slug, post_status: "published" },
    include: POST_INCLUDE,
  });
  if (!row) return null;
  return mapPost(row, opts);
}

export async function getPostByIdPrisma(
  id: number,
): Promise<PostDetail | PostListItem | null> {
  const row = await prisma.posts.findUnique({
    where: { id },
    include: POST_INCLUDE,
  });
  if (!row) return null;
  return mapPost(row, { withContent: true });
}

export async function countPostsPrisma(): Promise<number> {
  return prisma.posts.count();
}
