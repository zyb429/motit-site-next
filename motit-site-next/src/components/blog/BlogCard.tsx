"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowUpRight, Calendar, Clock, User, X } from "lucide-react";
import type { View } from "@/lib/view";
import type { PostListItem, PostPerson } from "@/lib/db/posts";
import { formatDate } from "@/lib/format-date";
import type { LanguageCode } from "@/lib/i18n";

interface BlogCardProps {
  post: PostListItem;
  className?: string;
  variant?: View;
  timezone?: string;
  locale?: LanguageCode;
}

const extractText = (content: unknown): string => {
  if (!content) return "";
  if (typeof content === "string") {
    const trimmed = content.trim();
    if (trimmed.startsWith("<")) return trimmed.replace(/<[^>]*>/g, " ");
    try {
      return extractText(JSON.parse(trimmed));
    } catch {
      return trimmed;
    }
  }
  if (Array.isArray(content)) {
    return content.map(extractText).join(" ");
  }
  if (typeof content === "object") {
    const node = content as any;
    if (node.type === "text" && typeof node.text === "string") return node.text;
    if (node.content && Array.isArray(node.content)) {
      return node.content.map(extractText).join(" ");
    }
    if (node.children && Array.isArray(node.children)) {
      return node.children.map(extractText).join(" ");
    }
    if (node.text) return node.text;
  }
  return "";
};

function AuthorAvatar({
  person,
  size = "sm",
}: {
  person: PostPerson;
  size?: "sm" | "md";
}) {
  const dimensions = size === "sm" ? "h-6 w-6" : "h-8 w-8";

  if (person.avatar_url) {
    return (
      <Image
        src={person.avatar_url}
        alt={person.full_name || person.username}
        width={size === "sm" ? 24 : 32}
        height={size === "sm" ? 24 : 32}
        className={`${dimensions} rounded-full object-cover ring-2 ring-[var(--bg-card)]`}
      />
    );
  }

  return (
    <span
      className={`${dimensions} flex items-center justify-center rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)] ring-2 ring-[var(--bg-card)]`}
    >
      <User size={size === "sm" ? 12 : 15} />
    </span>
  );
}

function AuthorPicker({
  authors,
  onClose,
  onSelect,
}: {
  authors: PostPerson[];
  onClose: () => void;
  onSelect: (person: PostPerson) => void;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-(--border) bg-(--bg-card) shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-(--border) px-4 py-3">
          <h3 className="text-sm font-semibold text-(--text-primary)">
            Выберите автора
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-(--text-muted) transition-colors hover:bg-(--bg-secondary) hover:text-(--text-primary)"
            aria-label="Закрыть"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-1.5">
          {authors.map((person) => (
            <button
              key={`${person.id}-${person.role}`}
              type="button"
              onClick={() => onSelect(person)}
              className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-(--bg-secondary)"
            >
              <AuthorAvatar person={person} size="md" />

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-(--text-primary)">
                  {person.full_name || person.username}
                </span>

                <span className="block truncate text-xs text-(--text-muted)">
                  @{person.username}
                </span>
              </span>

              {person.role === "viewer" && (
                <span className="shrink-0 rounded-full bg-(--bg-secondary) px-2 py-0.5 text-[10px] text-(--text-muted)">
                  наблюдатель
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BlogCard({
  post,
  className = "",
  variant = "list",
  timezone = "Europe/Minsk",
  locale = "ru",
}: BlogCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { saveScrollPosition } = useScrollRestoration();
  const isMobile = useIsMobile();

  const [authorPickerOpen, setAuthorPickerOpen] = useState(false);

  const effectiveVariant: View = isMobile ? "list" : variant;

  if (!post) return null;

  const isDraft = post.post_status === "draft";
  const title = post.title || "Без названия";
  const slug = post.slug || "";
  const excerpt = post.excerpt || "";
  const publishedAt = post.publishedAt || post.updatedAt || null;

  const categories = (post.categories || []).map((category) => ({
    name: category.name ?? "",
    slug: category.slug ?? "",
  }));

  const authors = post.authors ?? [];

  const getPostUrl = () => {
    saveScrollPosition();

    const params = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (key !== "page") params.append(key, value);
    });

    const queryString = params.toString();
    return `/blog/${slug}${queryString ? `?${queryString}` : ""}`;
  };

  const dateOptions = {
    day: "numeric" as const,
    month: "long" as const,
    year: "numeric" as const,
  };

  const formatPublished = (dateString: string | null) =>
    dateString ? formatDate(dateString, timezone, locale, dateOptions) : null;

  const getReadingTime = () => {
    const rawContent = post.content;
    const textToCount = rawContent
      ? extractText(rawContent)
      : extractText(excerpt);

    const words = textToCount.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  if (!slug) return null;

  const sortedCategories = [...categories].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const postUrl = getPostUrl();

  const openPost = () => {
    router.push(postUrl);
  };

  const openAuthor = (person: PostPerson) => {
    setAuthorPickerOpen(false);
    router.push(`/authors/${person.username}`);
  };

  const handleAuthorsClick = (event: React.MouseEvent) => {
    event.stopPropagation();

    if (authors.length === 1) {
      openAuthor(authors[0]);
      return;
    }

    if (authors.length > 1) {
      setAuthorPickerOpen(true);
    }
  };

  const handleCategoryClick = (categorySlug: string) => {
    return (event: React.MouseEvent) => {
      event.stopPropagation();
      router.push(`/blog?category=${categorySlug}`);
    };
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPost();
    }
  };

  const AuthorsBlock = () => {
    if (!authors.length) return null;

    const visibleAuthors = authors.slice(0, 3);
    const hiddenCount = authors.length - visibleAuthors.length;

    return (
      <button
        type="button"
        onClick={handleAuthorsClick}
        className="flex min-w-0 items-center gap-2 text-left transition-colors hover:text-(--accent)"
      >
        <span className="flex shrink-0 items-center -space-x-1.5">
          {visibleAuthors.map((person) => (
            <span
              key={`${person.id}-${person.role}`}
              title={person.full_name || person.username}
            >
              <AuthorAvatar person={person} />
            </span>
          ))}

          {hiddenCount > 0 && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--bg-secondary)] text-[10px] font-medium text-[var(--text-secondary)] ring-2 ring-[var(--bg-card)]">
              +{hiddenCount}
            </span>
          )}
        </span>

        <span className="min-w-0 truncate text-xs text-(--text-secondary) transition-colors group-hover:text-(--accent)">
          {authors.map((person, index) => (
            <span key={`${person.id}-${person.role}`}>
              {person.full_name || person.username}

              {index < authors.length - 1 && (
                <span className="text-(--text-muted)">, </span>
              )}
            </span>
          ))}
        </span>
      </button>
    );
  };

  const CategoriesBlock = () => {
    if (!sortedCategories.length) {
      return (
        <span className="inline-flex items-center rounded-full border border-(--border) bg-(--bg-secondary) px-2 py-0.5 text-[11px] font-medium text-(--text-muted)">
          Без категории
        </span>
      );
    }

    return (
      <div className="flex flex-wrap gap-1">
        {sortedCategories.map((category) => (
          <button
            key={category.slug || category.name}
            type="button"
            onClick={handleCategoryClick(category.slug)}
            className="rounded-full border border-(--border) bg-(--bg-secondary) px-2 py-0.5 text-[11px] font-medium text-(--text-secondary) transition-colors hover:border-(--accent) hover:bg-(--accent-dim) hover:text-(--accent)"
          >
            {category.name}
          </button>
        ))}
      </div>
    );
  };

  const FeaturedImage = () => (
    <div className="relative h-full w-full overflow-hidden bg-(--bg-primary)">
      {post.featuredImage?.url ? (
        <Image
          src={post.featuredImage.url}
          alt={post.title || "Превью"}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          sizes={
            effectiveVariant === "list"
              ? "(max-width: 768px) 100vw, 280px"
              : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          }
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <span className="text-3xl opacity-20">📄</span>
        </div>
      )}

      {isDraft && (
        <span className="absolute right-2.5 top-2.5 rounded-full bg-yellow-500/95 px-2 py-0.5 text-[10px] font-semibold text-black">
          Черновик
        </span>
      )}
    </div>
  );

  const CardFooter = () => (
    <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-(--border) pt-3">
      <AuthorsBlock />

      <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-(--text-muted)">
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
  );

  const ReadMore = () => (
    <div className="mt-3 flex items-center justify-between gap-2">
      <span className="text-xs font-medium text-(--accent) transition-all duration-200 group-hover:translate-x-0.5">
        Читать далее
      </span>

      <span className="flex h-6 w-6 items-center justify-center rounded-full border border-(--border) text-(--accent) transition-all duration-200 group-hover:border-(--accent) group-hover:bg-(--accent-dim)">
        <ArrowUpRight size={12} />
      </span>
    </div>
  );

  if (effectiveVariant === "list") {
    return (
      <>
        <div
          role="link"
          tabIndex={0}
          onClick={openPost}
          onKeyDown={handleKeyDown}
          className={`group relative block cursor-pointer overflow-hidden rounded-xl border border-(--border) bg-(--bg-card) transition-all duration-300 hover:-translate-y-0.5 hover:border-(--accent)/40 hover:shadow-md ${className}`}
        >
          <div className="flex flex-col md:flex-row">
            <div className="relative h-40 w-full shrink-0 md:h-auto md:w-60">
              <FeaturedImage />
            </div>

            <div className="flex min-w-0 flex-1 flex-col p-4">
              <h2 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight text-(--text-primary) transition-colors group-hover:text-(--accent)">
                {title}
              </h2>

              <div className="mt-2 min-h-[22px]">
                <CategoriesBlock />
              </div>

              <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-(--text-muted)">
                {excerpt || "Без описания"}
              </p>

              <div className="mt-auto pt-3">
                <CardFooter />
                <ReadMore />
              </div>
            </div>
          </div>
        </div>

        {authorPickerOpen && (
          <AuthorPicker
            authors={authors}
            onClose={() => setAuthorPickerOpen(false)}
            onSelect={openAuthor}
          />
        )}
      </>
    );
  }

  if (effectiveVariant === "tiles") {
    return (
      <>
        <div
          role="link"
          tabIndex={0}
          onClick={openPost}
          onKeyDown={handleKeyDown}
          className={`group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-(--border) bg-(--bg-card) transition-all duration-300 hover:-translate-y-0.5 hover:border-(--accent)/40 hover:shadow-lg ${className}`}
        >
          <div className="relative aspect-16/10 w-full">
            <FeaturedImage />
          </div>

          <div className="flex min-h-0 flex-1 flex-col p-4">
            <h2 className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight text-(--text-primary) transition-colors group-hover:text-(--accent)">
              {title}
            </h2>

            <div className="mt-2 min-h-[22px]">
              <CategoriesBlock />
            </div>

            <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-(--text-muted)">
              {excerpt || "Без описания"}
            </p>

            <div className="mt-auto pt-3">
              <CardFooter />
              <ReadMore />
            </div>
          </div>
        </div>

        {authorPickerOpen && (
          <AuthorPicker
            authors={authors}
            onClose={() => setAuthorPickerOpen(false)}
            onSelect={openAuthor}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div
        role="link"
        tabIndex={0}
        onClick={openPost}
        onKeyDown={handleKeyDown}
        className={`group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-(--border) bg-(--bg-card) transition-all duration-300 hover:-translate-y-0.5 hover:border-(--accent)/40 hover:shadow-lg ${className}`}
      >
        <div className="relative aspect-16/10 w-full">
          <FeaturedImage />
        </div>

        <div className="flex min-h-0 flex-1 flex-col p-4">
          <h2 className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight text-(--text-primary) transition-colors group-hover:text-(--accent)">
            {title}
          </h2>

          <div className="mt-2 min-h-[22px]">
            <CategoriesBlock />
          </div>

          <p className="mt-1.5 line-clamp-3 text-[13px] leading-relaxed text-(--text-muted)">
            {excerpt || "Без описания"}
          </p>

          <div className="mt-auto pt-3">
            <CardFooter />
            <ReadMore />
          </div>
        </div>
      </div>

      {authorPickerOpen && (
        <AuthorPicker
          authors={authors}
          onClose={() => setAuthorPickerOpen(false)}
          onSelect={openAuthor}
        />
      )}
    </>
  );
}