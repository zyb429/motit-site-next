'use client';

import { useStrapiData } from './useStrapiData';
import type { IssuerAttributes, FetchOptions } from '@/types/strapi';

export function useIssuers(options: FetchOptions = {}) {
  return useStrapiData<IssuerAttributes>('/issuers', options);
}