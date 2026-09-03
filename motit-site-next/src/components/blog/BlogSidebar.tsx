'use client';

import Link from 'next/link';
import { usePublishedPosts } from '@/hooks/usePosts';
import { Calendar } from 'lucide-react';
import type { PostAttributes } from '@/lib/strapi';

export function BlogSidebar() {
  const { data: postsData, isLoading: postsLoading } = usePublishedPosts({
    pagination: { pageSize: 4 },
    sort: ['publishedAt:desc'],
    populate: ['featured_image'],
  });

  const posts = Array.isArray(postsData?.data) ? postsData.data : [];
  const validPosts = posts.filter((p: any) => p?.title?.trim());

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const getImageUrl = (attrs: any) => {
    const image = attrs?.featured_image;
    if (!image) return null;
    if (typeof image === 'string') {
      return image.startsWith('/uploads') ? `http://localhost:1337${image}` : image;
    }
    if (image.url) {
      return image.url.startsWith('/uploads') ? `http://localhost:1337${image.url}` : image.url;
    }
    return null;
  };

  if (postsLoading || validPosts.length === 0) return null;

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24">
        <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Свежие статьи</h4>
        <ul className="space-y-3">
          {validPosts.slice(0, 4).map((post: any) => {
            const title = post.title || 'Без названия';
            const slug = post.slug || post.id || '#';
            const publishedAt = post.publishedAt || post.createdAt;
            const imageUrl = getImageUrl(post);

            return (
              <li key={post.id}>
                <Link
                  href={`/blog/${slug}`}
                  className="group flex gap-3 items-start hover:bg-[#0d2029] p-2 -mx-2 rounded-lg transition-colors"
                >
                  <div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-[#0a1920]">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600 text-lg">📄</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-medium text-gray-300 group-hover:text-[#2dd4bf] transition-colors line-clamp-2">
                      {title}
                    </h5>
                    {publishedAt && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar size={10} />
                        {formatDate(publishedAt)}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}