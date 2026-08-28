export interface StrapiData<T> {
  id: number;
  documentId?: string; // Strapi v5
  uuid?: string; // Ваше поле uuid
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

// ==================== ENTITIES ====================

export interface StatusAttributes {
  name: string;
  color: 'blue' | 'purple' | 'yellow' | 'green' | 'orange' | 'gray' | 'red';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PriorityAttributes {
  name: string;
  color: 'gray' | 'blue' | 'orange' | 'red';
  level: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryAttributes {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserAttributes {
  id: number;
  username: string;
  email: string;
  firstname?: string;
  lastname?: string;
  full_name?: string; // Если есть в модели Admin User
  avatar?: {
    url: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Admin User (для авторов постов)
export interface AdminUserAttributes {
  id: number;
  username: string;
  email: string;
  firstname?: string;
  lastname?: string;
  full_name?: string;
  avatar?: {
    url: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PostAttributes {
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  post_status: 'draft' | 'published' | 'archived'; // ✅ post_status
  meta_title?: string;
  meta_description?: string;
  seo_data?: Record<string, unknown>;
  publishedAt?: string; // ✅ camelCase
  createdAt: string;
  updatedAt: string;
  // ✅ Автор-администратор (поле admin_user)
  admin_user?: {
    data: StrapiData<AdminUserAttributes>;
  };
  // ✅ Категория
  category?: {
    data: StrapiData<CategoryAttributes>;
  };
}

export interface PageAttributes {
  uuid: string;
  slug: string;
  title: string;
  sections?: Record<string, unknown>;
  seo_data?: Record<string, unknown>;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

export interface MediaAttributes {
  name: string;
  alternativeText?: string;
  caption?: string;
  width: number;
  height: number;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  provider: string;
  formats?: {
    thumbnail?: MediaFormat;
    small?: MediaFormat;
    medium?: MediaFormat;
    large?: MediaFormat;
  };
}

export interface MediaFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  width: number;
  height: number;
  size: number;
  url: string;
}

export interface OrganizationAttributes {
  name: string;
  inn?: string;
  address?: string;
  email?: string;
  phone?: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerAttributes {
  uuid: string;
  name: string;
  website_url?: string;
  image_url?: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface CertificateAttributes {
  uuid: string;
  title: string;
  issuer_id?: number;
  image_url?: string;
  issue_date?: string;
  expiry_date?: string;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
  issuer?: { data: StrapiData<{ name: string; website_url?: string }> };
}

export interface IssuerAttributes {
  name: string;
  website_url?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== TICKET TYPES ====================

export interface TicketAttributes {
  uuid: string;
  title: string;
  description?: string;
  client_uuid?: string;
  assigned_to_uuid?: string;
  status_uuid?: string;
  priority_uuid?: string;
  category_uuid?: string;
  deadline_at?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  // Связанные данные
  client?: { data: StrapiData<UserAttributes> };
  assigned_to?: { data: StrapiData<UserAttributes> };
  status?: { data: StrapiData<{ name: string; color?: string }> };
  priority?: { data: StrapiData<{ name: string; color?: string; level?: number }> };
  category?: { data: StrapiData<CategoryAttributes> };
}