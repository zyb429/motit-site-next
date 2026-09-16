// src/app/authors/[username]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { User, FileText } from "lucide-react";
import { getAuthorByUsername, getPostsByAuthor } from "@/lib/strapi";
import { BackButton } from "@/components/blog/BackButton";
import { Suspense } from "react";
import { AuthorPosts } from "@/components/blog/AuthorPosts";
import { parseView } from "@/lib/view";

interface AuthorPageProps {
  params: Promise<{ username: string }>;
  searchParams?: Promise<{ view?: string }> | { view?: string };
}

export async function generateMetadata({
  params,
}: AuthorPageProps): Promise<Metadata> {
  const { username } = await params;
  const author = await getAuthorByUsername(username);
  if (!author) return { title: "Автор не найден" };

  const name =
    author.full_name ||
    [author.firstname, author.lastname].filter(Boolean).join(" ") ||
    author.username;

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
  const sp = await searchParams;
  const initialView = parseView(sp?.view);

  const author = await getAuthorByUsername(username);

  if (!author) notFound();

  const postsRes = await getPostsByAuthor(username, { pageSize: 50 });
  const posts = postsRes?.data ?? [];

  const displayName =
    author.full_name ||
    [author.firstname, author.lastname].filter(Boolean).join(" ") ||
    author.username;

  const avatarUrl = author.avatar_url
    ? author.avatar_url.startsWith("/uploads")
      ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337"}${author.avatar_url}`
      : author.avatar_url
    : null;

  const pluralize = (n: number) => {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return "публикация";
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20))
      return "публикации";
    return "публикаций";
  };

  return (
    <main className="min-h-screen bg-[#0a1920] py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <BackButton fallback="/blog" />

        {/* Профиль автора */}
        <header className="bg-[#0f2832] rounded-xl p-6 md:p-8 mb-8 border border-[rgba(45,212,191,0.06)]">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={displayName}
                width={120}
                height={120}
                priority
                className="rounded-full object-cover border-2 border-[#2dd4bf]/20 shrink-0"
              />
            ) : (
              <div className="w-30 h-30 rounded-full bg-[#2dd4bf]/10 flex items-center justify-center shrink-0">
                <User className="w-12 h-12 text-[#2dd4bf]" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl font-bold text-[#e0f7fa] mb-2">
                {displayName}
              </h1>
              {author.username && (
                <p className="text-sm text-gray-500 mb-3">@{author.username}</p>
              )}
              {author.bio && (
                <p className="text-gray-300 whitespace-pre-line mb-4">
                  {author.bio}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1.5">
                  <FileText size={14} className="text-[#2dd4bf]" />
                  {posts.length} {pluralize(posts.length)}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Публикации */}
        <section>
          {posts.length === 0 ? (
            <>
              <h2 className="text-xl font-bold text-[#e0f7fa] mb-4">
                Публикации
              </h2>
              <p className="text-gray-500 text-center py-12">
                У автора пока нет публикаций
              </p>
            </>
          ) : (
            <Suspense
              fallback={
                <div className="space-y-4">
                  {posts.slice(0, 3).map((post: any) => (
                    <div
                      key={post.id || post.documentId}
                      className="h-40 bg-[#0f2832] rounded-xl border border-[rgba(45,212,191,0.06)] animate-pulse"
                    />
                  ))}
                </div>
              }
            >
              <AuthorPosts posts={posts} initialView={initialView} />
            </Suspense>
          )}
        </section>
      </div>
    </main>
  );
}
