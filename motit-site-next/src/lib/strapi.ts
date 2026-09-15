// motit-site-next/src/lib/strapi.ts
import axios from "axios";
import qs from "qs";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || "";

export const strapiApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    ...(STRAPI_API_TOKEN && {
      Authorization: `Bearer ${STRAPI_API_TOKEN}`,
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
  status?: "draft" | "published" | "archived";
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
  post_status: "draft" | "published" | "archived";
  meta_title?: string;
  meta_description?: string;
  seo_data?: Record<string, unknown>;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  author?: {
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

// ==================== VERSION DETECTION ====================
export type StrapiVersion = "v4" | "v5" | "unknown";

export function detectItemVersion(item: any): StrapiVersion {
  if (!item || typeof item !== "object") return "unknown";
  if (item.attributes && typeof item.attributes === "object") return "v4";
  if ("id" in item || "documentId" in item) return "v5";
  return "unknown";
}

export function detectResponseVersion(raw: any): StrapiVersion {
  if (!raw || typeof raw !== "object") return "unknown";
  const first = Array.isArray(raw.data) ? raw.data[0] : raw.data;
  return detectItemVersion(first);
}

// ==================== UNIVERSAL ACCESSORS (v4 + v5) ====================
/** Возвращает "сырые" поля сущности независимо от версии */
export function getAttrs<T = any>(entity: any): T {
  if (!entity) return {} as T;
  return (entity.attributes ?? entity) as T;
}

/** id */
export function getId(entity: any): number | undefined {
  return entity?.id;
}

/** documentId (v5; в v4 может отсутствовать) */
export function getDocumentId(entity: any): string | undefined {
  return entity?.documentId ?? entity?.attributes?.documentId;
}

/** Relation в виде массива "сырых" полей. Работает v4 и v5. */
export function getRelationArray(entity: any, key: string): any[] {
  const attrs: any = getAttrs(entity);
  const raw = attrs?.[key];
  if (!raw) return [];

  if (Array.isArray(raw)) return raw.map((x) => getAttrs(x));

  if (Array.isArray(raw?.data)) return raw.data.map((x: any) => getAttrs(x));

  if (raw?.data && typeof raw.data === "object") return [getAttrs(raw.data)];

  if (typeof raw === "object" && (raw.id || raw.name)) return [getAttrs(raw)];

  return [];
}

/** Одиночный relation */
export function getRelation(entity: any, key: string): any | null {
  return getRelationArray(entity, key)[0] ?? null;
}

/** Медиа-URL независимо от формы */
export function getMediaUrl(entity: any, key: string): string | null {
  const attrs: any = getAttrs(entity);
  const raw = attrs?.[key];
  if (!raw) return null;

  if (Array.isArray(raw)) return raw[0]?.url ?? null;
  if (raw.url) return raw.url;

  if (raw.data) {
    const d = raw.data;
    if (Array.isArray(d)) return d[0]?.attributes?.url ?? d[0]?.url ?? null;
    return d?.attributes?.url ?? d?.url ?? null;
  }

  return null;
}

// ==================== V5 → V4 NORMALIZER (idempotent) ====================
function isV4Entity(x: any): boolean {
  return (
    !!x &&
    typeof x === "object" &&
    !!x.attributes &&
    typeof x.attributes === "object"
  );
}

function normalizeMediaIdempotent(media: any): any {
  if (!media) return media;
  if (Array.isArray(media)) return media.map(normalizeMediaIdempotent);
  if (media.url || media.formats || media.mime) return media;
  if (media.data) {
    const d = media.data;
    if (Array.isArray(d)) return d.map(normalizeMediaIdempotent);
    return d?.attributes ?? d;
  }
  return media;
}

function normalizeEntityIdempotent(entity: any): any {
  if (entity == null) return entity;
  if (Array.isArray(entity)) return entity.map(normalizeEntityIdempotent);

  // Уже v4 — не трогаем
  if (isV4Entity(entity)) return entity;

  // v5 → v4
  const { id, documentId, ...rest } = entity;
  return {
    id,
    documentId,
    attributes: normalizeAttrsIdempotent(rest),
  };
}

function normalizeAttrsIdempotent(attrs: any): any {
  if (!attrs || typeof attrs !== "object") return attrs;

  const out: any = Array.isArray(attrs) ? [] : {};

  for (const [key, value] of Object.entries(attrs)) {
    if (value == null) {
      out[key] = value;
      continue;
    }

    if (
      key === "featured_image" ||
      key === "avatar" ||
      key === "image" ||
      key === "hero_background" ||
      key.endsWith("_image") ||
      key.endsWith("_background")
    ) {
      out[key] = { data: normalizeMediaIdempotent(value) };
      continue;
    }

    if (Array.isArray(value)) {
      const first = value[0];
      const looksLikeEntity =
        first &&
        typeof first === "object" &&
        ("id" in first || "documentId" in first || "attributes" in first);
      out[key] = looksLikeEntity
        ? { data: value.map((v: any) => normalizeEntityIdempotent(v)) }
        : value;
      continue;
    }

    if (typeof value === "object") {
      const v: any = value;
      if ("data" in v && (v.data === null || typeof v.data === "object")) {
        out[key] = { data: normalizeEntityIdempotent(v.data) };
        continue;
      }
      if ("id" in v || "documentId" in v || "attributes" in v) {
        out[key] = { data: normalizeEntityIdempotent(v) };
        continue;
      }
    }

    out[key] = value;
  }

  return out;
}

export function normalizeResponseIdempotent<T>(raw: any): T {
  if (!raw || typeof raw !== "object") return raw;

  if ("data" in raw && !Array.isArray(raw.data)) {
    return {
      ...raw,
      data: raw.data ? normalizeEntityIdempotent(raw.data) : raw.data,
    } as T;
  }
  if (Array.isArray(raw.data)) {
    return { ...raw, data: raw.data.map(normalizeEntityIdempotent) } as T;
  }
  if ("id" in raw || "documentId" in raw) {
    return normalizeEntityIdempotent(raw) as T;
  }
  return raw;
}

// ==================== API FUNCTIONS ====================

export async function fetchAPI<T>(
  endpoint: string,
  options: FetchOptions = {},
  isDraftMode: boolean = false,
): Promise<T> {
  // Создаем объект параметров для qs
  const queryParams: any = {};

  // В Strapi v5 используем post_status для фильтрации
  if (isDraftMode) {
    if (!options.filters) {
      options.filters = {};
    }
    (options.filters as Record<string, unknown>)["post_status"] = {
      $eq: "draft",
    };
  }

  // Добавляем populate
  if (options.populate) {
    queryParams.populate = options.populate;
  }

  // Добавляем filters
  if (options.filters) {
    queryParams.filters = options.filters;
  }

  // Добавляем sort
  if (options.sort) {
    queryParams.sort = options.sort;
  }

  // Добавляем pagination
  if (options.pagination) {
    queryParams.pagination = options.pagination;
  }

  // Добавляем fields
  if (options.fields) {
    queryParams.fields = options.fields;
  }

  // Добавляем locale
  if (options.locale) {
    queryParams.locale = options.locale;
  }

  // Сериализуем с помощью qs
  const queryString = qs.stringify(queryParams, {
    encodeValuesOnly: true,
    arrayFormat: "indices",
    skipNulls: true,
  });

  const url = `${API_URL}/api${endpoint}${queryString ? `?${queryString}` : ""}`;

  console.log("🔍 [fetchAPI] final URL:", url);

  try {
    const response = await strapiApi.get(url);
    const version = detectResponseVersion(response.data);
    if (process.env.NODE_ENV !== "production") {
      console.log(`[fetchAPI] Strapi version detected: ${version}`);
    }
    return normalizeResponseIdempotent<T>(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("❌ API Error:", {
        endpoint,
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.response?.data?.error?.message || error.message,
        url: url,
        data: error.response?.data,
      });
      const errorMessage =
        error.response?.data?.error?.message || error.message;
      throw new Error(
        `API Error (${error.response?.status || "unknown"}): ${errorMessage}`,
      );
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
  const raw = attrs.categories;

  if (!raw) return [];

  // Strapi v5: categories — прямой массив объектов
  if (Array.isArray(raw)) {
    return raw
      .map((cat: any) => cat?.attributes || cat)
      .filter((cat: any) => cat && cat.name);
  }

  // Strapi v4: categories = { data: [...] }
  if (Array.isArray(raw?.data)) {
    return raw.data
      .map((cat: any) => cat?.attributes || cat)
      .filter((cat: any) => cat && cat.name);
  }

  // На всякий случай — одиночный объект
  if (typeof raw === "object" && raw.name) {
    return [raw];
  }

  return [];
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
    "categories",
    "author", // ← createdBy → author
    "author.avatar",
    "featured_image",
    "content_blocks",
    "content_blocks.image",
    "content_blocks.gallery_images",
  ];
}

// ==================== SERVER CONVENIENCE FUNCTIONS ====================

/**
 * Серверная функция для получения постов
 * Поддерживает оба варианта: category (одиночная) и categories (множественная)
 */
export async function getPosts(
  options: FetchOptions = {},
  isDraftMode: boolean = false,
): Promise<PostResponse> {
  // ✅ Создаем базовые опции
  const defaultOptions: FetchOptions = {
    populate: getDefaultPopulate(),
    sort: ["publishedAt:desc"],
  };

  // ✅ Объединяем с переданными опциями
  const mergedOptions: FetchOptions = {
    ...defaultOptions,
    ...options,
    // ✅ Если передан filters, объединяем с существующими
    ...(options.filters && { filters: options.filters }),
  };

  // ✅ Логируем для отладки
  console.log("🔍 [getPosts] options:", JSON.stringify(options, null, 2));
  console.log(
    "🔍 [getPosts] mergedOptions:",
    JSON.stringify(mergedOptions, null, 2),
  );

  if (isDraftMode) {
    if (!mergedOptions.filters) {
      mergedOptions.filters = {};
    }
    (mergedOptions.filters as Record<string, unknown>)["post_status"] = {
      $eq: "draft",
    };
  }

  return fetchAPI<PostResponse>("/posts", mergedOptions, isDraftMode);
}

/**
 * 🔥 Серверная функция для получения опубликованных постов
 */
export async function getPublishedPosts(
  options: FetchOptions = {},
): Promise<PostResponse> {
  const filters = {
    filters: {
      post_status: { $eq: "published" },
    },
  };

  const defaultOptions: FetchOptions = {
    populate: ["categories", "author"],
    sort: ["publishedAt:desc"],
    ...options,
    ...filters,
  };

  return fetchAPI<PostResponse>("/posts", defaultOptions, false);
}

/**
 * 🔥 Серверная функция для получения поста по slug
 */
export async function getPostBySlug(
  slug: string,
  options: FetchOptions = {},
  isDraftMode: boolean = false,
): Promise<StrapiData<PostAttributes> | null> {
  const defaultOptions: FetchOptions = {
    populate: getDefaultPopulate(),
    filters: { slug: { $eq: slug } },
    ...options,
  };

  if (isDraftMode) {
    if (!defaultOptions.filters) {
      defaultOptions.filters = {};
    }
    (defaultOptions.filters as Record<string, unknown>)["post_status"] = {
      $eq: "draft",
    };
  }

  const response = await fetchAPI<PostResponse>(
    "/posts",
    defaultOptions,
    isDraftMode,
  );

  return response.data?.[0] || null;
}

/**
 * 🔥 Получение постов по категории (универсально)
 * Поддерживает оба варианта: и category, и categories
 */
export async function getPostsByCategory(
  categorySlug: string,
  options: FetchOptions = {},
  isDraftMode: boolean = false,
): Promise<PostResponse> {
  const defaultOptions: FetchOptions = {
    populate: getDefaultPopulate(),
    filters: {
      categories: {
        slug: { $eq: categorySlug },
      },
    },
    sort: ["publishedAt:desc"],
    ...options,
  };

  if (isDraftMode) {
    if (!defaultOptions.filters) {
      defaultOptions.filters = {};
    }
    (defaultOptions.filters as Record<string, unknown>)["post_status"] = {
      $eq: "draft",
    };
  }

  return fetchAPI<PostResponse>("/posts", defaultOptions, isDraftMode);
}

/**
 * 🔥 Получение всех категорий
 */
export async function getAllCategories(
  options: FetchOptions = {},
): Promise<CategoryListResponse> {
  const defaultOptions: FetchOptions = {
    sort: ["name:asc"],
    ...options,
  };

  return fetchAPI<CategoryListResponse>("/categories", defaultOptions, false);
}

/**
 * 🔥 Получение категории по slug
 */
export async function getCategoryBySlug(
  slug: string,
): Promise<CategoryData | null> {
  const response = await fetchAPI<CategoryListResponse>(
    "/categories",
    {
      filters: { slug: { $eq: slug } },
    },
    false,
  );

  return response.data?.[0] || null;
}

/**
 * 🔥 Получение настройки по ключу
 */
export async function getSetting(key: string): Promise<string | null> {
  try {
    const response = await fetchAPI<
      StrapiListResponse<{
        key: string;
        value: string;
        description?: string;
      }>
    >(
      "/settings",
      {
        filters: { key: { $eq: key } },
      },
      false,
    );

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
  const value = await getSetting("posts_per_page");
  const parsed = parseInt(value || "6", 10);
  return isNaN(parsed) || parsed < 1 ? 6 : parsed;
}

/**
 * 🔥 Получение всех настроек
 */
export async function getAllSettings(): Promise<Record<string, string>> {
  try {
    const response = await fetchAPI<
      StrapiListResponse<{
        key: string;
        value: string;
        description?: string;
      }>
    >("/settings", {}, false);

    const settings: Record<string, string> = {};
    response.data?.forEach((item) => {
      if (item.attributes) {
        settings[item.attributes.key] = item.attributes.value;
      }
    });
    return settings;
  } catch (error) {
    console.error("Error getting all settings:", error);
    return {};
  }
}

export async function getCategoriesForPost(
  postDocumentId: string,
): Promise<CategoryAttributes[]> {
  if (!postDocumentId) return [];

  try {
    const response = await fetchAPI<{ data: any[] }>(
      `/categories/by-post/${postDocumentId}`,
      {},
      false,
    );

    return (response.data || []).map((cat: any) => ({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon,
      documentId: cat.document_id,
      publishedAt: cat.published_at,
      createdAt: cat.created_at,
      updatedAt: cat.updated_at,
    }));
  } catch (error) {
    console.error(`getCategoriesForPost(${postDocumentId}) error:`, error);
    return [];
  }
}
// ==================== CLIENT CONVENIENCE FUNCTIONS ====================

export function getStatuses(options: FetchOptions = {}) {
  return fetchAPI<
    StrapiListResponse<{ name: string; color: string; description?: string }>
  >("/statuses", options, false);
}

export function getPriorities(options: FetchOptions = {}) {
  return fetchAPI<
    StrapiListResponse<{ name: string; color: string; level: number }>
  >("/priorities", options, false);
}

export function getCategories(options: FetchOptions = {}) {
  const defaultOptions: FetchOptions = {
    sort: ["name:asc"],
    ...options,
  };
  return fetchAPI<
    StrapiListResponse<{
      name: string;
      slug: string;
      description?: string;
      icon?: string;
    }>
  >("/categories", defaultOptions, false);
}

export function getTickets(options: FetchOptions = {}) {
  const defaultOptions: FetchOptions = {
    populate: ["client", "assigned_to", "status", "priority", "category"],
    ...options,
  };
  return fetchAPI<
    StrapiListResponse<{
      title: string;
      description?: string;
      deadline_at?: string;
      resolved_at?: string;
      client?: {
        data: StrapiData<{
          username: string;
          full_name: string;
          email: string;
        }>;
      };
      assigned_to?: {
        data: StrapiData<{
          username: string;
          full_name: string;
          email: string;
        }>;
      };
      status?: { data: StrapiData<{ name: string; color: string }> };
      priority?: {
        data: StrapiData<{ name: string; color: string; level: number }>;
      };
      category?: { data: StrapiData<{ name: string; slug: string }> };
    }>
  >("/tickets", defaultOptions, false);
}

export function getPostsClient(options: FetchOptions = {}) {
  const defaultOptions: FetchOptions = {
    populate: ["categories", "author"],
    sort: ["publishedAt:desc"],
    ...options,
  };
  return fetchAPI<StrapiListResponse<any>>("/posts", defaultOptions, false);
}

export function getHomePage(options: FetchOptions = {}) {
  const defaultOptions: FetchOptions = {
    populate: ["hero_background"],
    ...options,
  };
  return fetchAPI<
    StrapiSingleResponse<{
      hero_title?: string;
      hero_subtitle?: string;
      hero_background?: {
        data: StrapiData<{ url: string; width: number; height: number }>;
      };
      stats?: Record<string, unknown>;
      services_section?: Record<string, unknown>;
      testimonials_section?: Record<string, unknown>;
    }>
  >("/home-page", defaultOptions, false);
}

export function getAboutPage(options: FetchOptions = {}) {
  return fetchAPI<
    StrapiSingleResponse<{
      content?: string;
      mission?: string;
      vision?: string;
      team_members?: Record<string, unknown>;
      history?: string;
    }>
  >("/about-page", options, false);
}

export function getContactPage(options: FetchOptions = {}) {
  return fetchAPI<
    StrapiSingleResponse<{
      address?: string;
      phones?: string[];
      emails?: string[];
      social_links?: Record<string, string>;
      map_embed?: string;
    }>
  >("/contact-page", options, false);
}

export function getPartners(options: FetchOptions = {}) {
  const defaultOptions: FetchOptions = {
    sort: ["order:asc"],
    ...options,
  };
  return fetchAPI<
    StrapiListResponse<{
      name: string;
      website_url?: string;
      image_url?: string;
      order: number;
    }>
  >("/partners", defaultOptions, false);
}

export function getCertificates(options: FetchOptions = {}) {
  const defaultOptions: FetchOptions = {
    populate: ["issuer"],
    sort: ["order:asc"],
    ...options,
  };
  return fetchAPI<
    StrapiListResponse<{
      title: string;
      issuer_name?: string;
      image_url?: string;
      issue_date?: string;
      expiry_date?: string;
      is_active: boolean;
      order: number;
      issuer?: { data: StrapiData<{ name: string; website_url?: string }> };
    }>
  >("/certificates", defaultOptions, false);
}

export function getOrganizations(options: FetchOptions = {}) {
  return fetchAPI<
    StrapiListResponse<{
      name: string;
      inn?: string;
      address?: string;
      email?: string;
      phone?: string;
      is_active: boolean;
    }>
  >("/organizations", options, false);
}

export function getTicket(id: string | number, options: FetchOptions = {}) {
  const defaultOptions: FetchOptions = {
    populate: [
      "client",
      "assigned_to",
      "status",
      "priority",
      "category",
      "comments",
    ],
    ...options,
  };
  return fetchAPI<
    StrapiSingleResponse<{
      title: string;
      description?: string;
      deadline_at?: string;
      resolved_at?: string;
      client?: {
        data: StrapiData<{
          username: string;
          full_name: string;
          email: string;
        }>;
      };
      assigned_to?: {
        data: StrapiData<{
          username: string;
          full_name: string;
          email: string;
        }>;
      };
      status?: { data: StrapiData<{ name: string; color: string }> };
      priority?: {
        data: StrapiData<{ name: string; color: string; level: number }>;
      };
      category?: { data: StrapiData<{ name: string; slug: string }> };
    }>
  >(`/tickets/${id}`, defaultOptions, false);
}

export function getPageBySlug(slug: string, options: FetchOptions = {}) {
  const defaultOptions: FetchOptions = {
    filters: { slug: { $eq: slug } },
    ...options,
  };
  return fetchAPI<
    StrapiListResponse<{
      slug: string;
      title: string;
      sections?: Record<string, unknown>;
      meta_title?: string;
      meta_description?: string;
      seo_data?: Record<string, unknown>;
    }>
  >("/pages", defaultOptions, false);
}

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

export function getPostStatusFilter(
  status: "draft" | "published" | "archived",
) {
  return {
    filters: {
      post_status: { $eq: status },
    },
  };
}

/**
 * Универсальная функция фильтрации по категории
 * Поддерживает оба варианта: category и categories
 */
export function getCategoryFilter(slug: string) {
  return {
    filters: {
      $or: [{ categories: { slug: { $eq: slug } } }],
    },
  };
}

export async function getAuthorForPost(
  postDocumentId: string,
): Promise<StrapiAuthor | null> {
  if (!postDocumentId) return null;
  try {
    const res = await fetchAPI<any>(
      `/posts/author/${postDocumentId}`,
      {},
      false,
    );

    // Кастомный эндпоинт может вернуть:
    //   { data: { id, documentId, attributes: {...} } }  (после нормализации)
    //   { data: { id, username, ... } }                   (v5-плоский)
    //   { data: null }
    //   { data: [ {...} ] }
    const raw = Array.isArray(res?.data) ? res.data[0] : (res?.data ?? res);

    if (!raw) return null;

    return normalizeAuthor(raw);
  } catch (e) {
    console.warn("[getAuthorForPost] failed:", e);
    return null;
  }
}

export type StrapiAuthor = {
  id: number;
  documentId?: string;
  username: string;
  email?: string;
  full_name?: string;
  firstname?: string;
  lastname?: string;
  avatar_url?: string | null;
  avatar: { url: string } | null;
  bio?: string;
};

/**
 * Получить автора по username.
 * У Strapi 5 users-permissions нет публичного эндпоинта /api/users?filters[username],
 * поэтому пробуем разные варианты.
 */
export async function getAuthorByUsername(
  username: string,
): Promise<StrapiAuthor | null> {
  if (!username) return null;

  try {
    const res = await fetchAPI<any>(
      "/users",
      {
        filters: { username: { $eq: username } },
        populate: ["avatar"],
      },
      false,
    );

    // /users отдаёт массив напрямую, но подстрахуемся на { data: [...] }
    const list: any[] = Array.isArray(res)
      ? res
      : Array.isArray(res?.data)
        ? res.data
        : res?.data
          ? [res.data]
          : [];

    const user = list[0];
    if (!user) return null;

    return normalizeAuthor(user);
  } catch (e) {
    console.warn("[getAuthorByUsername] failed:", e);
    return null;
  }
}

function normalizeAuthor(user: any): StrapiAuthor {
  if (!user) return null as any;

  const attrs: any = user?.attributes ?? user;
  const id = user?.id ?? attrs?.id;
  const documentId = user?.documentId ?? attrs?.documentId;
  const avatarUrl = getMediaUrl(user, "avatar");

  return {
    id,
    documentId,
    username: attrs.username,
    email: attrs.email,
    full_name: attrs.full_name,
    firstname: attrs.firstname,
    lastname: attrs.lastname,
    avatar_url: avatarUrl,
    avatar: avatarUrl ? { url: avatarUrl } : null,
    bio: attrs.bio,
  };
}

/**
 * Получить все опубликованные посты автора.
 */
export async function getPostsByAuthor(
  username: string,
  options: { pageSize?: number; page?: number } = {},
) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337";
  const apiToken = process.env.STRAPI_API_TOKEN;

  const headers: HeadersInit = {};
  if (apiToken) headers.Authorization = `Bearer ${apiToken}`;

  const pageSize = options.pageSize ?? 200;

  const url =
    `${baseUrl}/api/posts` +
    `?populate[]=categories` +
    `&populate[]=author` +
    `&populate[]=featured_image` +
    `&sort[]=publishedAt:desc` +
    `&pagination[pageSize]=${pageSize}`;

  console.log("[getPostsByAuthor] URL:", url);

  try {
    const res = await fetch(url, { headers, cache: "no-store" });
    console.log("[getPostsByAuthor] status:", res.status);

    if (!res.ok) {
      const text = await res.text();
      console.log("[getPostsByAuthor] error:", text.slice(0, 300));
      return { data: [], meta: null };
    }

    const json = await res.json();
    const all = json?.data ?? [];
    console.log("[getPostsByAuthor] total from API:", all.length);

    const posts = all.filter((p: any) => {
      const author = p.author || p.attributes?.author;
      const uname =
        author?.username || author?.data?.attributes?.username || null;
      return uname === username;
    });

    console.log("[getPostsByAuthor] filtered:", posts.length);

    return { data: posts, meta: json?.meta };
  } catch (e) {
    console.error("getPostsByAuthor error:", e);
    return { data: [], meta: null };
  }
}
