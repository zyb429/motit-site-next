'use client';

import { useStrapiData, useStrapiBySlug } from './useStrapiData';
import type { PageAttributes, FetchOptions } from '@/types/strapi';

export function usePages(options: FetchOptions = {}) {
  return useStrapiData<PageAttributes>('/pages', options);
}

export function usePageBySlug(slug: string, options: FetchOptions = {}) {
  const { data, ...rest } = useStrapiBySlug<PageAttributes>('/pages', slug, options);
  return { page: data?.data?.[0], ...rest };
}