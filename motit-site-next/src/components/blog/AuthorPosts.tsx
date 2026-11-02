// src/components/blog/AuthorPosts.tsx
"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { parseView, type View } from "@/lib/view";
import { BlogCard } from "./BlogCard";
import { ViewModeToggle } from "./ViewModeToggle";
import type { PostListItem } from "@/lib/db/posts";
import type { LanguageCode } from "@/lib/i18n";

interface AuthorPostsProps {
  posts: PostListItem[];
  initialView?: View;
  timezone?: string;
  locale?: LanguageCode;
}

export function AuthorPosts({
  posts,
  initialView,
  timezone = "Europe/Minsk",
  locale = "ru",
}: AuthorPostsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const viewMode = parseView(searchParams.get("view") ?? initialView);

  const setViewMode = (next: View) => {
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
              key={post.id || post.documentId}
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
            key={post.id || post.documentId}
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[#e0f7fa]">Публикации</h2>
        <ViewModeToggle value={viewMode} onChange={setViewMode} />
      </div>
      {renderCards()}
    </div>
  );
}
