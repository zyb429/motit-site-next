'use client';

import { useStrapiData } from './useStrapiData';
import type { AboutPageAttributes, FetchOptions } from '@/types/strapi';

export function useAboutPage(options: FetchOptions = {}) {
  return useStrapiData<AboutPageAttributes>('/about-page', options);
}