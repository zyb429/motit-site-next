'use client';

import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { fetchAPI, FetchOptions, StrapiListResponse, StrapiSingleResponse } from '@/lib/strapi';

/**
 * Базовый хук для получения списка данных из Strapi
 * Всегда использует live режим на клиенте
 */
export function useStrapiData<T>(
  endpoint: string,
  options: FetchOptions = {},
  queryOptions: Omit<UseQueryOptions<StrapiListResponse<T>, Error>, 'queryKey' | 'queryFn'> = {}
) {
  console.log(`🔍 [useStrapiData] ${endpoint}:`, JSON.stringify(options, null, 2));

  const queryKey = [endpoint, JSON.stringify(options)];

  return useQuery<StrapiListResponse<T>, Error>({
    queryKey,
    queryFn: () => fetchAPI<StrapiListResponse<T>>(endpoint, options, false),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...queryOptions,
  });
}

/**
 * Базовый хук для получения одного элемента из Strapi
 * Всегда использует live режим на клиенте
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
    queryFn: () => fetchAPI<StrapiSingleResponse<T>>(`${endpoint}/${id}`, options, false),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...queryOptions,
  });
}

/**
 * Хук для получения данных по slug (для постов, страниц)
 * Всегда использует live режим на клиенте
 */
export function useStrapiBySlug<T>(
  endpoint: string,
  slug: any,
  options: FetchOptions = {},
  queryOptions: any = {}
) {
  // ✅ Принудительно преобразуем slug в строку
  const safeSlug = typeof slug === 'string' ? slug : String(slug || '');
  
  // ✅ Проверяем, что slug - строка и не пустой
  if (!safeSlug || typeof safeSlug !== 'string') {
    console.warn('useStrapiBySlug: invalid slug:', slug);
    return useQuery<StrapiListResponse<T>, Error>({
      queryKey: [endpoint, 'slug', 'invalid'],
      queryFn: () => Promise.resolve({ data: [], meta: {} } as StrapiListResponse<T>),
      enabled: false,
      ...queryOptions,
    });
  }
  
  const filters = { filters: { slug: { $eq: safeSlug } } };
  const queryKey = [endpoint, 'slug', safeSlug, JSON.stringify(options)];

  return useQuery<StrapiListResponse<T>, Error>({
    queryKey,
    queryFn: () => fetchAPI<StrapiListResponse<T>>(endpoint, { ...options, ...filters }, false),
    enabled: !!safeSlug && typeof safeSlug === 'string',
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    ...queryOptions,
  });
}

// ✅ ДОБАВЛЯЕМ ПРОПУЩЕННЫЕ ЭКСПОРТЫ

/**
 * Принудительное получение данных в режиме LIVE
 * Используется когда нужно гарантированно получить только опубликованные данные
 */
export function useStrapiLive<T>(
  endpoint: string,
  options: FetchOptions = {},
  queryOptions: Omit<UseQueryOptions<StrapiListResponse<T>, Error>, 'queryKey' | 'queryFn'> = {}
) {
  console.log(`🔍 [useStrapiLive] ${endpoint}:`, JSON.stringify(options, null, 2));

  const queryKey = [endpoint, 'live', JSON.stringify(options)];

  return useQuery<StrapiListResponse<T>, Error>({
    queryKey,
    queryFn: () => fetchAPI<StrapiListResponse<T>>(endpoint, options, false),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    ...queryOptions,
  });
}

/**
 * Принудительное получение данных в режиме превью
 * Используется когда нужно гарантированно получить черновики
 */
export function useStrapiPreview<T>(
  endpoint: string,
  options: FetchOptions = {},
  queryOptions: Omit<UseQueryOptions<StrapiListResponse<T>, Error>, 'queryKey' | 'queryFn'> = {}
) {
  const queryKey = [endpoint, 'preview', JSON.stringify(options)];

  return useQuery<StrapiListResponse<T>, Error>({
    queryKey,
    queryFn: () => fetchAPI<StrapiListResponse<T>>(endpoint, options, true),
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    ...queryOptions,
  });
}

/**
 * Получение данных с возможностью ручного обновления
 * Добавляет функцию refetch для принудительного обновления
 */
export function useStrapiDataWithRefetch<T>(
  endpoint: string,
  options: FetchOptions = {},
  queryOptions: Omit<UseQueryOptions<StrapiListResponse<T>, Error>, 'queryKey' | 'queryFn'> = {}
) {
  const queryClient = useQueryClient();
  const queryKey = [endpoint, JSON.stringify(options)];

  const result = useQuery<StrapiListResponse<T>, Error>({
    queryKey,
    queryFn: () => fetchAPI<StrapiListResponse<T>>(endpoint, options, false),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...queryOptions,
  });

  const refetch = () => {
    return queryClient.invalidateQueries({ queryKey });
  };

  return {
    ...result,
    refetch,
  };
}

/**
 * Получение данных с пагинацией
 * Упрощает работу с пагинированными списками
 */
export function useStrapiPaginated<T>(
  endpoint: string,
  page: number = 1,
  pageSize: number = 10,
  options: Omit<FetchOptions, 'pagination'> = {},
  queryOptions: Omit<UseQueryOptions<StrapiListResponse<T>, Error>, 'queryKey' | 'queryFn'> = {}
) {
  const paginationOptions: FetchOptions = {
    ...options,
    pagination: { page, pageSize },
  };
  
  const queryKey = [endpoint, 'paginated', page, pageSize, JSON.stringify(options)];

  return useQuery<StrapiListResponse<T>, Error>({
    queryKey,
    queryFn: () => fetchAPI<StrapiListResponse<T>>(endpoint, paginationOptions, false),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...queryOptions,
  });
}