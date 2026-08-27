'use client';

import { useStrapiData } from './useStrapiData';
import type { CategoryAttributes, FetchOptions } from '@/types/strapi';

export function useCategories(options: FetchOptions = {}) {
  return useStrapiData<CategoryAttributes>('/categories', options);
}

export function useCategory(id: string | number, options: FetchOptions = {}) {
  const { data, ...rest } = useStrapiItem<CategoryAttributes>('/categories', id, options);
  return { category: data?.data, ...rest };
}

export function useCategoryBySlug(slug: string, options: FetchOptions = {}) {
  const { data, ...rest } = useStrapiBySlug<CategoryAttributes>('/categories', slug, options);
  return { category: data?.data?.[0], ...rest };
}