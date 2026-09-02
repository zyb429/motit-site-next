// motit-site-next/src/lib/strapi.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || '';

export const strapiApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(STRAPI_API_TOKEN && { 
      Authorization: `Bearer ${STRAPI_API_TOKEN}` 
    }),
  },
});

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

// ДОБАВЛЯЕМ ТИПЫ ДЛЯ КАТЕГОРИЙ
export interface CategoryAttributes {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface CategoryData {
  id: number;
  documentId?: string;
  attributes: CategoryAttributes;
}

export interface CategoryListResponse {
  data: CategoryData[];
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// ДОБАВЛЯЕМ ТИПЫ ДЛЯ ПОСТОВ С КАТЕГОРИЯМИ
export interface PostCategoryRelation {
  data: StrapiData<CategoryAttributes>;
}

export interface PostCategoriesRelation {
  data: StrapiData<CategoryAttributes>[];
}

export interface PostAttributes {
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  post_status: 'draft' | 'published' | 'archived';
  meta_title?: string;
  meta_description?: string;
  seo_data?: Record<string, unknown>;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  admin_user?: {
    data: StrapiData<{
      id: number;
      username: string;
      email: string;
      firstname?: string;
      lastname?: string;
    }>;
  };
  categories?: PostCategoriesRelation;
  featured_image?: {
    url?: string;
    data?: {
      attributes?: {
        url?: string;
        alternativeText?: string;
        width?: number;
        height?: number;
        formats?: {
          thumbnail?: { url: string };
          small?: { url: string };
          medium?: { url: string };
          large?: { url: string };
        };
      };
    };
  };
  content_blocks?: Array<{
    __component: string;
    text?: string;
    heading_level?: string;
    image?: {
      url?: string;
      data?: {
        attributes?: { url?: string };
      };
    };
    caption?: string;
    quote_text?: string;
    quote_author?: string;
    code_language?: string;
    code_content?: string;
    button_text?: string;
    button_url?: string;
    video_url?: string;
    gallery_images?: {
      data?: Array<{
        attributes?: {
          url?: string;
          alternativeText?: string;
        };
      }>;
    };
  }>;
}

export interface PostResponse {
  data: StrapiData<PostAttributes>[];
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// ==================== API FUNCTIONS ====================

export async function fetchAPI<T>(
  endpoint: string,
  options: FetchOptions = {},
  isDraftMode: boolean = false
): Promise<T> {
  const url = new URL(`${API_URL}/api${endpoint}`);
  
  // В Strapi v5 используем post_status для фильтрации
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
  
  // ИСПРАВЛЕННЫЙ блок фильтров
  if (options.filters) {
    console.log('🔍 [fetchAPI] processing filters:', JSON.stringify(options.filters, null, 2));
    
    Object.entries(options.filters).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        // Правильно обрабатываем вложенные объекты
        Object.entries(value as Record<string, unknown>).forEach(([subKey, subValue]) => {
          // Если subValue - объект с оператором (например, $eq, $containsi)
          if (typeof subValue === 'object' && subValue !== null) {
            Object.entries(subValue as Record<string, unknown>).forEach(([operator, operatorValue]) => {
              url.searchParams.append(
                `filters[${key}][${subKey}][${operator}]`,
                String(operatorValue)
              );
            });
          } else {
            // Если subValue - простое значение
            url.searchParams.append(
              `filters[${key}][${subKey}]`,
              String(subValue)
            );
          }
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
    console.log('🔍 [fetchAPI] final URL:', url.toString());
    const response = await strapiApi.get(url.toString());
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ API Error:', {
        endpoint,
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.response?.data?.error?.message || error.message,
        url: url.toString(),
        data: error.response?.data,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
        },
      });
      const errorMessage = error.response?.data?.error?.message || error.message;
      throw new Error(`API Error (${error.response?.status || 'unknown'}): ${errorMessage}`);
    }
    throw error;
  }
}

// ==================== УНИВЕРСАЛЬНЫЕ ФУНКЦИИ ДЛЯ КАТЕГОРИЙ ====================

/**
 * 🔥 Универсальная функция для получения категорий из поста
 * Работает и с category (одиночная) и с categories (множественная)
 */
export function getPostCategories(post: any): CategoryAttributes[] {
  const attrs = post?.attributes || post || {};
  const result: CategoryAttributes[] = [];

  // Пробуем получить из categories (множественная)
  if (attrs.categories) {
    const categories = attrs.categories.data || attrs.categories;
    if (Array.isArray(categories)) {
      categories.forEach((cat: any) => {
        const category = cat.attributes || cat;
        if (category && category.name) {
          result.push(category);
        }
      });
    }
    // Если categories - это объект с data
    if (categories?.data && Array.isArray(categories.data)) {
      categories.data.forEach((cat: any) => {
        const category = cat.attributes || cat;
        if (category && category.name) {
          result.push(category);
        }
      });
    }
  }
  
  return result;
}

/**
 * 🔥 Универсальная функция для получения первой категории поста
 */
export function getFirstCategory(post: any): CategoryAttributes | null {
  const categories = getPostCategories(post);
  return categories.length > 0 ? categories[0] : null;
}

/**
 * 🔥 Универсальная функция для получения populate полей
 * Включает и category, и categories для совместимости
 */
export function getDefaultPopulate(): string[] {
  return [
    'categories',
    'admin_user', 
    'featured_image', 
    'content_blocks', 
    'content_blocks.image', 
    'content_blocks.gallery_images'
  ];
}

// ==================== SERVER CONVENIENCE FUNCTIONS ====================

/**
 * Серверная функция для получения постов
 * Поддерживает оба варианта: category (одиночная) и categories (множественная)
 */
export async function getPosts(options: FetchOptions = {}, isDraftMode: boolean = false): Promise<PostResponse> {
  // ✅ Создаем базовые опции
  const defaultOptions: FetchOptions = {
    populate: getDefaultPopulate(),
    sort: ['publishedAt:desc'],
  };
  
  // ✅ Объединяем с переданными опциями
  const mergedOptions: FetchOptions = {
    ...defaultOptions,
    ...options,
    // ✅ Если передан filters, объединяем с существующими
    ...(options.filters && { filters: options.filters }),
  };
  
  // ✅ Логируем для отладки
  console.log('🔍 [getPosts] options:', JSON.stringify(options, null, 2));
  console.log('🔍 [getPosts] mergedOptions:', JSON.stringify(mergedOptions, null, 2));
  
  if (isDraftMode) {
    if (!mergedOptions.filters) {
      mergedOptions.filters = {};
    }
    (mergedOptions.filters as Record<string, unknown>)['post_status'] = {
      $eq: 'draft' 
    };
  }
  
  return fetchAPI<PostResponse>('/posts', mergedOptions, isDraftMode);
}

/**
 * 🔥 Серверная функция для получения опубликованных постов
 */
export async function getPublishedPosts(options: FetchOptions = {}): Promise<PostResponse> {
  const filters = { 
    filters: { 
      post_status: { $eq: 'published' } 
    } 
  };
  
  const defaultOptions: FetchOptions = {
    populate: ['categories', 'admin_user'],
    sort: ['publishedAt:desc'],
    ...options,
    ...filters,
  };
  
  return fetchAPI<PostResponse>('/posts', defaultOptions, false);
}

/**
 * 🔥 Серверная функция для получения поста по slug
 */
export async function getPostBySlug(slug: string, options: FetchOptions = {}, isDraftMode: boolean = false): Promise<StrapiData<PostAttributes> | null> {
  const defaultOptions: FetchOptions = {
    populate: getDefaultPopulate(),
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
  
  const response = await fetchAPI<PostResponse>('/posts', defaultOptions, isDraftMode);
  
  return response.data?.[0] || null;
}

/**
 * 🔥 Получение постов по категории (универсально)
 * Поддерживает оба варианта: и category, и categories
 */
export async function getPostsByCategory(
  categorySlug: string,
  options: FetchOptions = {},
  isDraftMode: boolean = false
): Promise<PostResponse> {
  const defaultOptions: FetchOptions = {
    populate: getDefaultPopulate(),
    filters: {
      categories: {
        slug: { $eq: categorySlug }
      }
    },
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
  
  return fetchAPI<PostResponse>('/posts', defaultOptions, isDraftMode);
}

/**
 * 🔥 Получение всех категорий
 */
export async function getAllCategories(options: FetchOptions = {}): Promise<CategoryListResponse> {
  const defaultOptions: FetchOptions = {
    sort: ['name:asc'],
    ...options,
  };
  
  return fetchAPI<CategoryListResponse>('/categories', defaultOptions, false);
}

/**
 * 🔥 Получение категории по slug
 */
export async function getCategoryBySlug(slug: string): Promise<CategoryData | null> {
  const response = await fetchAPI<CategoryListResponse>('/categories', {
    filters: { slug: { $eq: slug } },
  }, false);
  
  return response.data?.[0] || null;
}

/**
 * 🔥 Получение настройки по ключу
 */
export async function getSetting(key: string): Promise<string | null> {
  try {
    const response = await fetchAPI<StrapiListResponse<{
      key: string;
      value: string;
      description?: string;
    }>>('/settings', {
      filters: { key: { $eq: key } },
    }, false);
    
    const setting = response.data?.[0];
    return setting?.attributes?.value || null;
  } catch (error) {
    console.error(`Error getting setting "${key}":`, error);
    return null;
  }
}

/**
 * 🔥 Получение количества постов на странице
 */
export async function getPostsPerPage(): Promise<number> {
  const value = await getSetting('posts_per_page');
  const parsed = parseInt(value || '6', 10);
  return isNaN(parsed) || parsed < 1 ? 6 : parsed;
}

/**
 * 🔥 Получение всех настроек
 */
export async function getAllSettings(): Promise<Record<string, string>> {
  try {
    const response = await fetchAPI<StrapiListResponse<{
      key: string;
      value: string;
      description?: string;
    }>>('/settings', {}, false);
    
    const settings: Record<string, string> = {};
    response.data?.forEach((item) => {
      if (item.attributes) {
        settings[item.attributes.key] = item.attributes.value;
      }
    });
    return settings;
  } catch (error) {
    console.error('Error getting all settings:', error);
    return {};
  }
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
    populate: ['categories', 'admin_user'],
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

/**
 * Универсальная функция фильтрации по категории
 * Поддерживает оба варианта: category и categories
 */
export function getCategoryFilter(slug: string) {
  return {
    filters: {
      $or: [
        { categories: { slug: { $eq: slug } } }
      ]
    }
  };
}
