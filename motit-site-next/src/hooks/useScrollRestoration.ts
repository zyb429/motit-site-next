// src/hooks/useScrollRestoration.ts
'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const SCROLL_KEY = 'blog_scroll_position';
const PREVIOUS_PATH_KEY = 'blog_previous_path';

export function useScrollRestoration() {
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  // Безопасная проверка, является ли путь страницей блога
  const isBlogPath = (path: string): boolean => {
    return typeof path === 'string' && path.startsWith('/blog');
  };

  // Определяем, является ли переход внутренним (внутри блога)
  const isInternalBlogNavigation = () => {
    try {
      const prev = sessionStorage.getItem(PREVIOUS_PATH_KEY);
      const current = pathname || '';
      
      if (isBlogPath(prev || '') && isBlogPath(current)) {
        return true;
      }
      
      return false;
    } catch {
      return false;
    }
  };

  // Сохраняем предыдущий путь
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(PREVIOUS_PATH_KEY, pathname || '');
      }
    } catch {
      // Игнорируем ошибки sessionStorage
    }
  }, [pathname]);

  // Сохраняем позицию при скролле
  useEffect(() => {
    const handleScroll = () => {
      try {
        if (scrollTimeout.current) {
          clearTimeout(scrollTimeout.current);
        }
        
        scrollTimeout.current = setTimeout(() => {
          if (isBlogPath(pathname)) {
            sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
          }
        }, 100);
      } catch {
        // Игнорируем ошибки
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [pathname]);

  // Восстанавливаем позицию после навигации
  useEffect(() => {
    try {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        
        const saved = sessionStorage.getItem(SCROLL_KEY);
        const prevPath = sessionStorage.getItem(PREVIOUS_PATH_KEY);
        
        // Если пришли с другой страницы (не из блога) - скролл вверх
        if (prevPath && !isBlogPath(prevPath) && isBlogPath(pathname)) {
          window.scrollTo({ top: 0, behavior: 'instant' });
          sessionStorage.removeItem(SCROLL_KEY);
          return;
        }
        
        // Если внутри блога - восстанавливаем позицию
        if (saved && isBlogPath(pathname)) {
          const position = parseInt(saved, 10);
          if (!isNaN(position)) {
            requestAnimationFrame(() => {
              window.scrollTo({ top: position, behavior: 'instant' });
            });
          }
        }
        return;
      }

      // При последующих навигациях
      const saved = sessionStorage.getItem(SCROLL_KEY);
      const isInternal = isInternalBlogNavigation();

      if (isInternal && saved && pathname && isBlogPath(pathname)) {
        const position = parseInt(saved, 10);
        if (!isNaN(position)) {
          setTimeout(() => {
            window.scrollTo({ top: position, behavior: 'instant' });
          }, 50);
        }
      } else if (!isInternal && isBlogPath(pathname)) {
        window.scrollTo({ top: 0, behavior: 'instant' });
        sessionStorage.removeItem(SCROLL_KEY);
      }
    } catch {
      // Игнорируем ошибки
    }
  }, [pathname, searchParams]);

  // Функция для сохранения позиции перед навигацией
  const saveScrollPosition = () => {
    try {
      if (isBlogPath(pathname)) {
        sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
      }
    } catch {
      // Игнорируем ошибки
    }
  };

  // Функция для восстановления позиции
  const restoreScrollPosition = () => {
    try {
      const saved = sessionStorage.getItem(SCROLL_KEY);
      if (saved && isBlogPath(pathname)) {
        const position = parseInt(saved, 10);
        if (!isNaN(position) && position > 0) {
          window.scrollTo({ top: position, behavior: 'instant' });
        }
      }
    } catch {
      // Игнорируем ошибки
    }
  };

  // Функция для скролла вверх
  const scrollToTop = () => {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      sessionStorage.removeItem(SCROLL_KEY);
    } catch {
      // Игнорируем ошибки
    }
  };

  return { saveScrollPosition, restoreScrollPosition, scrollToTop };
}