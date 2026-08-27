'use client';

import { useStrapiData, useStrapiBySlug } from './useStrapiData';
import type { PostAttributes, FetchOptions } from '@/types/strapi';

export function usePosts(options: FetchOptions = {}) {
  const defaultOptions: FetchOptions = {
    populate: ['author', 'featured_image', 'category'],
    sort: ['publishedAt:desc'],
    ...options,
  };
  return useStrapiData<PostAttributes>('/posts', defaultOptions);
}

export function usePublishedPosts(options: FetchOptions = {}) {
  const filters = { filters: { post_status: { $eq: 'published' } } };
  return useStrapiData<PostAttributes>('/posts', {
    populate: ['author', 'featured_image', 'category'],
    sort: ['publishedAt:desc'],
    ...options,
    ...filters,
  });
}

export function usePostBySlug(slug: string, options: FetchOptions = {}) {
  const defaultOptions: FetchOptions = {
    populate: ['author', 'featured_image', 'category'],
    ...options,
  };
  const { data, ...rest } = useStrapiBySlug<PostAttributes>('/posts', slug, defaultOptions);
  return { post: data?.data?.[0], ...rest };
}

export function usePostsByCategory(categorySlug: string, options: FetchOptions = {}) {
  const filters = { filters: { category: { slug: { $eq: categorySlug } } } };
  return useStrapiData<PostAttributes>('/posts', {
    populate: ['author', 'featured_image', 'category'],
    sort: ['publishedAt:desc'],
    ...options,
    ...filters,
  });
}