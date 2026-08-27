'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import type { StrapiData, PostAttributes } from '@/types/strapi';

interface BlogCardProps {
  post: StrapiData<PostAttributes>;
  className?: string;
}

export function BlogCard({ post, className = '' }: BlogCardProps) {
  const { attributes } = post;
  const image = attributes.featured_image?.data?.attributes;

  return (
    <article className={`group bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-300 ${className}`}>
      {image && (
        <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
          <Image
            src={image.url}
            alt={image.alternativeText || attributes.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          {attributes.category?.data?.attributes && (
            <Link
              href={`/blog?category=${attributes.category.data.attributes.slug}`}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              {attributes.category.data.attributes.name}
            </Link>
          )}
          {attributes.post_status === 'published' && (
            <Badge variant="default" className="text-xs">Опубликовано</Badge>
          )}
        </div>

        <h3 className="text-xl font-semibold line-clamp-2">
          <Link
            href={`/blog/${attributes.slug}`}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {attributes.title}
          </Link>
        </h3>

        {attributes.excerpt && (
          <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
            {attributes.excerpt}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            {attributes.author?.data?.attributes && (
              <span>
                {attributes.author.data.attributes.full_name ||
                 attributes.author.data.attributes.username}
              </span>
            )}
          </div>
          {attributes.publishedAt && (
            <time dateTime={attributes.publishedAt}>
              {new Date(attributes.publishedAt).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </time>
          )}
        </div>
      </div>
    </article>
  );
}