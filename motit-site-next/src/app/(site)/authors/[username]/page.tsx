import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { User, FileText } from "lucide-react";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/db/site-settings";
import type { LanguageCode } from "@/lib/i18n";
import { BackButton } from "@/components/blog/BackButton";
import { AuthorPosts } from "@/components/blog/AuthorPosts";
import { parseView } from "@/lib/view";

interface AuthorPageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ view?: string }>;
}

async function getAuthor(username: string) {
  const user = await prisma.users.findFirst({
    where: { username },
    include: { avatar: true },
  });

  if (!user) return null;

  return {
    id: user.id,
    username: user.username ?? "",
    full_name: user.full_name ?? null,
    bio: user.bio ?? null,
    avatar_url: user.avatar?.url ?? null,
  };
}

async function getPostsByAuthorPrisma(username: string) {
  const user = await prisma.users.findFirst({
    where: { username },
    select: { id: true },
  });

  if (!user) return [];

  const rows = await prisma.posts.findMany({
    where: {
      post_status: "published",
      OR: [
        {
          author_id: user.id,
        },
        {
          collaborators: {
            some: {
              user_id: user.id,
            },
          },
        },
      ],
    },
    orderBy: [{ published_at: "desc" }],
    take: 50,
    include: {
      author: {
        include: {
          avatar: true,
        },
      },
      collaborators: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              full_name: true,
              avatar_url: true,
            },
          },
        },
      },
      posts_categories_links: {
        include: {
          categories: true,
        },
      },
      featured_image: true,
    },
  });

  return rows.map((post) => {
    const authors = [
      ...(post.author
        ? [
            {
              id: post.author.id,
              username: post.author.username ?? "",
              full_name: post.author.full_name ?? null,
              avatar_url: post.author.avatar?.url ?? null,
              role: "author" as const,
            },
          ]
        : []),
      ...(post.collaborators ?? []).map((collaborator) => ({
        id: collaborator.user.id,
        username: collaborator.user.username ?? "",
        full_name: collaborator.user.full_name ?? null,
        avatar_url: collaborator.user.avatar_url ?? null,
        role: (collaborator.role === "viewer"
          ? "viewer"
          : "editor") as "editor" | "viewer",
      })),
    ];

    return {
      id: post.id,
      documentId: post.document_id ?? null,
      title: post.title ?? "",
      slug: post.slug ?? null,
      excerpt: post.excerpt ?? null,
      post_status: post.post_status ?? null,
      publishedAt: post.published_at?.toISOString() ?? null,
      updatedAt: post.updated_at?.toISOString() ?? null,
      author: post.author
        ? {
            id: post.author.id,
            username: post.author.username ?? "",
            full_name: post.author.full_name ?? null,
            avatar_url: post.author.avatar?.url ?? null,
          }
        : null,
      authors,
      categories:
        post.posts_categories_links
          ?.map((link) => link.categories)
          .filter(Boolean)
          .map((category) => ({
            id: category.id,
            name: category.name ?? "",
            slug: category.slug ?? null,
          })) ?? [],
      featuredImage: post.featured_image
        ? {
            id: post.featured_image.id,
            url: post.featured_image.url ?? null,
            name: post.featured_image.name ?? null,
          }
        : null,
    };
  });
}

export async function generateMetadata({
  params,
}: AuthorPageProps): Promise<Metadata> {
  const { username } = await params;
  const author = await getAuthor(username);

  if (!author) return { title: "Автор не найден" };

  const name = author.full_name || author.username;

  return {
    title: `${name} — Автор`,
    description: author.bio || `Публикации автора ${name}`,
    openGraph: {
      title: `${name} — Автор`,
      description: author.bio || `Публикации автора ${name}`,
      type: "profile",
    },
  };
}

export default async function AuthorPage({
  params,
  searchParams,
}: AuthorPageProps) {
  const { username } = await params;
  const queryParams = await searchParams;
  const initialView = parseView(queryParams?.view);

  const [author, settings] = await Promise.all([
    getAuthor(username),
    getSiteSettings(),
  ]);

  if (!author) notFound();

  const posts = await getPostsByAuthorPrisma(username);

  const timezone = settings?.timezone ?? "Europe/Minsk";
  const locale = (settings?.siteLocale ?? "ru") as LanguageCode;

  const displayName = author.full_name || author.username;
  const avatarUrl = author.avatar_url;

  const pluralize = (count: number) => {
    const mod10 = count % 10;
    const mod100 = count % 100;

    if (mod10 === 1 && mod100 !== 11) return "публикация";
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
      return "публикации";
    }

    return "публикаций";
  };

  return (
    <main className="min-h-screen bg-(--bg-primary) py-8 md:py-12 transition-colors duration-300">
      <div className="container mx-auto max-w-4xl px-4">
        <BackButton fallback="/blog" />

        <header className="mb-8 rounded-xl border border-(--border) bg-(--bg-card) p-6 md:p-8">
          <div className="flex flex-col items-start gap-6 md:flex-row">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={displayName}
                width={120}
                height={120}
                priority
                className="h-30 w-30 shrink-0 rounded-full border-2 border-(--accent)/20 object-cover"
              />
            ) : (
              <div className="flex h-30 w-30 shrink-0 items-center justify-center rounded-full bg-(--accent-dim)">
                <User className="h-12 w-12 text-(--accent)" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h1 className="mb-2 text-3xl font-bold text-(--text-primary) md:text-4xl">
                {displayName}
              </h1>

              {author.username && (
                <p className="mb-3 text-sm text-(--text-muted)">
                  @{author.username}
                </p>
              )}

              {author.bio && (
                <p className="mb-4 whitespace-pre-line text-(--text-secondary)">
                  {author.bio}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-(--text-secondary)">
                <span className="flex items-center gap-1.5">
                  <FileText size={14} className="text-(--accent)" />
                  {posts.length} {pluralize(posts.length)}
                </span>
              </div>
            </div>
          </div>
        </header>

        <section>
          {posts.length === 0 ? (
            <>
              <h2 className="mb-4 text-xl font-bold text-(--text-primary)">
                Публикации
              </h2>

              <p className="py-12 text-center text-(--text-muted)">
                У автора пока нет публикаций
              </p>
            </>
          ) : (
            <Suspense
              fallback={
                <div className="space-y-4">
                  {posts.slice(0, 3).map((post) => (
                    <div
                      key={post.id}
                      className="h-40 animate-pulse rounded-xl border border-(--border) bg-(--bg-card)"
                    />
                  ))}
                </div>
              }
            >
              <AuthorPosts
                posts={posts}
                initialView={initialView}
                timezone={timezone}
                locale={locale}
              />
            </Suspense>
          )}
        </section>
      </div>
    </main>
  );
}