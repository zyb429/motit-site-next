// src/components/blog/BlogPosts.tsx
"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { BlogCard } from "./BlogCard";
import { ViewModeToggle, type ViewMode } from "./ViewModeToggle";
import { PostListItem } from "@/lib/db/posts";
import type { LanguageCode } from "@/lib/i18n";

interface BlogPostsProps {
  posts: PostListItem[];
  initialViewMode?: ViewMode;
  timezone?: string;
  locale?: LanguageCode;
}

export function BlogPosts({
  posts,
  initialViewMode = "list",
  timezone = "Europe/Minsk",
  locale = "ru",
}: BlogPostsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const raw = searchParams.get("view");
  const viewMode: ViewMode =
    raw === "list" || raw === "tiles" || raw === "grid" ? raw : initialViewMode;

  const setViewMode = (next: ViewMode) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "list") {
      params.delete("view");
    } else {
      params.set("view", next);
    }
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const renderCards = () => {
    if (viewMode === "list") {
      return (
        <div className="space-y-4">
          {posts.map((post) => (
            <BlogCard
              key={post.id}
              post={post}
              variant="list"
              timezone={timezone}
              locale={locale}
            />
          ))}
        </div>
      );
    }

    if (viewMode === "tiles") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {posts.map((post) => (
            <BlogCard
              key={post.id}
              post={post}
              variant="tiles"
              timezone={timezone}
              locale={locale}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <BlogCard
            key={post.id}
            post={post}
            variant="grid"
            timezone={timezone}
            locale={locale}
          />
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-(--text-muted) uppercase tracking-wider">
          Статьи
        </h2>
        <ViewModeToggle value={viewMode} onChange={setViewMode} />
      </div>
      {renderCards()}
    </div>
  );
}