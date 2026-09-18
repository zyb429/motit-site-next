// src/components/blog/BlogCategories.tsx
"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, X } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";

export type BlogCategoryItem = {
  id: number;
  name: string;
  slug: string | null;
  icon: string | null;
};

interface BlogCategoriesProps {
  categories: BlogCategoryItem[];
  currentCategories?: string[];
  counts?: Record<string, number>;
  onToggle?: (slug: string) => void;
  onClear?: () => void;
}

export function BlogCategories({
  categories = [],
  currentCategories = [],
  counts = {},
  onToggle,
  onClear,
}: BlogCategoriesProps) {
  const router = useRouter();

  // Оставляем только категории с постами
  const visibleCategories = categories.filter((cat) => {
    const count = counts[cat.slug ?? ""] || 0;
    return count > 0;
  });

  const [showAll, setShowAll] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef<number>(0);
  const isNavigatingRef = useRef<boolean>(false);

  const saveScrollPositionFn = useCallback(() => {
    scrollPositionRef.current = window.scrollY;
  }, []);

  const restoreScrollPositionFn = useCallback(() => {
    requestAnimationFrame(() => {
      window.scrollTo({
        top: scrollPositionRef.current,
        behavior: "instant",
      });
      isNavigatingRef.current = false;
    });
  }, []);

  const toggleCategory = useCallback(
    (slug: string) => {
      if (isNavigatingRef.current) return;
      isNavigatingRef.current = true;
      saveScrollPositionFn();

      const params = new URLSearchParams(window.location.search);
      const current = params.getAll("category");
      const search = params.get("search");

      if (current.includes(slug)) {
        params.delete("category");
        current
          .filter((c) => c !== slug)
          .forEach((c) => params.append("category", c));
      } else {
        params.append("category", slug);
      }

      if (search) params.set("search", search);
      params.delete("page");

      const queryString = params.toString();
      const url = `/blog${queryString ? `?${queryString}` : ""}`;
      router.replace(url, { scroll: false });

      setTimeout(restoreScrollPositionFn, 100);
      onToggle?.(slug);
    },
    [router, saveScrollPositionFn, restoreScrollPositionFn, onToggle],
  );

  const clearCategories = useCallback(() => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    saveScrollPositionFn();

    const params = new URLSearchParams(window.location.search);
    const search = params.get("search");

    params.delete("category");
    params.delete("page");
    if (search) params.set("search", search);

    const queryString = params.toString();
    const url = `/blog${queryString ? `?${queryString}` : ""}`;
    router.replace(url, { scroll: false });

    setTimeout(restoreScrollPositionFn, 100);
    onClear?.();
  }, [router, saveScrollPositionFn, restoreScrollPositionFn, onClear]);

  const isCategorySelected = (slug: string | null) =>
    slug ? currentCategories.includes(slug) : false;

  useEffect(() => {
    if (isNavigatingRef.current) {
      restoreScrollPositionFn();
    }
  }, [restoreScrollPositionFn]);

  if (visibleCategories.length === 0) return null;

  const displayCategories = showAll
    ? visibleCategories
    : visibleCategories.slice(0, 8);

  return (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
          Категории
        </h3>
        {visibleCategories.length > 8 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-[#2dd4bf] hover:text-[#14b8a6] transition-colors flex items-center gap-0.5"
          >
            {showAll ? "Скрыть" : `Все (${visibleCategories.length})`}
            <ChevronRight
              size={14}
              className={`transition-transform duration-200 ${showAll ? "rotate-90" : ""}`}
            />
          </button>
        )}
      </div>

      <div ref={containerRef} className="flex flex-wrap gap-2">
        <button
          onClick={clearCategories}
          className={`px-3 py-1.5 rounded-full text-sm transition-colors whitespace-nowrap ${
            currentCategories.length === 0
              ? "bg-[#2dd4bf] text-[#0a1920] font-medium"
              : "bg-[#0d2029] border border-[rgba(45,212,191,0.08)] text-gray-400 hover:text-[#e0f7fa] hover:border-[#2dd4bf]/30"
          }`}
        >
          Все
        </button>

        {displayCategories.map((cat) => {
          const isActive = isCategorySelected(cat.slug);
          const count = counts[cat.slug ?? ""] || 0;

          return (
            <button
              key={cat.id}
              onClick={() => cat.slug && toggleCategory(cat.slug)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                isActive
                  ? "bg-[#2dd4bf] text-[#0a1920] font-medium"
                  : "bg-[#0d2029] border border-[rgba(45,212,191,0.08)] text-gray-400 hover:text-[#e0f7fa] hover:border-[#2dd4bf]/30"
              }`}
            >
              {cat.icon && <span>{cat.icon}</span>}
              {cat.name}
              <span
                className={`text-[10px] ${isActive ? "text-[#0a1920]/60" : "text-gray-500"}`}
              >
                {count}
              </span>
              {isActive && <X size={12} className="ml-0.5" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
