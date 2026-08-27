'use client';

import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { fetchAPI, FetchOptions, StrapiListResponse, StrapiSingleResponse } from '@/lib/strapi';

/**
 * Базовый хук для получения списка данных из Strapi
 */
export function useStrapiData<T>(
  endpoint: string,
  options: FetchOptions = {},
  queryOptions: Omit<UseQueryOptions<StrapiListResponse<T>, Error>, 'queryKey' | 'queryFn'> = {}
) {
  const queryKey = [endpoint, JSON.stringify(options)];

  return useQuery<StrapiListResponse<T>, Error>({
    queryKey,
    queryFn: () => fetchAPI<StrapiListResponse<T>>(endpoint, options),
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
    ...queryOptions,
  });
}

/**
 * Базовый хук для получения одного элемента из Strapi
 */
export function useStrapiItem<T>(
  endpoint: string,
  id: string | number,
  options: FetchOptions = {},
  queryOptions: Omit<UseQueryOptions<StrapiSingleResponse<T>, Error>, 'queryKey' | 'queryFn'> = {}
) {
  const queryKey = [endpoint, id, JSON.stringify(options)];

  return useQuery<StrapiSingleResponse<T>, Error>({
    queryKey,
    queryFn: () => fetchAPI<StrapiSingleResponse<T>>(`${endpoint}/${id}`, options),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...queryOptions,
  });
}

/**
 * Хук для получения данных по slug (для постов, страниц)
 */
export function useStrapiBySlug<T>(
  endpoint: string,
  slug: string,
  options: FetchOptions = {},
  queryOptions: Omit<UseQueryOptions<StrapiListResponse<T>, Error>, 'queryKey' | 'queryFn'> = {}
) {
  const filters = { filters: { slug: { $eq: slug } } };
  const queryKey = [endpoint, 'slug', slug, JSON.stringify(options)];

  return useQuery<StrapiListResponse<T>, Error>({
    queryKey,
    queryFn: () => fetchAPI<StrapiListResponse<T>>(endpoint, { ...options, ...filters }),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    ...queryOptions,
  });
}