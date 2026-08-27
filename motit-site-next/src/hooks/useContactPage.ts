'use client';

import { useStrapiData } from './useStrapiData';
import type { ContactPageAttributes, FetchOptions } from '@/types/strapi';

export function useContactPage(options: FetchOptions = {}) {
  return useStrapiData<ContactPageAttributes>('/contact-page', options);
}