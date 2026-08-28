// motit-site-next/src/lib/strapi.ts
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
  locale?: string;
  status?: 'draft' | 'published' | 'archived';
}

export interface StrapiData<T> {
  id: number;
  documentId?: string;
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

export async function fetchAPI<T>(
  endpoint: string,
  options: FetchOptions = {},
  isDraftMode: boolean = false
): Promise<T> {
  const url = new URL(`${API_URL}/api${endpoint}`);
  
  // 🔥 В Strapi v5 используем post_status для фильтрации
  if (isDraftMode) {
    if (!options.filters) {
      options.filters = {};
    }
    (options.filters as Record<string, unknown>)['post_status'] = { 
      $eq: 'draft' 
    };
  }
  
  // Добавляем populate
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

// ==================== SERVER CONVENIENCE FUNCTIONS ====================

/**
 * 🔥 Серверная функция для получения постов
 */
export async function getPosts(options: FetchOptions = {}, isDraftMode: boolean = false) {
  const defaultOptions: FetchOptions = {
    populate: ['category', 'admin_user', 'featured_image', 'content_blocks', 'content_blocks.image', 'content_blocks.gallery_images'],
    sort: ['publishedAt:desc'],
    ...options,
  };
  
  if (isDraftMode) {
    if (!defaultOptions.filters) {
      defaultOptions.filters = {};
    }
    (defaultOptions.filters as Record<string, unknown>)['post_status'] = {
      $eq: 'draft' 
    };
  }
  
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
    admin_user?: {
      data: StrapiData<{
        id: number;
        username: string;
        email: string;
        firstname?: string;
        lastname?: string;
      }>;
    };
    category?: {
      data: StrapiData<{
        name: string;
        slug: string;
        description?: string;
      }>;
    };
  }>>('/posts', defaultOptions, isDraftMode);
}

/**
 * 🔥 Серверная функция для получения опубликованных постов
 */
export async function getPublishedPosts(options: FetchOptions = {}) {
  const filters = { 
    filters: { 
      post_status: { $eq: 'published' } 
    } 
  };
  
  const defaultOptions: FetchOptions = {
    populate: ['category', 'admin_user'],
    sort: ['publishedAt:desc'],
    ...options,
    ...filters,
  };
  
  return fetchAPI<StrapiListResponse<{
    title: string;
    slug: string;
    content?: string;
    excerpt?: string;
    post_status: 'published';
    meta_title?: string;
    meta_description?: string;
    seo_data?: Record<string, unknown>;
    publishedAt?: string;
    admin_user?: {
      data: StrapiData<{
        id: number;
        username: string;
        email: string;
        firstname?: string;
        lastname?: string;
      }>;
    };
    category?: {
      data: StrapiData<{
        name: string;
        slug: string;
        description?: string;
      }>;
    };
  }>>('/posts', defaultOptions, false);
}

/**
 * 🔥 Серверная функция для получения поста по slug
 */
export async function getPostBySlug(slug: string, options: FetchOptions = {}, isDraftMode: boolean = false) {
  const defaultOptions: FetchOptions = {
    populate: ['category', 'admin_user', 'featured_image', 'content_blocks', 'content_blocks.image', 'content_blocks.gallery_images'],
    filters: { slug: { $eq: slug } },
    ...options,
  };
  
  if (isDraftMode) {
    if (!defaultOptions.filters) {
      defaultOptions.filters = {};
    }
    (defaultOptions.filters as Record<string, unknown>)['post_status'] = {
      $eq: 'draft' 
    };
  }
  
  const response = await fetchAPI<StrapiListResponse<{
    title: string;
    slug: string;
    content?: string;
    excerpt?: string;
    post_status: 'draft' | 'published' | 'archived';
    meta_title?: string;
    meta_description?: string;
    seo_data?: Record<string, unknown>;
    publishedAt?: string;
    admin_user?: {
      data: StrapiData<{
        id: number;
        username: string;
        email: string;
        firstname?: string;
        lastname?: string;
      }>;
    };
    category?: {
      data: StrapiData<{
        name: string;
        slug: string;
        description?: string;
      }>;
    };
  }>>('/posts', defaultOptions, isDraftMode);
  
  return response.data?.[0] || null;
}

// ==================== CLIENT CONVENIENCE FUNCTIONS ====================

export function getStatuses(options: FetchOptions = {}) {
  return fetchAPI<StrapiListResponse<{ name: string; color: string; description?: string }>>(
    '/statuses',
    options,
    false
  );
}

export function getPriorities(options: FetchOptions = {}) {
  return fetchAPI<StrapiListResponse<{ name: string; color: string; level: number }>>(
    '/priorities',
    options,
    false
  );
}

export function getCategories(options: FetchOptions = {}) {
  return fetchAPI<StrapiListResponse<{ name: string; slug: string; description?: string; icon?: string }>>(
    '/categories',
    options,
    false
  );
}

export function getTickets(options: FetchOptions = {}) {
  const defaultOptions: FetchOptions = {
    populate: ['client', 'assigned_to', 'status', 'priority', 'category'],
    ...options,
  };
  return fetchAPI<StrapiListResponse<{
    title: string;
    description?: string;
    deadline_at?: string;
    resolved_at?: string;
    client?: { data: StrapiData<{ username: string; full_name: string; email: string }> };
    assigned_to?: { data: StrapiData<{ username: string; full_name: string; email: string }> };
    status?: { data: StrapiData<{ name: string; color: string }> };
    priority?: { data: StrapiData<{ name: string; color: string; level: number }> };
    category?: { data: StrapiData<{ name: string; slug: string }> };
  }>>('/tickets', defaultOptions, false);
}

export function getPostsClient(options: FetchOptions = {}) {
  const defaultOptions: FetchOptions = {
    populate: ['category', 'admin_user'],
    sort: ['publishedAt:desc'],
    ...options,
  };
  return fetchAPI<StrapiListResponse<any>>('/posts', defaultOptions, false);
}

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
  }>>('/home-page', defaultOptions, false);
}

export function getAboutPage(options: FetchOptions = {}) {
  return fetchAPI<StrapiSingleResponse<{
    content?: string;
    mission?: string;
    vision?: string;
    team_members?: Record<string, unknown>;
    history?: string;
  }>>('/about-page', options, false);
}

export function getContactPage(options: FetchOptions = {}) {
  return fetchAPI<StrapiSingleResponse<{
    address?: string;
    phones?: string[];
    emails?: string[];
    social_links?: Record<string, string>;
    map_embed?: string;
  }>>('/contact-page', options, false);
}

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
  }>>('/partners', defaultOptions, false);
}

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
  }>>('/certificates', defaultOptions, false);
}

export function getOrganizations(options: FetchOptions = {}) {
  return fetchAPI<StrapiListResponse<{
    name: string;
    inn?: string;
    address?: string;
    email?: string;
    phone?: string;
    is_active: boolean;
  }>>('/organizations', options, false);
}

export function getTicket(id: string | number, options: FetchOptions = {}) {
  const defaultOptions: FetchOptions = {
    populate: ['client', 'assigned_to', 'status', 'priority', 'category', 'comments'],
    ...options,
  };
  return fetchAPI<StrapiSingleResponse<{
    title: string;
    description?: string;
    deadline_at?: string;
    resolved_at?: string;
    client?: { data: StrapiData<{ username: string; full_name: string; email: string }> };
    assigned_to?: { data: StrapiData<{ username: string; full_name: string; email: string }> };
    status?: { data: StrapiData<{ name: string; color: string }> };
    priority?: { data: StrapiData<{ name: string; color: string; level: number }> };
    category?: { data: StrapiData<{ name: string; slug: string }> };
  }>>(`/tickets/${id}`, defaultOptions, false);
}

export function getPageBySlug(slug: string, options: FetchOptions = {}) {
  const defaultOptions: FetchOptions = {
    filters: { slug: { $eq: slug } },
    ...options,
  };
  return fetchAPI<StrapiListResponse<{
    slug: string;
    title: string;
    sections?: Record<string, unknown>;
    meta_title?: string;
    meta_description?: string;
    seo_data?: Record<string, unknown>;
  }>>('/pages', defaultOptions, false);
}

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

export function getPostStatusFilter(status: 'draft' | 'published' | 'archived') {
  return {
    filters: {
      post_status: { $eq: status }
    }
  };
}

export function getCategoryFilter(slug: string) {
  return {
    filters: {
      category: {
        slug: { $eq: slug }
      }
    }
  };
}