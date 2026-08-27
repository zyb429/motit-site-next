'use client';

import { useStrapiData } from './useStrapiData';
import type { PartnerAttributes, FetchOptions } from '@/types/strapi';

export function usePartners(options: FetchOptions = {}) {
  const defaultOptions: FetchOptions = {
    sort: ['order:asc'],
    ...options,
  };
  return useStrapiData<PartnerAttributes>('/partners', defaultOptions);
}