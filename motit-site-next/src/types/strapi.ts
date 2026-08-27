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
  username: string;
  email: string;
  full_name: string;
  phone: string;
  avatar_url?: string;
  is_active: boolean;
  last_login?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketAttributes {
  title: string;
  description?: string;
  deadline_at?: string;
  resolved_at?: string;
  client?: StrapiData<UserAttributes>;
  assigned_to?: StrapiData<UserAttributes>;
  ticket_status?: StrapiData<StatusAttributes>;
  priority?: StrapiData<PriorityAttributes>;
  category?: StrapiData<CategoryAttributes>;
  createdAt: string;
  updatedAt: string;
}

export interface PostAttributes {
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  featured_image?: StrapiData<MediaAttributes>;
  post_status: 'draft' | 'published' | 'archived';
  author?: StrapiData<UserAttributes>;
  meta_title?: string;
  meta_description?: string;
  seo_data?: Record<string, unknown>;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageAttributes {
  title: string;
  slug: string;
  sections?: Record<string, unknown>;
  meta_title?: string;
  meta_description?: string;
  seo_data?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
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
  name: string;
  website_url?: string;
  image_url?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CertificateAttributes {
  title: string;
  issuer_name?: string;
  image_url?: string;
  issue_date?: string;
  expiry_date?: string;
  is_active: boolean;
  order: number;
  issuer?: StrapiData<IssuerAttributes>;
  createdAt: string;
  updatedAt: string;
}

export interface IssuerAttributes {
  name: string;
  website_url?: string;
  createdAt: string;
  updatedAt: string;
}