'use client';

import { useStrapiData } from './useStrapiData';
import type { HomePageAttributes, FetchOptions } from '@/types/strapi';

export function useHomePage(options: FetchOptions = {}) {
  const defaultOptions: FetchOptions = {
    populate: ['hero_background'],
    ...options,
  };
  return useStrapiData<HomePageAttributes>('/home-page', defaultOptions);
}