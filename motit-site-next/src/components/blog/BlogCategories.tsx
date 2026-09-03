// src/components/blog/BlogCategories.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCategories } from '@/hooks/useCategories';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';
import { ChevronRight, X } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';

interface BlogCategoriesProps {
  currentCategories?: string[];
  onToggle?: (slug: string) => void;
  onClear?: () => void;
}

export function BlogCategories({ 
  currentCategories = [],
  onToggle,
  onClear 
}: BlogCategoriesProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { saveScrollPosition, restoreScrollPosition } = useScrollRestoration();
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories({
    sort: ['name:asc'],
    populate: ['posts'],
  });

  const categories = categoriesData?.data || [];
  const [showAll, setShowAll] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Храним позицию скролла
  const scrollPositionRef = useRef<number>(0);
  const isNavigatingRef = useRef<boolean>(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const isOverflow = container.scrollWidth > container.clientWidth;
        setIsOverflowing(isOverflow);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [categories]);

  // Сохраняем позицию скролла
  const saveScrollPositionFn = useCallback(() => {
    scrollPositionRef.current = window.scrollY;
  }, []);

  // Восстанавливаем позицию скролла
  const restoreScrollPositionFn = useCallback(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ 
        top: scrollPositionRef.current, 
        behavior: 'instant' 
      });
      isNavigatingRef.current = false;
    });
  }, []);

  // Переключаем категорию
  const toggleCategory = useCallback((slug: string) => {
    if (isNavigatingRef.current) return;
    
    isNavigatingRef.current = true;
    saveScrollPositionFn();

    const params = new URLSearchParams(window.location.search);
    const current = params.getAll('category');
    const search = params.get('search');
    
    if (current.includes(slug)) {
      params.delete('category');
      current.filter(c => c !== slug).forEach(c => params.append('category', c));
    } else {
      params.append('category', slug);
    }
    
    if (search) {
      params.set('search', search);
    }
    
    params.delete('page');
    
    const queryString = params.toString();
    const url = `/blog${queryString ? `?${queryString}` : ''}`;
    router.replace(url, { scroll: false });

    setTimeout(restoreScrollPositionFn, 100);

    // Вызываем колбэк если передан
    if (onToggle) {
      onToggle(slug);
    }
  }, [router, saveScrollPositionFn, restoreScrollPositionFn, onToggle]);

  // Очищаем все категории
  const clearCategories = useCallback(() => {
    if (isNavigatingRef.current) return;
    
    isNavigatingRef.current = true;
    saveScrollPositionFn();
    
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search');
    
    params.delete('category');
    params.delete('page');
    
    if (search) {
      params.set('search', search);
    }
    
    const queryString = params.toString();
    const url = `/blog${queryString ? `?${queryString}` : ''}`;
    
    router.replace(url, { scroll: false });
    
    setTimeout(restoreScrollPositionFn, 100);

    // Вызываем колбэк если передан
    if (onClear) {
      onClear();
    }
  }, [router, saveScrollPositionFn, restoreScrollPositionFn, onClear]);

  const isCategorySelected = (slug: string) => {
    return currentCategories.includes(slug);
  };

  const getCategoryName = (slug: string) => {
    const category = categories.find((cat: any) => {
      const c = cat.attributes || cat;
      return c.slug === slug;
    });
    return category ? (category.attributes || category).name : slug;
  };

  // Восстанавливаем позицию при монтировании
  useEffect(() => {
    if (isNavigatingRef.current) {
      restoreScrollPositionFn();
    }
  }, [restoreScrollPositionFn]);

  if (categoriesLoading || categories.length === 0) return null;

  const displayCategories = showAll ? categories : categories.slice(0, 8);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
          Категории
        </h3>
        {categories.length > 8 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-[#2dd4bf] hover:text-[#14b8a6] transition-colors flex items-center gap-0.5"
          >
            {showAll ? 'Скрыть' : `Все (${categories.length})`}
            <ChevronRight 
              size={14} 
              className={`transition-transform duration-200 ${showAll ? 'rotate-90' : ''}`} 
            />
          </button>
        )}
      </div>

      {/* Выбранные категории
      {currentCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {currentCategories.map((slug) => (
            <span
              key={slug}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-[#2dd4bf]/20 text-[#2dd4bf] rounded-full"
            >
              {getCategoryName(slug)}
              <button
                onClick={() => toggleCategory(slug)}
                className="hover:text-[#14b8a6] transition-colors"
                aria-label={`Убрать категорию ${getCategoryName(slug)}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
          <button
            onClick={clearCategories}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Очистить все
          </button>
        </div>
      )} */}

      {/* Категории */}
      <div 
        ref={containerRef}
        className="flex flex-wrap gap-2"
      >
        <button
          onClick={clearCategories}
          className={`px-3 py-1.5 rounded-full text-sm transition-colors whitespace-nowrap ${
            currentCategories.length === 0
              ? 'bg-[#2dd4bf] text-[#0a1920] font-medium'
              : 'bg-[#0d2029] border border-[rgba(45,212,191,0.08)] text-gray-400 hover:text-[#e0f7fa] hover:border-[#2dd4bf]/30'
          }`}
        >
          Все
        </button>

        {displayCategories.map((cat: any) => {
          const category = cat.attributes || cat;
          const isActive = isCategorySelected(category.slug);
          const count = category.posts?.data?.length || category.posts?.length || 0;

          return (
            <button
              key={category.slug || cat.id}
              onClick={() => toggleCategory(category.slug)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#2dd4bf] text-[#0a1920] font-medium'
                  : 'bg-[#0d2029] border border-[rgba(45,212,191,0.08)] text-gray-400 hover:text-[#e0f7fa] hover:border-[#2dd4bf]/30'
              }`}
            >
              {category.icon && <span>{category.icon}</span>}
              {category.name}
              <span className={`text-[10px] ${isActive ? 'text-[#0a1920]/60' : 'text-gray-500'}`}>
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