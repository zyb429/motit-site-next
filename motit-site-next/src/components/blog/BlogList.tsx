'use client';

import { usePublishedPosts, usePostsByCategory } from '@/hooks/usePosts';
import { useCategories } from '@/hooks/useCategories';
import { BlogCard } from './BlogCard';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

function BlogListContent({ categorySlug, pageSize = 9 }: { categorySlug?: string; pageSize?: number }) {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get('category') || categorySlug;
  
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(categoryFromUrl);

  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const { data: postsData, isLoading: postsLoading, error } = selectedCategory
    ? usePostsByCategory(selectedCategory, { pagination: { page: 1, pageSize } })
    : usePublishedPosts({ pagination: { page: 1, pageSize } });

  useEffect(() => {
    const url = new URL(window.location.href);
    if (selectedCategory) {
      url.searchParams.set('category', selectedCategory);
    } else {
      url.searchParams.delete('category');
    }
    window.history.replaceState({}, '', url.toString());
  }, [selectedCategory]);

  if (postsLoading) {
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

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Ошибка загрузки: {error.message}</p>
      </div>
    );
  }

  if (!postsData?.data || postsData.data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          {selectedCategory ? 'В этой категории пока нет постов' : 'Постов пока нет'}
        </p>
      </div>
    );
  }

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
          {categoriesData.data.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.attributes.slug)}
              className={`px-4 py-2 rounded-full text-sm transition ${
                selectedCategory === category.attributes.slug
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {category.attributes.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {postsData.data.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

export function BlogList(props: { categorySlug?: string; pageSize?: number }) {
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
