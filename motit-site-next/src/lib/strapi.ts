// frontend/src/lib/strapi.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

export const strapiApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Если есть API токен
const token = process.env.NEXT_PUBLIC_API_TOKEN;
if (token) {
  strapiApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// ==================== TYPES ====================
export interface FetchOptions {
  populate?: string | Record<string, unknown> | string[];
  filters?: Record<string, unknown>;
  sort?: string | string[];
  pagination?: {
    page?: number;
    pageSize?: number;
    start?: number;
    limit?: number;
  };
  fields?: string[];
  publicationState?: 'live' | 'preview';
  locale?: string;
}

export interface StrapiData<T> {
  id: number;
  attributes: T;
}

export interface StrapiListResponse<T> {
  data: StrapiData<T>[];
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiSingleResponse<T> {
  data: StrapiData<T>;
  meta: Record<string, unknown>;
}

// ==================== API FUNCTIONS ====================

/**
 * Универсальная функция для запросов к Strapi API
 */
export async function fetchAPI<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const url = new URL(`${API_URL}/api${endpoint}`);
  
  // Добавляем populate (загрузка связанных данных)
  if (options.populate) {
    if (typeof options.populate === 'string') {
      url.searchParams.append('populate', options.populate);
    } else if (Array.isArray(options.populate)) {
      options.populate.forEach((field) => {
        url.searchParams.append('populate', field);
      });
    } else {
      url.searchParams.append('populate', JSON.stringify(options.populate));
    }
  }
  
  // Добавляем фильтры
  if (options.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        // Для вложенных фильтров (например, filters[user][id][$eq])
        Object.entries(value as Record<string, unknown>).forEach(([subKey, subValue]) => {
          url.searchParams.append(`filters[${key}][${subKey}]`, String(subValue));
        });
      } else {
        url.searchParams.append(`filters[${key}]`, String(value));
      }
    });
  }
  
  // Добавляем сортировку
  if (options.sort) {
    if (Array.isArray(options.sort)) {
      options.sort.forEach((s) => url.searchParams.append('sort', s));
    } else {
      url.searchParams.append('sort', options.sort);
    }
  }
  
  // Добавляем пагинацию
  if (options.pagination) {
    Object.entries(options.pagination).forEach(([key, value]) => {
      url.searchParams.append(`pagination[${key}]`, String(value));
    });
  }
  
  // Добавляем выбор полей
  if (options.fields) {
    options.fields.forEach((field) => {
      url.searchParams.append('fields', field);
    });
  }
  
  // Добавляем статус публикации
  if (options.publicationState) {
    url.searchParams.append('publicationState', options.publicationState);
  }
  
  // Добавляем локаль
  if (options.locale) {
    url.searchParams.append('locale', options.locale);
  }
  
  try {
    const response = await strapiApi.get(url.toString());
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error?.message || error.message);
    }
    throw error;
  }
}

// ==================== CONVENIENCE FUNCTIONS ====================

/**
 * Получение списка статусов
 */
export function getStatuses(options: FetchOptions = {}) {
  return fetchAPI<StrapiListResponse<{ name: string; color: string; description?: string }>>(
    '/statuses',
    options
  );
}

/**
 * Получение списка приоритетов
 */
export function getPriorities(options: FetchOptions = {}) {
  return fetchAPI<StrapiListResponse<{ name: string; color: string; level: number }>>(
    '/priorities',
    options
  );
}

/**
 * Получение списка категорий
 */
export function getCategories(options: FetchOptions = {}) {
  return fetchAPI<StrapiListResponse<{ name: string; slug: string; description?: string; icon?: string }>>(
    '/categories',
    options
  );
}

/**
 * Получение списка тикетов с populate
 */
export function getTickets(options: FetchOptions = {}) {
  const defaultOptions: FetchOptions = {
    populate: ['client', 'assigned_to', 'ticket_status', 'priority', 'category'],
    ...options,
  };
  return fetchAPI<StrapiListResponse<{
    title: string;
    description?: string;
    deadline_at?: string;
    resolved_at?: string;
    client?: { data: StrapiData<{ username: string; full_name: string; email: string }> };
    assigned_to?: { data: StrapiData<{ username: string; full_name: string; email: string }> };
    ticket_status?: { data: StrapiData<{ name: string; color: string }> };
    priority?: { data: StrapiData<{ name: string; color: string; level: number }> };
    category?: { data: StrapiData<{ name: string; slug: string }> };
  }>>('/tickets', defaultOptions);
}

/**
 * Получение списка постов с populate
 */
export function getPosts(options: FetchOptions = {}) {
  const defaultOptions: FetchOptions = {
    populate: ['author', 'featured_image', 'category'],
    sort: ['publishedAt:desc'],
    ...options,
  };
  return fetchAPI<StrapiListResponse<{
    title: string;
    slug: string;
    content?: string;
    excerpt?: string;
    post_status: 'draft' | 'published' | 'archived';
    meta_title?: string;
    meta_description?: string;
    seo_data?: Record<string, unknown>;
    publishedAt?: string;
    author?: { data: StrapiData<{ username: string; full_name: string }> };
    featured_image?: { data: StrapiData<{ url: string; width: number; height: number; alternativeText?: string }> };
    category?: { data: StrapiData<{ name: string; slug: string }> };
  }>>('/posts', defaultOptions);
}

/**
 * Получение главной страницы
 */
export function getHomePage(options: FetchOptions = {}) {
  const defaultOptions: FetchOptions = {
    populate: ['hero_background'],
    ...options,
  };
  return fetchAPI<StrapiSingleResponse<{
    hero_title?: string;
    hero_subtitle?: string;
    hero_background?: { data: StrapiData<{ url: string; width: number; height: number }> };
    stats?: Record<string, unknown>;
    services_section?: Record<string, unknown>;
    testimonials_section?: Record<string, unknown>;
  }>>('/home-page', defaultOptions);
}

/**
 * Получение страницы "О нас"
 */
export function getAboutPage(options: FetchOptions = {}) {
  return fetchAPI<StrapiSingleResponse<{
    content?: string;
    mission?: string;
    vision?: string;
    team_members?: Record<string, unknown>;
    history?: string;
  }>>('/about-page', options);
}

/**
 * Получение страницы "Контакты"
 */
export function getContactPage(options: FetchOptions = {}) {
  return fetchAPI<StrapiSingleResponse<{
    address?: string;
    phones?: string[];
    emails?: string[];
    social_links?: Record<string, string>;
    map_embed?: string;
  }>>('/contact-page', options);
}

/**
 * Получение партнеров
 */
export function getPartners(options: FetchOptions = {}) {
  const defaultOptions: FetchOptions = {
    sort: ['order:asc'],
    ...options,
  };
  return fetchAPI<StrapiListResponse<{
    name: string;
    website_url?: string;
    image_url?: string;
    order: number;
  }>>('/partners', defaultOptions);
}

/**
 * Получение сертификатов
 */
export function getCertificates(options: FetchOptions = {}) {
  const defaultOptions: FetchOptions = {
    populate: ['issuer'],
    sort: ['order:asc'],
    ...options,
  };
  return fetchAPI<StrapiListResponse<{
    title: string;
    issuer_name?: string;
    image_url?: string;
    issue_date?: string;
    expiry_date?: string;
    is_active: boolean;
    order: number;
    issuer?: { data: StrapiData<{ name: string; website_url?: string }> };
  }>>('/certificates', defaultOptions);
}

/**
 * Получение организаций
 */
export function getOrganizations(options: FetchOptions = {}) {
  return fetchAPI<StrapiListResponse<{
    name: string;
    inn?: string;
    address?: string;
    email?: string;
    phone?: string;
    is_active: boolean;
  }>>('/organizations', options);
}

/**
 * Получение тикета по ID
 */
export function getTicket(id: string | number, options: FetchOptions = {}) {
  const defaultOptions: FetchOptions = {
    populate: ['client', 'assigned_to', 'ticket_status', 'priority', 'category', 'comments'],
    ...options,
  };
  return fetchAPI<StrapiSingleResponse<{
    title: string;
    description?: string;
    deadline_at?: string;
    resolved_at?: string;
    client?: { data: StrapiData<{ username: string; full_name: string; email: string }> };
    assigned_to?: { data: StrapiData<{ username: string; full_name: string; email: string }> };
    ticket_status?: { data: StrapiData<{ name: string; color: string }> };
    priority?: { data: StrapiData<{ name: string; color: string; level: number }> };
    category?: { data: StrapiData<{ name: string; slug: string }> };
  }>>(`/tickets/${id}`, defaultOptions);
}

/**
 * Получение поста по slug
 */
export function getPostBySlug(slug: string, options: FetchOptions = {}) {
  const defaultOptions: FetchOptions = {
    populate: ['author', 'featured_image', 'category'],
    filters: { slug: { $eq: slug } },
    ...options,
  };
  return fetchAPI<StrapiListResponse<{
    title: string;
    slug: string;
    content?: string;
    excerpt?: string;
    post_status: 'draft' | 'published' | 'archived';
    meta_title?: string;
    meta_description?: string;
    seo_data?: Record<string, unknown>;
    publishedAt?: string;
    author?: { data: StrapiData<{ username: string; full_name: string }> };
    featured_image?: { data: StrapiData<{ url: string; width: number; height: number; alternativeText?: string }> };
    category?: { data: StrapiData<{ name: string; slug: string }> };
  }>>('/posts', defaultOptions);
}

/**
 * Получение страницы по slug
 */
export function getPageBySlug(slug: string, options: FetchOptions = {}) {
  const defaultOptions: FetchOptions = {
    filters: { slug: { $eq: slug } },
    ...options,
  };
  return fetchAPI<StrapiListResponse<{
    title: string;
    slug: string;
    sections?: Record<string, unknown>;
    meta_title?: string;
    meta_description?: string;
    seo_data?: Record<string, unknown>;
  }>>('/pages', defaultOptions);
}