'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Pagination } from './Pagination';

interface PaginationClientProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export function PaginationClient({ currentPage, totalPages, baseUrl }: PaginationClientProps) {
  const router = useRouter();
  const isFirstRender = useRef(true);

  // Эффект для прокрутки при изменении страницы
  useEffect(() => {
    // Пропускаем первый рендер (при загрузке страницы)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Прокручиваем к постам
    const postsContainer = document.getElementById('blog-posts');
    if (postsContainer) {
      postsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  // Обработчик для перехвата навигации и добавления прокрутки
  const handlePageChange = (page: number) => {
    const url = new URL(baseUrl, window.location.origin);
    if (page > 1) {
      url.searchParams.set('page', String(page));
    } else {
      url.searchParams.delete('page');
    }
    
    // Навигация без автоматической прокрутки
    router.push(url.pathname + url.search, { scroll: false });
  };

  return (
    <Pagination 
      currentPage={currentPage}
      totalPages={totalPages}
      baseUrl={baseUrl}
    />
  );
}