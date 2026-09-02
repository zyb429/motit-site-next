// src/components/blog/BlogList.tsx
'use client';

import { usePublishedPosts, usePostsByCategory } from '@/hooks/usePosts';
import { useCategories } from '@/hooks/useCategories';
import { BlogCard } from './BlogCard';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import type { CategoryAttributes, CategoryData } from '@/lib/strapi';

interface BlogListProps {
  initialPosts?: any;
  categorySlug?: string;
  pageSize?: number;
}

function BlogListContent({ 
  initialPosts, 
  categorySlug, 
  pageSize = 9 
}: BlogListProps) {
  const searchParams = useSearchParams();
  
  // БЕЗОПАСНОЕ получение category из URL
  let categoryFromUrl = '';
  try {
    const raw = searchParams.get('category');
    if (raw && typeof raw === 'string') {
      categoryFromUrl = raw;
    }
  } catch (e) {
    console.warn('Error getting category from URL:', e);
  }
  
  // Используем category из URL или из пропсов
  const initialCategory = categoryFromUrl || categorySlug || '';
  
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    initialCategory || undefined
  );

  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  
  // Передаем только если selectedCategory - строка
  const shouldFilter = selectedCategory && typeof selectedCategory === 'string' && selectedCategory.length > 0;
  
  const { data: postsData, isLoading: postsLoading, error } = shouldFilter
    ? usePostsByCategory(selectedCategory, { pagination: { page: 1, pageSize } })
    : usePublishedPosts({ pagination: { page: 1, pageSize } });

  useEffect(() => {
    const url = new URL(window.location.href);
    if (selectedCategory && typeof selectedCategory === 'string' && selectedCategory.length > 0) {
      url.searchParams.set('category', selectedCategory);
    } else {
      url.searchParams.delete('category');
    }
    window.history.replaceState({}, '', url.toString());
  }, [selectedCategory]);

  const displayPosts = initialPosts || postsData?.data || [];

  if (!initialPosts && postsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (error && !initialPosts) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Ошибка загрузки: {error.message}</p>
      </div>
    );
  }

  if (!displayPosts || displayPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          {selectedCategory ? 'В этой категории пока нет постов' : 'Постов пока нет'}
        </p>
      </div>
    );
  }

  const hasDrafts = displayPosts.some(
    (post: any) => post?.attributes?.post_status === 'draft'
  );

  return (
    <div>
      {categoriesData?.data && categoriesData.data.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory(undefined)}
            className={`px-4 py-2 rounded-full text-sm transition ${
              !selectedCategory
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Все
          </button>
          {categoriesData.data.map((cat) => {
            const category = cat.attributes || cat;
            return (
            <button
              key={category.slug || cat.id}
              onClick={() => setSelectedCategory(category.slug)}
              className={`px-4 py-2 rounded-full text-sm transition ${
                selectedCategory === category.slug
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {category.name}
            </button>
          );
          })}
        </div>
      )}

      {hasDrafts && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            🔧 Режим превью: показаны черновики
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayPosts.map((post: any) => (
          <BlogCard key={post.id || post.documentId} post={post} />
        ))}
      </div>
    </div>
  );
}

export function BlogList(props: BlogListProps) {
  return (
    <Suspense fallback={
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    }>
      <BlogListContent {...props} />
    </Suspense>
  );
}