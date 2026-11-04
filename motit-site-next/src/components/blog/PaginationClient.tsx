// src/components/blog/PaginationClient.tsx
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

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

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