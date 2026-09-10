// src/components/blog/BlogCard.tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import Image from "next/image";
import { Calendar, User, Clock } from "lucide-react";
import { getPostCategories } from "@/lib/strapi";

interface BlogCardProps {
  post: any;
  className?: string;
  variant?: "grid" | "list";
}

// Универсальная функция для извлечения текста из любого формата контента
const getTextFromContent = (content: any): string => {
  if (!content) return "";

  if (typeof content === "string") {
    try {
      const parsed = JSON.parse(content);
      return getTextFromContent(parsed);
    } catch {
      return content.replace(/<[^>]*>/g, " ");
    }
  }

  if (Array.isArray(content)) {
    return content.map((item) => getTextFromContent(item)).join(" ");
  }

  if (typeof content === "object") {
    if (content.text) return content.text;
    if (content.data?.text) return content.data.text;
    if (content.children) return getTextFromContent(content.children);
    if (content.data?.items) {
      return content.data.items
        .map((item: any) => item.content || item.text || "")
        .join(" ");
    }
    if (content.data?.code) return content.data.code;
  }

  return "";
};

export function BlogCard({
  post,
  className = "",
  variant = "list",
}: BlogCardProps) {
  const searchParams = useSearchParams();
  const { saveScrollPosition } = useScrollRestoration();

  // Нормализация данных для Strapi v5
  const attrs = post?.attributes || post || {};

  const isDraft = attrs.post_status === "draft";
  const title = attrs.title || "Без названия";
  const slug = attrs.slug || "";
  const excerpt = attrs.excerpt || "";
  const publishedAt = attrs.publishedAt || attrs.createdAt || null;

  // ✅ Получаем ВСЕ категории
  const categories = getPostCategories(post);

  // Сохраняем параметры поиска при переходе на статью
  const getPostUrl = () => {
    saveScrollPosition();

    const params = new URLSearchParams();

    searchParams.forEach((value, key) => {
      if (key !== "page") {
        params.append(key, value);
      }
    });

    const queryString = params.toString();
    return `/blog/${slug}${queryString ? `?${queryString}` : ""}`;
  };

  const getAuthorName = () => {
    const authorData = attrs.admin_user || attrs.author;
    if (!authorData) return null;

    if (authorData.data) {
      const user = authorData.data.attributes || authorData.data;
      return user.firstname || user.username || user.name || null;
    }
    if (authorData.attributes) {
      return (
        authorData.attributes.firstname ||
        authorData.attributes.username ||
        authorData.attributes.name ||
        null
      );
    }
    return (
      authorData.firstname || authorData.username || authorData.name || null
    );
  };

  const authorName = getAuthorName();

  const getImageUrl = () => {
    const image = attrs.featured_image;
    if (!image) return null;
    if (typeof image === "string") {
      if (image.startsWith("/uploads")) {
        return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337"}${image}`;
      }
      return image;
    }
    if (typeof image === "object") {
      // Проверяем, что url - строка
      if (image.url && typeof image.url === "string") {
        if (image.url.startsWith("/uploads")) {
          return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337"}${image.url}`;
        }
        return image.url;
      }

      if (
        image.data?.attributes?.url &&
        typeof image.data.attributes.url === "string"
      ) {
        const url = image.data.attributes.url;
        if (url.startsWith("/uploads")) {
          return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337"}${url}`;
        }
        return url;
      }
    }
    return null;
  };

  const imageUrl = getImageUrl();
  const imageAlt = attrs.featured_image?.alternativeText || title;

  const formatDate = (dateString: string) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return null;
    }
  };

  // ✅ ИСПРАВЛЕНО: используем getTextFromContent
  const getReadingTime = () => {
    const content = attrs.content || "";
    const text = getTextFromContent(content);
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  if (!slug) return null;

  // ✅ Сортируем категории по имени
  const sortedCategories = [...categories].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const postUrl = getPostUrl();

  // Вариант списка
  if (variant === "list") {
    return (
      <Link
        href={postUrl}
        className={`group block bg-[#0f2832] rounded-xl overflow-hidden border border-[rgba(45,212,191,0.06)] hover:border-[#2dd4bf]/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 ${className}`}
      >
        <div className="flex flex-col md:flex-row gap-4 p-4">
          <div className="relative w-full md:w-48 h-40 md:h-32 shrink-0 rounded-lg overflow-hidden bg-[#0a1920]">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={imageAlt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
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
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mb-1">
              {authorName && (
                <span className="flex items-center gap-1">
                  <User size={12} className="text-[#2dd4bf]" />
                  {authorName}
                </span>
              )}
              {publishedAt && (
                <>
                  <span className="text-gray-600">•</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} className="text-[#2dd4bf]" />
                    {formatDate(publishedAt)}
                  </span>
                </>
              )}
              <span className="text-gray-600">•</span>
              <span className="flex items-center gap-1">
                <Clock size={12} className="text-[#2dd4bf]" />
                {getReadingTime()} мин
              </span>
            </div>

            <h2 className="text-lg font-bold text-[#e0f7fa] group-hover:text-[#2dd4bf] transition-colors line-clamp-2 leading-tight">
              {title}
            </h2>

            {excerpt && (
              <p className="text-sm text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                {excerpt}
              </p>
            )}

            {/* ✅ Все категории, отсортированные */}
            {sortedCategories.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {sortedCategories.map((cat) => (
                  <span
                    key={cat.slug}
                    className="text-xs bg-[#2dd4bf]/10 text-[#2dd4bf] px-2 py-0.5 rounded-full"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-1 text-[#2dd4bf] text-sm font-medium mt-2 group-hover:gap-2 transition-all duration-200">
              Читать далее
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Вариант сетки (3 колонки)
  return (
    <Link
      href={postUrl}
      className={`group block bg-[#0f2832] rounded-2xl overflow-hidden border border-[rgba(45,212,191,0.08)] hover:border-[#2dd4bf]/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${className}`}
    >
      <div className="relative w-full aspect-16/10 overflow-hidden bg-[#0a1920]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl opacity-20">📄</span>
          </div>
        )}
        {isDraft && (
          <span className="absolute top-3 right-3 bg-yellow-500 text-black text-xs font-medium px-3 py-1 rounded-full">
            Черновик
          </span>
        )}
      </div>

      <div className="p-5 space-y-3">
        <h2 className="text-lg font-bold text-[#e0f7fa] line-clamp-2 group-hover:text-[#2dd4bf] transition-colors">
          {title}
        </h2>

        {excerpt && (
          <p className="text-sm text-gray-400 line-clamp-2">{excerpt}</p>
        )}

        {/* ✅ Все категории, отсортированные */}
        {sortedCategories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {sortedCategories.map((cat) => (
              <span
                key={cat.slug}
                className="text-xs bg-[#2dd4bf]/10 text-[#2dd4bf] px-2 py-0.5 rounded-full"
              >
                {cat.name}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 pt-3 border-t border-[rgba(45,212,191,0.05)]">
          <div className="flex flex-wrap items-center gap-3">
            {authorName && (
              <span className="flex items-center gap-1">
                <User size={12} className="text-[#2dd4bf]" />
                {authorName}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock size={12} className="text-[#2dd4bf]" />
              {getReadingTime()} мин
            </span>
          </div>
          {publishedAt && (
            <span className="flex items-center gap-1">
              <Calendar size={12} className="text-[#2dd4bf]" />
              {formatDate(publishedAt)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
