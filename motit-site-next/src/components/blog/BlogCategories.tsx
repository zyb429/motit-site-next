'use client';

import Link from 'next/link';
import { useCategories } from '@/hooks/useCategories';
import { ChevronRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface BlogCategoriesProps {
  currentCategory?: string;
}

export function BlogCategories({ currentCategory }: BlogCategoriesProps) {
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories({
    sort: ['name:asc'],
    populate: ['posts'],
  });

  // ✅ Добавляем отладку
  console.log('🔍 BlogCategories - data:', categoriesData);
  console.log('🔍 BlogCategories - loading:', categoriesLoading);

  // ✅ Нормализуем данные категорий
  const categories = categoriesData?.data || [];
  const [showAll, setShowAll] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Проверяем, помещаются ли категории в одну строку
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

  if (categoriesLoading || categories.length === 0) return null;

  const displayCategories = showAll ? categories : categories.slice(0, 8);

  // ✅ Логируем категории для проверки
  console.log('📊 Display categories:', displayCategories.map((cat: any) => {
    const category = cat.attributes || cat;
    return {
      name: category.name,
      slug: category.slug,
      postsCount: category.posts?.length || 0,
      postsData: category.posts,
    };
  }));

  return (
    <div className="mb-8">
      {/* Заголовок */}
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

      {/* Категории */}
      <div 
        ref={containerRef}
        className="flex flex-wrap gap-2"
      >
        {/* Кнопка "Все" */}
        <Link
          href="/blog"
          className={`px-3 py-1.5 rounded-full text-sm transition-colors whitespace-nowrap ${
            !currentCategory
              ? 'bg-[#2dd4bf] text-[#0a1920] font-medium'
              : 'bg-[#0d2029] border border-[rgba(45,212,191,0.08)] text-gray-400 hover:text-[#e0f7fa] hover:border-[#2dd4bf]/30'
          }`}
        >
          Все
        </Link>

        {/* Категории */}
        {displayCategories.map((cat: any) => {
          // ✅ Нормализация данных категории
          const category = cat.attributes || cat;
          const isActive = currentCategory === category.slug;
          
          // ✅ Считаем количество постов в категории (проверяем оба варианта)
          const count = category.posts?.data?.length || category.posts?.length || 0;

          // ✅ Логируем каждую категорию
          console.log(`📊 Category ${category.name}: posts count = ${count}, posts =`, category.posts);

          return (
            <Link
              key={category.slug || cat.id}
              href={`/blog?category=${category.slug}`}
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
            </Link>
          );
        })}
      </div>
    </div>
  );
}