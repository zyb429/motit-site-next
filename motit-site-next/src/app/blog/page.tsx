import type { Metadata } from 'next';
import Link from 'next/link';
import { getPosts } from '@/lib/strapi';
import { getDraftModeStatus } from '@/lib/server/strapi';
import { BlogSidebar } from '@/components/blog/BlogSidebar';
import { Calendar, User, Clock, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Блог | Motit',
  description: 'Новости, статьи и обновления от Motit',
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }> | { search?: string; category?: string };
}) {
  const params = await searchParams;
  const searchQuery = params?.search || '';
  const isDraftMode = await getDraftModeStatus();

  const filters: any = {};
  if (searchQuery) filters.title = { $containsi: searchQuery };

  const postsResponse = await getPosts(
    {
      pagination: { page: 1, pageSize: 9 },
      populate: ['category', 'admin_user', 'featured_image'],
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    },
    isDraftMode
  );

  const posts = postsResponse?.data || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getImageUrl = (post: any) => {
    const image = post.featured_image;
    if (!image) return null;
    if (typeof image === 'string') return image;
    if (image.url) {
      return image.url.startsWith('/uploads') 
        ? `http://localhost:1337${image.url}`
        : image.url;
    }
    return null;
  };

  const getReadingTime = (post: any) => {
    const content = post.content || '';
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return minutes > 0 ? minutes : 1;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Шапка блога - минималистичная */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-[rgba(45,212,191,0.06)]">
        <div>
          <h1 className="text-2xl font-bold text-[#e0f7fa] tracking-tight">Блог</h1>
          <p className="text-sm text-gray-400">Статьи и новости от Motit</p>
        </div>
        <form action="/blog" method="GET" className="relative">
          <input
            type="text"
            name="search"
            placeholder="Поиск..."
            defaultValue={searchQuery}
            className="w-full md:w-64 px-3 py-1.5 pl-8 rounded-lg bg-[#0d2029] border border-[rgba(45,212,191,0.08)] text-[#e0f7fa] placeholder:text-gray-500 text-sm focus:border-[#2dd4bf] focus:outline-none transition-colors"
          />
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <button type="submit" className="sr-only">Поиск</button>
        </form>
      </div>

      {/* Статусы */}
      {searchQuery && (
        <div className="mb-4 p-2 bg-blue-500/5 border border-blue-500/10 rounded-lg text-xs text-blue-400">
          Результаты поиска: «{searchQuery}» ({posts.length} постов)
          <Link href="/blog" className="ml-2 hover:underline">✕</Link>
        </div>
      )}
      {isDraftMode && (
        <div className="mb-4 p-2 bg-yellow-500/5 border border-yellow-500/10 rounded-lg text-xs text-yellow-400">
          🔧 Режим превью: черновики ({posts.length} постов)
        </div>
      )}

      {/* Сетка постов */}
      {posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-sm">
            {searchQuery ? 'Ничего не найдено' : 'Постов пока нет'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post: any) => {
            const imageUrl = getImageUrl(post);
            const isDraft = post.post_status === 'draft';
            const category = post.category?.data?.attributes;
            const author = post.admin_user?.data?.attributes;
            const readingTime = getReadingTime(post);

            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group block bg-[#0f2832] rounded-xl overflow-hidden border border-[rgba(45,212,191,0.06)] hover:border-[#2dd4bf]/20 hover:shadow-md transition-all duration-200"
              >
                {/* Изображение */}
                <div className="relative w-full aspect-[16/9] overflow-hidden bg-[#0a1920]">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl opacity-20">📄</span>
                    </div>
                  )}
                  {isDraft && (
                    <span className="absolute top-2 right-2 bg-yellow-500/90 text-black text-[10px] font-medium px-2 py-0.5 rounded-full">
                      Черновик
                    </span>
                  )}
                  {category && (
                    <span className="absolute bottom-2 left-2 bg-[#2dd4bf]/20 backdrop-blur-sm text-[#2dd4bf] text-[10px] font-medium px-2 py-0.5 rounded-full">
                      {category.name}
                    </span>
                  )}
                </div>

                {/* Контент */}
                <div className="p-4 space-y-1.5">
                  <h2 className="text-base font-semibold text-[#e0f7fa] line-clamp-2 group-hover:text-[#2dd4bf] transition-colors">
                    {post.title}
                  </h2>

                  {post.excerpt && (
                    <p className="text-sm text-gray-400 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Метаданные */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-[rgba(45,212,191,0.04)]">
                    <div className="flex items-center gap-3">
                      {author && (
                        <span className="flex items-center gap-1">
                          <User size={12} className="text-[#2dd4bf]" />
                          {author.firstname || author.username}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {readingTime > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-[#2dd4bf]" />
                          {readingTime} мин
                        </span>
                      )}
                      {post.publishedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="text-[#2dd4bf]" />
                          {formatDate(post.publishedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}