'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface BlogPostProps {
  slug: string | any;
  initialPost?: any;
}

export function BlogPost({ slug, initialPost }: BlogPostProps) {
  // ✅ Используем только initialPost, без хуков
  const currentPost = initialPost;
  
  // ✅ Безопасное преобразование slug
  const safeSlug = typeof slug === 'string' ? slug : String(slug || '');

  if (!currentPost) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Пост не найден</h1>
        <Link href="/blog" className="text-blue-600 hover:underline">
          Вернуться к списку
        </Link>
      </div>
    );
  }

  // ✅ Безопасное получение атрибутов
  const attributes = currentPost?.attributes || currentPost || {};
  
  const isDraft = attributes.post_status === 'draft';
  const title = attributes.title || 'Без названия';
  const excerpt = attributes.excerpt || '';
  const publishedAt = attributes.publishedAt || null;
  const category = attributes.category;
  const adminUser = attributes.admin_user;

  // ✅ Безопасное получение изображения
  let imageUrl = attributes.featured_image || null;
  if (imageUrl && typeof imageUrl === 'object') {
    try {
      imageUrl = imageUrl?.url || 
                 imageUrl?.data?.attributes?.url || 
                 imageUrl?.attributes?.url ||
                 null;
      if (imageUrl && typeof imageUrl === 'object') {
        imageUrl = String(imageUrl);
      }
    } catch (e) {
      imageUrl = null;
    }
  }
  
  if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('/uploads')) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
    imageUrl = `${baseUrl}${imageUrl}`;
  }

  // ✅ Безопасное получение контента
  const contentBlocks = attributes.content_blocks || [];

  return (
    <article className="max-w-4xl mx-auto">
      {isDraft && (
        <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⏳</span>
            <div>
              <p className="font-bold text-yellow-800 dark:text-yellow-300">Черновик</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Этот пост еще не опубликован и виден только в режиме превью
              </p>
            </div>
          </div>
        </div>
      )}

      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/" className="hover:text-blue-600">Главная</Link>
        {' / '}
        <Link href="/blog" className="hover:text-blue-600">Блог</Link>
        {' / '}
        <span className="text-gray-700 dark:text-gray-300">{title}</span>
      </nav>

      <header className="mb-8">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {category?.data?.attributes && (
            <Link
              href={`/blog?category=${category.data.attributes.slug || category.data.attributes.name}`}
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              {category.data.attributes.name}
            </Link>
          )}
          {!isDraft && attributes.post_status === 'published' && (
            <Badge variant="default">Опубликовано</Badge>
          )}
          {isDraft && (
            <Badge variant="outline" className="border-yellow-500 text-yellow-700 dark:text-yellow-400">
              ⏳ Черновик
            </Badge>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-2 mb-4">
          {title}
          {isDraft && (
            <span className="ml-2 text-sm font-normal text-yellow-600 dark:text-yellow-400">
              (черновик)
            </span>
          )}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          {publishedAt && (
            <time dateTime={publishedAt}>
              📅 {new Date(publishedAt).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </time>
          )}
          {adminUser?.data?.attributes && (
            <span className="flex items-center gap-1">
              ✍️ {adminUser.data.attributes.firstname || 
                   adminUser.data.attributes.username}
            </span>
          )}
          {isDraft && (
            <span className="text-yellow-600 dark:text-yellow-400">
              🔒 Не опубликован
            </span>
          )}
        </div>
      </header>

      {imageUrl && typeof imageUrl === 'string' && (
        <div className="relative h-[400px] w-full mb-8 rounded-xl overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt={title}
            className="object-cover w-full h-full"
          />
        </div>
      )}

      {excerpt && (
        <div className="text-lg text-gray-600 dark:text-gray-400 mb-8 border-l-4 border-blue-500 pl-4 italic">
          {excerpt}
        </div>
      )}

      {/* ✅ Отображаем контент без ContentBlocks */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg my-4">
        <h3 className="font-bold text-blue-700 dark:text-blue-300 mb-2">
          📦 Content Blocks ({contentBlocks.length}):
        </h3>
        <pre className="text-xs overflow-auto max-h-96 bg-white dark:bg-gray-800 p-2 rounded">
          {JSON.stringify(contentBlocks, null, 2)}
        </pre>
      </div>
    </article>
  );
}

export function BlogPostSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-[400px] w-full rounded-xl" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}