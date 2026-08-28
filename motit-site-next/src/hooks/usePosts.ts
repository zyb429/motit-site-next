'use client';

import { useStrapiData, useStrapiBySlug, useStrapiLive } from './useStrapiData';
import type { PostAttributes, FetchOptions } from '@/types/strapi';

export function usePosts(options: FetchOptions = {}) {
  const defaultOptions: FetchOptions = {
    populate: ['category', 'admin_user'],
    sort: ['publishedAt:desc'],
    ...options,
  };
  return useStrapiData<PostAttributes>('/posts', defaultOptions);
}

export function usePublishedPosts(options: FetchOptions = {}) {
  const filters = { 
    filters: { 
      post_status: { $eq: 'published' }
    } 
  };
  
  return useStrapiLive<PostAttributes>('/posts', {
    populate: ['category', 'admin_user'],
    sort: ['publishedAt:desc'],
    ...options,
    ...filters,
  });
}

export function usePostBySlug(slug: string, options: FetchOptions = {}) {
  // ✅ Проверяем, что slug - строка
  const safeSlug = typeof slug === 'string' ? slug : '';
  
  const defaultOptions: FetchOptions = {
    populate: ['category', 'admin_user'],
    ...options,
  };
  
  const { data, ...rest } = useStrapiBySlug<PostAttributes>('/posts', safeSlug, defaultOptions);
  
  return { 
    post: data?.data?.[0] || null, 
    ...rest 
  };
}

export function usePostsByCategory(categorySlug: any, options: FetchOptions = {}) {
  // ✅ Принудительно преобразуем в строку
  let slug = '';
  
  if (typeof categorySlug === 'string') {
    slug = categorySlug;
  } else if (categorySlug && typeof categorySlug === 'object') {
    try {
      slug = categorySlug?.slug || 
             categorySlug?.data?.attributes?.slug || 
             categorySlug?.attributes?.slug ||
             String(categorySlug) ||
             '';
    } catch (e) {
      slug = '';
    }
  } else if (categorySlug && typeof categorySlug !== 'undefined') {
    try {
      slug = String(categorySlug);
    } catch (e) {
      slug = '';
    }
  }
  
  if (!slug || typeof slug !== 'string' || slug.length === 0) {
    console.warn('usePostsByCategory: invalid categorySlug:', categorySlug);
    return useStrapiData<PostAttributes>('/posts', {
      populate: ['category', 'admin_user'],
      sort: ['publishedAt:desc'],
      ...options,
      filters: { id: { $eq: -1 } },
    });
  }
  
  const filters = { 
    filters: { 
      category: { 
        slug: { $eq: slug } 
      } 
    } 
  };
  
  return useStrapiData<PostAttributes>('/posts', {
    populate: ['category', 'admin_user'],
    sort: ['publishedAt:desc'],
    ...options,
    ...filters,
  });
}

export function useAllPostsWithDrafts(options: FetchOptions = {}) {
  const defaultOptions: FetchOptions = {
    populate: ['category', 'admin_user'],
    sort: ['publishedAt:desc'],
    publicationState: 'preview',
    ...options,
  };
  
  return useStrapiData<PostAttributes>('/posts', defaultOptions);
}

export function useDraftPosts(options: FetchOptions = {}) {
  const filters = { 
    filters: { 
      post_status: { $eq: 'draft' }
    } 
  };
  
  return useStrapiData<PostAttributes>('/posts', {
    populate: ['category', 'admin_user'],
    sort: ['createdAt:desc'],
    publicationState: 'preview',
    ...options,
    ...filters,
  });
}

export function usePublishedPostsPaginated(
  page: number = 1,
  pageSize: number = 9,
  options: Omit<FetchOptions, 'pagination'> = {}
) {
  const filters = { 
    filters: { 
      post_status: { $eq: 'published' }
    } 
  };
  
  return useStrapiLive<PostAttributes>('/posts', {
    populate: ['category', 'admin_user'],
    sort: ['publishedAt:desc'],
    pagination: { page, pageSize },
    ...options,
    ...filters,
  });
}