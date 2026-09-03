import { BaseEditor } from 'slate';
import { ReactEditor } from 'slate-react';

// ===== ТИПЫ ДЛЯ ТЕКСТОВЫХ УЗЛОВ =====
export type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
};

// ===== ТИПЫ ДЛЯ ЭЛЕМЕНТОВ (БЛОКОВ) =====
export type CustomElementType =
  | 'paragraph'
  | 'heading-one'
  | 'heading-two'
  | 'heading-three'
  | 'bulleted-list'
  | 'numbered-list'
  | 'list-item'
  | 'block-quote'
  | 'code-block'
  | 'image'
  | 'link';

export type CustomElement = {
  type: CustomElementType;
  children: CustomText[];
  url?: string;
  href?: string;
  alt?: string;
  target?: '_blank' | '_self';
};

// ===== РАСШИРЕННЫЙ ТИП РЕДАКТОРА =====
export type CustomEditor = BaseEditor & ReactEditor;

// ===== ТИП ПОСТА ИЗ STRAPI =====
export type Post = {
  id: number;
  attributes: {
    title: string;
    slug: string;
    content: CustomElement[];
    excerpt?: string;
    featured_image?: {
      data?: {
        attributes: {
          url: string;
          alternativeText?: string;
        };
      };
    };
    categories?: {
      data: Array<{
        id: number;
        attributes: {
          name: string;
          slug: string;
        };
      }>;
    };
    // ===== ИЗМЕНЕНО: createdBy → author =====
    author?: {
      data?: {
        attributes: {
          username: string;
          email: string;
          firstname?: string;
          lastname?: string;
        };
      };
    };
    post_status?: 'draft' | 'published' | 'archived';
    views?: number;
    is_featured?: boolean;
    publishedAt?: string;
    createdAt?: string;
    updatedAt?: string;
  };
};

// ===== ТИП ДЛЯ СОЗДАНИЯ ПОСТА =====
export type CreatePostData = {
  title: string;
  content: CustomElement[];
  excerpt?: string;
  categories?: number[];
  author?: number;  // ← ДОБАВЛЕНО
  featured_image?: number;
  post_status?: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  is_featured?: boolean;
};

// ===== ТИПЫ ДЛЯ КОМПОНЕНТА РЕДАКТОРА =====
export interface SlateEditorProps {
  onChange?: (value: CustomElement[]) => void;
  initialValue?: CustomElement[];
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}