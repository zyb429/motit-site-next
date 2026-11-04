// src/components/blog/BlogCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import { Calendar, Clock } from "lucide-react";
import { AuthorLink } from "./AuthorLink";
import type { View } from "@/lib/view";
import type { PostListItem } from "@/lib/db/posts";
import { formatDate } from "@/lib/format-date";
import type { LanguageCode } from "@/lib/i18n";

interface BlogCardProps {
  post: PostListItem;
  className?: string;
  variant?: View;
  timezone?: string;
  locale?: LanguageCode;
}

type SlateNode = {
  text?: string;
  children?: SlateNode[];
};

const getTextFromContent = (content: unknown): string => {
  if (!content) return "";
  if (typeof content === "string") {
    try {
      const parsed: unknown = JSON.parse(content);
      return getTextFromContent(parsed);
    } catch {
      return content.replace(/<[^>]*>/g, " ");
    }
  }
  if (Array.isArray(content)) {
    return content.map((item) => getTextFromContent(item)).join(" ");
  }
  if (typeof content === "object") {
    const node = content as SlateNode;
    if (node.text) return node.text;
    if (node.children) return getTextFromContent(node.children);
  }
  return "";
};

export function BlogCard({
  post,
  className = "",
  variant = "list",
  timezone = "Europe/Minsk",
  locale = "ru",
}: BlogCardProps) {
  const searchParams = useSearchParams();
  const { saveScrollPosition } = useScrollRestoration();

  if (!post) return null;

  const isDraft = post.post_status === "draft";
  const title = post.title || "Без названия";
  const slug = post.slug || "";
  const excerpt = post.excerpt || "";
  const publishedAt = post.publishedAt || post.updatedAt || null;

  const categories = (post.categories || []).map((c) => ({
    name: c.name ?? "",
    slug: c.slug ?? "",
  }));

  const postAuthor = post.author
    ? {
        username: post.author.username ?? "",
        full_name: post.author.full_name ?? post.author.username ?? "",
        avatar_url: post.author.avatar_url ?? null,
      }
    : null;

  const getPostUrl = () => {
    saveScrollPosition();
    const params = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (key !== "page") params.append(key, value);
    });
    const qs = params.toString();
    return `/blog/${slug}${qs ? `?${qs}` : ""}`;
  };

  const dateOpts = {
    day: "numeric" as const,
    month: "long" as const,
    year: "numeric" as const,
  };

  const formatPublished = (dateString: string | null) =>
    dateString ? formatDate(dateString, timezone, locale, dateOpts) : null;

  const getReadingTime = () => {
    const text = getTextFromContent(excerpt || "");
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  if (!slug) return null;

  const sortedCategories = [...categories].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const postUrl = getPostUrl();

  if (variant === "list") {
    return (
      <Link
        href={postUrl}
        className={`group block bg-(--bg-card) rounded-xl overflow-hidden border border-(--border) hover:border-(--accent) hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 ${className}`}
      >
        <div className="flex flex-col md:flex-row gap-4 p-4">
          <div className="relative w-full md:w-48 h-40 md:h-32 shrink-0 rounded-lg overflow-hidden bg-(--bg-primary)">
            {post.featuredImage?.url ? (
              <Image
                src={post.featuredImage.url}
                alt={post.title || "Превью"}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, 192px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-3xl opacity-20">📄</span>
              </div>
            )}
            {isDraft && (
              <span className="absolute top-2 right-2 bg-yellow-500/90 text-black text-[10px] font-medium px-2 py-0.5 rounded-full">
                Черновик
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex flex-wrap items-center gap-2 text-xs text-(--text-muted) mb-2">
              {postAuthor?.username && (
                <AuthorLink
                  username={postAuthor.username}
                  name={postAuthor.full_name || postAuthor.username}
                  avatarUrl={postAuthor.avatar_url}
                  className="text-xs text-(--text-muted)"
                />
              )}
              {publishedAt && (
                <>
                  <span className="text-(--text-muted)">•</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} className="text-(--accent)" />
                    {formatPublished(publishedAt)}
                  </span>
                </>
              )}
              <span className="text-(--text-muted)">•</span>
              <span className="flex items-center gap-1">
                <Clock size={12} className="text-(--accent)" />
                {getReadingTime()} мин
              </span>
            </div>

            <h2 className="text-lg font-bold text-(--text-primary) group-hover:text-(--accent) transition-colors line-clamp-2 leading-tight">
              {title}
            </h2>

            {excerpt && (
              <p className="text-sm text-(--text-secondary) line-clamp-2 mt-1 leading-relaxed">
                {excerpt}
              </p>
            )}

            {sortedCategories.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {sortedCategories.map((cat) => (
                  <span
                    key={cat.slug || cat.name}
                    className="text-xs bg-(--accent-dim) text-(--accent) px-2 py-0.5 rounded-full"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-1 text-(--accent) text-sm font-medium mt-2 group-hover:gap-2 transition-all duration-200">
              Читать далее
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "tiles") {
    return (
      <Link
        href={postUrl}
        className={`group block bg-(--bg-card) rounded-2xl overflow-hidden border border-(--border) hover:border-(--accent) hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${className}`}
      >
        <div className="relative w-full aspect-16/10 overflow-hidden bg-(--bg-primary)">
          {post.featuredImage?.url ? (
            <Image
              src={post.featuredImage.url}
              alt={post.title || "Превью"}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl opacity-20">📄</span>
            </div>
          )}
          {isDraft && (
            <span className="absolute top-2 right-2 bg-yellow-500 text-black text-[10px] font-medium px-2 py-0.5 rounded-full">
              Черновик
            </span>
          )}
        </div>

        <div className="p-5 space-y-3">
          <h2 className="text-lg font-bold text-(--text-primary) line-clamp-2 group-hover:text-(--accent) transition-colors">
            {title}
          </h2>

          {sortedCategories.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
              {sortedCategories.map((cat) => (
                <span
                  key={cat.slug || cat.name}
                  className="shrink-0 text-[10px] font-medium text-(--accent) bg-(--accent-dim) border border-(--accent) px-2 py-0.5 rounded-full"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          )}

          {excerpt && (
            <p className="text-sm text-(--text-secondary) line-clamp-2">
              {excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-(--text-muted) pt-3 border-t border-(--border)">
            <div className="flex flex-wrap items-center gap-3">
              {postAuthor?.username && (
                <AuthorLink
                  username={postAuthor.username}
                  name={postAuthor.full_name || postAuthor.username}
                  avatarUrl={postAuthor.avatar_url}
                  className="text-xs text-(--text-muted)"
                />
              )}
              <span className="flex items-center gap-1">
                <Clock size={12} className="text-(--accent)" />
                {getReadingTime()} мин
              </span>
            </div>
            {publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar size={12} className="text-(--accent)" />
                {formatPublished(publishedAt)}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // variant === "grid"
  return (
    <Link
      href={postUrl}
      className={`group block bg-(--bg-card) rounded-2xl overflow-hidden border border-(--border) hover:border-(--accent) hover:shadow-xl transition-all duration-300 ${className}`}
    >
      <div className="p-5 space-y-3">
        <h2 className="text-lg font-bold text-(--text-primary) line-clamp-2 group-hover:text-(--accent) transition-colors">
          {title}
        </h2>
        {sortedCategories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {sortedCategories.map((cat) => (
              <span
                key={cat.slug || cat.name}
                className="text-[10px] font-medium text-(--accent) bg-(--accent-dim) border border-(--accent) px-2 py-0.5 rounded-full"
              >
                {cat.name}
              </span>
            ))}
          </div>
        )}
        {excerpt && (
          <p className="text-sm text-(--text-secondary) line-clamp-3">
            {excerpt}
          </p>
        )}
        <div className="flex items-center justify-between gap-2 text-xs text-(--text-muted) pt-3 border-t border-(--border)">
          <span className="flex items-center gap-1">
            <Clock size={12} className="text-(--accent)" />
            {getReadingTime()} мин
          </span>
          {publishedAt && (
            <span className="flex items-center gap-1">
              <Calendar size={12} className="text-(--accent)" />
              {formatPublished(publishedAt)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}