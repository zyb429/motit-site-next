'use client';

import { useStrapiData } from './useStrapiData';
import type { CategoryAttributes, FetchOptions } from '@/types/strapi';

export function useCategories(options: FetchOptions = {}) {
  console.log('🔍 [useCategories] options:', JSON.stringify(options, null, 2));
  
  // Убираем populate, чтобы избежать ошибки 500
  const { populate, ...restOptions } = options;
  
  const defaultOptions: FetchOptions = {
    sort: ['name:asc'],
    ...restOptions,
  };
  
  console.log('🔍 [useCategories] defaultOptions:', JSON.stringify(defaultOptions, null, 2));
  
  return useStrapiData<CategoryAttributes>('/categories', defaultOptions);
}

export function useCategory(id: string | number, options: FetchOptions = {}) {
  const { data, ...rest } = useStrapiItem<CategoryAttributes>('/categories', id, options);
  return { category: data?.data, ...rest };
}

export function useCategoryBySlug(slug: string, options: FetchOptions = {}) {
  const { data, ...rest } = useStrapiBySlug<CategoryAttributes>('/categories', slug, options);
  return { category: data?.data?.[0], ...rest };
}