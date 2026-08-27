'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePostBySlug, usePostsByCategory } from '@/hooks/usePosts';
import { BlogCard } from './BlogCard';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface BlogPostProps {
  slug: string;
  initialPost?: any;
}

export function BlogPost({ slug, initialPost }: BlogPostProps) {
  const { post, isLoading, error } = usePostBySlug(slug);
  const currentPost = post || initialPost;

  const { data: relatedData, isLoading: relatedLoading } = usePostsByCategory(
    currentPost?.attributes.category?.data?.id || 0,
    { 
      pagination: { page: 1, pageSize: 3 },
      filters: { id: { $ne: currentPost?.id } }
    }
  );

  if (isLoading) {
    return <BlogPostSkeleton />;
  }

  if (error || !currentPost) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Пост не найден</h1>
        <Link href="/blog" className="text-blue-600 hover:underline">
          Вернуться к списку
        </Link>
      </div>
    );
  }

  const { attributes } = currentPost;
  const image = attributes.featured_image?.data?.attributes;

  return (
    <article className="max-w-4xl mx-auto">
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/" className="hover:text-blue-600">Главная</Link>
        {' / '}
        <Link href="/blog" className="hover:text-blue-600">Блог</Link>
        {' / '}
        <span className="text-gray-700 dark:text-gray-300">{attributes.title}</span>
      </nav>

      <header className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          {attributes.category?.data?.attributes && (
            <Link
              href={`/blog?category=${attributes.category.data.attributes.slug}`}
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              {attributes.category.data.attributes.name}
            </Link>
          )}
          {attributes.post_status === 'published' && (
            <Badge variant="default">Опубликовано</Badge>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-2 mb-4">
          {attributes.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          {attributes.publishedAt && (
            <time dateTime={attributes.publishedAt}>
              📅 {new Date(attributes.publishedAt).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </time>
          )}
          {attributes.author?.data?.attributes && (
            <span>
              ✍️ {attributes.author.data.attributes.full_name || 
                   attributes.author.data.attributes.username}
            </span>
          )}
        </div>
      </header>

      {image && (
        <div className="relative h-[400px] w-full mb-8 rounded-xl overflow-hidden bg-gray-100">
          <Image
            src={image.url}
            alt={image.alternativeText || attributes.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 80vw"
            priority
          />
        </div>
      )}

      {attributes.excerpt && (
        <div className="text-lg text-gray-600 dark:text-gray-400 mb-8 border-l-4 border-blue-500 pl-4 italic">
          {attributes.excerpt}
        </div>
      )}

      {attributes.content && (
        <div 
          className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: attributes.content }}
        />
      )}

      {relatedData?.data && relatedData.data.length > 0 && (
        <section className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-6">Похожие посты</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedData.data.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

function BlogPostSkeleton() {
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