'use client';

import { useStrapiData } from './useStrapiData';
import type { StatusAttributes, FetchOptions } from '@/types/strapi';

export function useStatuses(options: FetchOptions = {}) {
  return useStrapiData<StatusAttributes>('/statuses', options);
}

export function useStatus(id: string | number, options: FetchOptions = {}) {
  const { data, ...rest } = useStrapiItem<StatusAttributes>('/statuses', id, options);
  return { status: data?.data, ...rest };
}