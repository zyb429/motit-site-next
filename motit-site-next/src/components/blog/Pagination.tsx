// src/components/blog/Pagination.tsx
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const rangeWithDots: (number | string)[] = [];
    const delta = 2;
    let lastAdded: number | string = 0;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        rangeWithDots.push(i);
        lastAdded = i;
      } else if (lastAdded !== "...") {
        rangeWithDots.push("...");
        lastAdded = "...";
      }
    }

    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();

  const buildUrl = (page: number) => {
    const url = new URL(baseUrl, "http://localhost:3000");
    if (page > 1) {
      url.searchParams.set("page", String(page));
    } else {
      url.searchParams.delete("page");
    }
    return url.pathname + url.search;
  };

  return (
    <nav
      className="flex items-center gap-0.5 sm:gap-1"
      aria-label="Пагинация"
      role="navigation"
    >
      {currentPage > 1 ? (
        <Link
          href={buildUrl(currentPage - 1)}
          className="flex items-center justify-center min-w-7 h-7 sm:min-w-9 sm:h-9 rounded-lg bg-(--bg-card) border border-(--border) text-(--text-muted) hover:text-(--text-primary) hover:border-(--accent) active:scale-95 transition-colors"
          aria-label="Предыдущая страница"
          prefetch={true}
          scroll={false}
        >
          <ChevronLeft size={14} className="sm:w-4.5 sm:h-4.5" />
        </Link>
      ) : (
        <span className="flex items-center justify-center min-w-7 h-7 sm:min-w-9 sm:h-9 rounded-lg bg-(--bg-card) border border-(--border) text-(--text-muted) opacity-50 cursor-not-allowed pointer-events-none">
          <ChevronLeft size={14} className="sm:w-4.5 sm:h-4.5" />
        </span>
      )}

      {pageNumbers.map((page, index) => {
        if (page === "...") {
          return (
            <span
              key={`ellipsis-${index}`}
              className="flex items-center justify-center min-w-7 h-7 sm:min-w-9 sm:h-9 text-(--text-muted) select-none text-xs sm:text-sm"
            >
              …
            </span>
          );
        }

        const pageNum = page as number;
        const isActive = pageNum === currentPage;

        if (isActive) {
          return (
            <span
              key={pageNum}
              className="flex items-center justify-center min-w-7 h-7 sm:min-w-9 sm:h-9 rounded-lg text-xs sm:text-sm bg-(--accent) text-(--bg-primary) font-medium cursor-default pointer-events-none"
              aria-current="page"
            >
              {pageNum}
            </span>
          );
        }

        return (
          <Link
            key={pageNum}
            href={buildUrl(pageNum)}
            className="flex items-center justify-center min-w-7 h-7 sm:min-w-9 sm:h-9 rounded-lg text-xs sm:text-sm bg-(--bg-card) border border-(--border) text-(--text-muted) hover:text-(--text-primary) hover:border-(--accent) active:scale-95 transition-colors"
            prefetch={true}
            scroll={false}
          >
            {pageNum}
          </Link>
        );
      })}

      {currentPage < totalPages ? (
        <Link
          href={buildUrl(currentPage + 1)}
          className="flex items-center justify-center min-w-7 h-7 sm:min-w-9 sm:h-9 rounded-lg bg-(--bg-card) border border-(--border) text-(--text-muted) hover:text-(--text-primary) hover:border-(--accent) active:scale-95 transition-colors"
          aria-label="Следующая страница"
          prefetch={true}
          scroll={false}
        >
          <ChevronRight size={14} className="sm:w-4.5 sm:h-4.5" />
        </Link>
      ) : (
        <span className="flex items-center justify-center min-w-7 h-7 sm:min-w-9 sm:h-9 rounded-lg bg-(--bg-card) border border-(--border) text-(--text-muted) opacity-50 cursor-not-allowed pointer-events-none">
          <ChevronRight size={14} className="sm:w-4.5 sm:h-4.5" />
        </span>
      )}
    </nav>
  );
}