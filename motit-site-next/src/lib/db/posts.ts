import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

// ==================== TYPES ====================

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
};

export type PostDetail = PostListItem & {
  content: unknown;
};

// ==================== MAPPER ====================

function mapPost(
  p: any,
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
    publishedAt: p.published_at?.toISOString() ?? null,
    updatedAt: p.updated_at?.toISOString() ?? null,
    author: p.users
      ? {
          id: p.users.id,
          username: p.users.username ?? "",
          full_name: p.users.full_name ?? null,
          avatar_url: p.users.users_role_lnk?.[0]?.up_roles?.type ?? null,
        }
      : null,
    categories:
      p.posts_categories_lnk
        ?.map((l: any) => l.categories)
        .filter(Boolean)
        .map((c: any) => ({
          id: c.id,
          name: c.name ?? "",
          slug: c.slug ?? null,
        })) ?? [],
  };

  if (opts.withContent) {
    return { ...base, content: p.content ?? null } as PostDetail;
  }
  return base;
}

// ==================== QUERIES ====================

export async function getPostsPrisma(options: {
  status?: "draft" | "published" | "archived";
  categorySlug?: string;
  authorUsername?: string;
  take?: number;
  skip?: number;
} = {}): Promise<PostListItem[]> {
  const where: Prisma.postsWhereInput = {};

  if (options.status) where.post_status = options.status;

  if (options.categorySlug) {
    where.posts_categories_lnk = {
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
    include: {
      users: { include: { users_role_lnk: { include: { up_roles: true } } } },
      posts_categories_lnk: { include: { categories: true } },
    },
  });

  return rows.map((r) => mapPost(r) as PostListItem);
}

export async function getPostBySlugPrisma(
  slug: string,
  opts: { withContent?: boolean } = {},
): Promise<PostDetail | PostListItem | null> {
  const row = await prisma.posts.findFirst({
    where: { slug, post_status: "published" },
    include: {
      users: { include: { users_role_lnk: { include: { up_roles: true } } } },
      posts_categories_lnk: { include: { categories: true } },
    },
  });
  if (!row) return null;
  return mapPost(row, opts) as any;
}

export async function getPostByIdPrisma(
  id: number,
): Promise<PostDetail | PostListItem | null> {
  const row = await prisma.posts.findUnique({
    where: { id },
    include: {
      users: { include: { users_role_lnk: { include: { up_roles: true } } } },
      posts_categories_lnk: { include: { categories: true } },
    },
  });
  if (!row) return null;
  return mapPost(row, { withContent: true }) as any;
}

export async function countPostsPrisma(): Promise<number> {
  return prisma.posts.count();
}
