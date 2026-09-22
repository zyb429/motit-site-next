"use client";

import { useEffect, useRef } from "react";
import { Pagination } from "./Pagination";

interface PaginationClientProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export function PaginationClient({
  currentPage,
  totalPages,
  baseUrl,
}: PaginationClientProps) {
  const isFirstRender = useRef(true);

  // Эффект для прокрутки при изменении страницы
  useEffect(() => {
    // Пропускаем первый рендер (при загрузке страницы)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Прокручиваем к постам
    const postsContainer = document.getElementById("blog-posts");
    if (postsContainer) {
      postsContainer.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage]);

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      baseUrl={baseUrl}
    />
  );
}
