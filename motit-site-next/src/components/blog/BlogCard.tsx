'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { StrapiData, PostAttributes } from '@/types/strapi';

interface BlogCardProps {
  post: StrapiData<PostAttributes> | any;
  className?: string;
}

export function BlogCard({ post, className = '' }: BlogCardProps) {
  const attributes = post?.attributes || post;
  
  let imageUrl = attributes?.featured_image || attributes?.image || null;
  const isDraft = attributes?.post_status === 'draft';
  const title = attributes?.title || 'Без названия';
  const slug = attributes?.slug || '';
  const excerpt = attributes?.excerpt || '';
  const category = attributes?.category;
  const publishedAt = attributes?.publishedAt || attributes?.published_at;
  const adminUser = attributes?.admin_user;

  if (!slug) {
    return null;
  }

  // ✅ Формируем правильный URL для изображения
  let fullImageUrl = null;
  if (imageUrl) {
    // Если imageUrl - объект, пытаемся извлечь строку
    if (typeof imageUrl === 'object' && imageUrl !== null) {
      try {
        // Пробуем разные пути
        fullImageUrl = imageUrl?.url || 
                      imageUrl?.data?.attributes?.url || 
                      imageUrl?.attributes?.url ||
                      null;
        if (fullImageUrl && typeof fullImageUrl === 'object') {
          fullImageUrl = String(fullImageUrl);
        }
      } catch (e) {
        console.warn('Error extracting image URL:', e);
        fullImageUrl = null;
      }
    } else if (typeof imageUrl === 'string') {
      fullImageUrl = imageUrl;
    }
  }

  // ✅ Добавляем базовый URL если нужно
  if (fullImageUrl && typeof fullImageUrl === 'string' && fullImageUrl.startsWith('/uploads')) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
    fullImageUrl = `${baseUrl}${fullImageUrl}`;
  }

  return (
    <article className={`group bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-300 ${className} ${
      isDraft ? 'border-yellow-300 dark:border-yellow-700' : ''
    }`}>
      {fullImageUrl && typeof fullImageUrl === 'string' && (
        <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
          {/* ✅ Используем обычный тег img */}
          <img
            src={fullImageUrl}
            alt={title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
          {isDraft && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
              ⏳ Черновик
            </div>
          )}
        </div>
      )}

      <div className="p-5">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {category?.data?.attributes && (
            <Link
              href={`/blog?category=${category.data.attributes.slug || category.data.attributes.name}`}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              {category.data.attributes.name}
            </Link>
          )}
          {!isDraft && attributes?.post_status === 'published' && (
            <Badge variant="default" className="text-xs">Опубликовано</Badge>
          )}
          {isDraft && (
            <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-700 dark:text-yellow-400">
              Черновик
            </Badge>
          )}
        </div>

        <h3 className="text-xl font-semibold line-clamp-2">
          <Link
            href={`/blog/${slug}`}
            className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
              isDraft ? 'text-yellow-700 dark:text-yellow-400' : ''
            }`}
          >
            {title}
            {isDraft && (
              <span className="ml-1 text-sm font-normal text-yellow-600 dark:text-yellow-400">
                (черновик)
              </span>
            )}
          </Link>
        </h3>

        {excerpt && (
          <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
            {excerpt}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            {adminUser?.data?.attributes && (
              <span className="flex items-center gap-1">
                <span className="text-xs">👤</span>
                {adminUser.data.attributes.firstname ||
                 adminUser.data.attributes.username}
              </span>
            )}
          </div>
          {publishedAt && (
            <time dateTime={publishedAt}>
              {new Date(publishedAt).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </time>
          )}
          {!publishedAt && isDraft && (
            <span className="text-yellow-600 dark:text-yellow-400 text-xs">
              Не опубликован
            </span>
          )}
        </div>
      </div>
    </article>
  );
}