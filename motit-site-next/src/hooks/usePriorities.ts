'use client';

import { useStrapiData } from './useStrapiData';
import type { PriorityAttributes, FetchOptions } from '@/types/strapi';

export function usePriorities(options: FetchOptions = {}) {
  return useStrapiData<PriorityAttributes>('/priorities', options);
}

export function usePriority(id: string | number, options: FetchOptions = {}) {
  const { data, ...rest } = useStrapiItem<PriorityAttributes>('/priorities', id, options);
  return { priority: data?.data, ...rest };
}