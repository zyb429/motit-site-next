'use client';

import { useStrapiData, useStrapiItem } from './useStrapiData';
import type { OrganizationAttributes, FetchOptions } from '@/types/strapi';

export function useOrganizations(options: FetchOptions = {}) {
  return useStrapiData<OrganizationAttributes>('/organizations', options);
}

export function useOrganization(id: string | number, options: FetchOptions = {}) {
  const { data, ...rest } = useStrapiItem<OrganizationAttributes>('/organizations', id, options);
  return { organization: data?.data, ...rest };
}

export function useActiveOrganizations(options: FetchOptions = {}) {
  const filters = { filters: { is_active: { $eq: true } } };
  return useStrapiData<OrganizationAttributes>('/organizations', {
    ...options,
    ...filters,
  });
}