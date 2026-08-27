'use client';

import { useStrapiData } from './useStrapiData';
import type { CertificateAttributes, FetchOptions } from '@/types/strapi';

export function useCertificates(options: FetchOptions = {}) {
  const defaultOptions: FetchOptions = {
    populate: ['issuer'],
    sort: ['order:asc'],
    ...options,
  };
  return useStrapiData<CertificateAttributes>('/certificates', defaultOptions);
}

export function useActiveCertificates(options: FetchOptions = {}) {
  const filters = { filters: { is_active: { $eq: true } } };
  return useStrapiData<CertificateAttributes>('/certificates', {
    populate: ['issuer'],
    sort: ['order:asc'],
    ...options,
    ...filters,
  });
}