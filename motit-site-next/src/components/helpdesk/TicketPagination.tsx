"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  totalPages: number;
}

export function TicketPagination({ page, totalPages }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const buildHref = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    return `${pathname}?${params.toString()}`;
  };

  // Формируем список страниц: 1 … 3 4 5 … 20
  const pages: (number | "…")[] = [];
  const range = 1;
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= page - range && i <= page + range)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <div className="mt-6 flex items-center justify-center gap-1">
      <Link
        href={buildHref(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={`p-2 rounded-lg border border-(--border) text-(--text-secondary) hover:text-(--accent) hover:border-(--accent) transition-colors ${
          page === 1 ? "pointer-events-none opacity-40" : ""
        }`}
      >
        <ChevronLeft size={16} />
      </Link>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-2 text-(--text-muted)">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(p)}
            className={`min-w-9 h-9 px-3 inline-flex items-center justify-center rounded-lg border text-sm transition-colors ${
              p === page
                ? "bg-(--accent-dim) border-(--accent) text-(--accent) font-medium"
                : "border-(--border) text-(--text-secondary) hover:text-(--accent) hover:border-(--accent)"
            }`}
          >
            {p}
          </Link>
        ),
      )}

      <Link
        href={buildHref(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={`p-2 rounded-lg border border-(--border) text-(--text-secondary) hover:text-(--accent) hover:border-(--accent) transition-colors ${
          page === totalPages ? "pointer-events-none opacity-40" : ""
        }`}
      >
        <ChevronRight size={16} />
      </Link>
    </div>
  );
}
