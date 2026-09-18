// src/app/(site)/blog/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Search, X } from "lucide-react";
import { getPostsPrisma } from "@/lib/db/posts";
import { getPostsPerPagePrisma } from "@/lib/db/settings";
import { getCategoriesPrisma } from "@/lib/db/categories";
import { BlogPosts } from "@/components/blog/BlogPosts";
import { BlogCategories } from "@/components/blog/BlogCategories";
import { PaginationClient } from "@/components/blog/PaginationClient";
import { SearchInput } from "@/components/blog/SearchInput";
import type { ViewMode } from "@/components/blog/ViewModeToggle";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Блог | Motit",
  description: "Новости, статьи и обновления от Motit",
};

export async function generateStaticParams() {
  try {
    const postsPerPage = await getPostsPerPagePrisma();
    const allPosts = await getPostsPrisma({ status: "published", take: 1000 });
    const total = allPosts.length;
    const totalPages = Math.ceil(total / postsPerPage);
    const pagesToGenerate = Math.min(totalPages, 10);

    return Array.from({ length: pagesToGenerate }, (_, i) => ({
      page: String(i + 1),
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

function pluralizePosts(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "пост";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "поста";
  return "постов";
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams:
    | Promise<{
        search?: string;
        category?: string | string[];
        page?: string;
        view?: string;
      }>
    | {
        search?: string;
        category?: string | string[];
        page?: string;
        view?: string;
      };
}) {
  const params = await searchParams;
  const searchQuery = params?.search || "";
  const currentPage = parseInt(params?.page || "1", 10);

  const rawView = params?.view;
  const initialViewMode: ViewMode =
    rawView === "list" || rawView === "tiles" || rawView === "grid"
      ? rawView
      : "list";

  let categorySlugs: string[] = [];
  if (params?.category) {
    categorySlugs = Array.isArray(params.category)
      ? params.category
      : [params.category];
  }

  const [postsPerPage, allPosts, allCategories] = await Promise.all([
    getPostsPerPagePrisma(),
    getPostsPrisma({ status: "published", take: 1000 }),
    getCategoriesPrisma(),
  ]);

  let filtered = allPosts;
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter((p) => {
      const t = (p.title || "").toLowerCase();
      const s = (p.slug || "").toLowerCase();
      return t.includes(q) || s.includes(q);
    });
  }

  const categoryCounts: Record<string, number> = {};
  for (const post of allPosts) {
    for (const cat of post.categories) {
      if (cat.slug) {
        categoryCounts[cat.slug] = (categoryCounts[cat.slug] || 0) + 1;
      }
    }
  }

  if (categorySlugs.length > 0) {
    filtered = filtered.filter((post) => {
      const postSlugs = post.categories.map((c) => c.slug);
      return categorySlugs.every((slug) => postSlugs.includes(slug));
    });
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = Math.min(startIndex + postsPerPage, total);
  const posts = filtered.slice(startIndex, endIndex);

  const paginationStart = total > 0 ? startIndex + 1 : 0;
  const paginationEnd = endIndex;

  const buildBaseUrl = () => {
    const p = new URLSearchParams();
    if (searchQuery) p.set("search", searchQuery);
    if (categorySlugs.length > 0) {
      categorySlugs.forEach((slug) => p.append("category", slug));
    }
    if (initialViewMode !== "list") p.set("view", initialViewMode);
    return `/blog${p.toString() ? `?${p.toString()}` : ""}`;
  };

  const baseUrl = buildBaseUrl();

  const buildSearchResetUrl = () => {
    const p = new URLSearchParams();
    if (categorySlugs.length > 0) {
      categorySlugs.forEach((slug) => p.append("category", slug));
    }
    if (initialViewMode !== "list") p.set("view", initialViewMode);
    const qs = p.toString();
    return `/blog${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="min-h-screen bg-[#0a1920] py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-[rgba(45,212,191,0.06)]">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#e0f7fa] tracking-tight">
              Блог
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Статьи и новости от Motit
            </p>
          </div>

          <SearchInput defaultValue={searchQuery} className="w-full md:w-72" />
        </div>

        <BlogCategories
          categories={allCategories}
          currentCategories={categorySlugs}
          counts={categoryCounts}
        />

        {searchQuery && (
          <div className="mb-4 flex items-center gap-3 px-4 py-2.5 bg-[#0f2832] border border-[rgba(45,212,191,0.12)] rounded-xl">
            <Search size={16} className="text-[#2dd4bf] shrink-0" />
            <span className="text-sm text-gray-300 flex-1 min-w-0 truncate">
              <span className="text-gray-500">Поиск:</span>{" "}
              <span className="text-[#e0f7fa] font-medium">
                «{searchQuery}»
              </span>
              <span className="text-gray-500">
                {" "}
                — {total} {pluralizePosts(total)}
              </span>
            </span>
            <Link
              href={buildSearchResetUrl()}
              className="shrink-0 flex items-center gap-1 text-xs text-gray-400 hover:text-[#2dd4bf] transition-colors"
            >
              <X size={12} />
              Сбросить
            </Link>
          </div>
        )}

        <div id="blog-posts">
          {posts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">
                {searchQuery && categorySlugs.length > 0
                  ? "Нет постов, соответствующих вашему запросу и всем выбранным категориям"
                  : searchQuery
                    ? "Ничего не найдено по вашему запросу"
                    : categorySlugs.length > 0
                      ? "Нет постов, содержащих все выбранные категории"
                      : "Постов пока нет"}
              </p>
            </div>
          ) : (
            <>
              <Suspense
                fallback={
                  <div className="space-y-4">
                    {posts.slice(0, 3).map((post) => (
                      <div
                        key={post.id}
                        className="h-40 bg-[#0f2832] rounded-xl border border-[rgba(45,212,191,0.06)] animate-pulse"
                      />
                    ))}
                  </div>
                }
              >
                <BlogPosts posts={posts} initialViewMode={initialViewMode} />
              </Suspense>

              {totalPages > 1 && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 border-t border-[rgba(45,212,191,0.06)] pt-4 sm:pt-6">
                  <div className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
                    {total > 0 ? (
                      <>
                        <span className="hidden sm:inline">
                          Показаны посты{" "}
                        </span>
                        <span className="text-[#e0f7fa] font-medium">
                          {paginationStart}
                        </span>
                        <span className="text-gray-500"> – </span>
                        <span className="text-[#e0f7fa] font-medium">
                          {paginationEnd}
                        </span>
                        <span className="hidden sm:inline"> из </span>
                        <span className="text-[#e0f7fa] font-medium">
                          {total}
                        </span>
                      </>
                    ) : (
                      <>Нет постов</>
                    )}
                  </div>
                  <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 px-0.5 sm:px-0">
                    <PaginationClient
                      currentPage={currentPage}
                      totalPages={totalPages}
                      baseUrl={baseUrl}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
