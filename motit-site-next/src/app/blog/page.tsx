import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getPosts } from '@/lib/strapi';
import { getDraftModeStatus } from '@/lib/server/strapi';
import { Calendar, User, Clock, Search, ArrowRight } from 'lucide-react';

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
      pagination: { page: 1, pageSize: 20 },
      populate: ['category', 'admin_user', 'featured_image'],
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    },
    isDraftMode
  );

  const posts = postsResponse?.data || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getImageUrl = (post: any) => {
    const image = post.featured_image;
    if (!image) return null;
    if (typeof image === 'string') return image;
    if (image.url) {
      return image.url.startsWith('/uploads') 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}${image.url}`
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
    <div className="min-h-screen bg-[#0a1920] py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Шапка блога */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-[rgba(45,212,191,0.06)]">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#e0f7fa] tracking-tight">
              Блог
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Статьи и новости от Motit
            </p>
          </div>
          <form action="/blog" method="GET" className="relative">
            <input
              type="text"
              name="search"
              placeholder="Поиск по блогу..."
              defaultValue={searchQuery}
              className="w-full md:w-72 px-4 py-2 pl-9 rounded-lg bg-[#0d2029] border border-[rgba(45,212,191,0.08)] text-[#e0f7fa] placeholder:text-gray-500 text-sm focus:border-[#2dd4bf] focus:outline-none transition-colors"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <button type="submit" className="sr-only">Поиск</button>
          </form>
        </div>

        {/* Статусы */}
        {searchQuery && (
          <div className="mb-4 p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg text-sm text-blue-400 flex items-center justify-between">
            <span>Результаты поиска: «{searchQuery}» ({posts.length} постов)</span>
            <Link href="/blog" className="hover:underline hover:text-blue-300 transition-colors">✕</Link>
          </div>
        )}
        {isDraftMode && (
          <div className="mb-4 p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-lg text-sm text-yellow-400">
            🔧 Режим превью: показаны черновики ({posts.length} постов)
          </div>
        )}

        {/* Список постов (по строкам) */}
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">
              {searchQuery ? 'Ничего не найдено' : 'Постов пока нет'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
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
                  className="group block bg-[#0f2832] rounded-xl overflow-hidden border border-[rgba(45,212,191,0.06)] hover:border-[#2dd4bf]/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className="flex flex-col md:flex-row gap-4 p-4">
                    {/* Изображение (слева) */}
                    <div className="relative w-full md:w-48 h-40 md:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-[#0a1920]">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          sizes="(max-width: 768px) 100vw, 192px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-3xl opacity-20">📄</span>
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
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mb-1">
                        {author && (
                          <span className="flex items-center gap-1">
                            <User size={12} className="text-[#2dd4bf]" />
                            {author.firstname || author.username}
                          </span>
                        )}
                        {post.publishedAt && (
                          <>
                            <span className="text-gray-600">•</span>
                            <span className="flex items-center gap-1">
                              <Calendar size={12} className="text-[#2dd4bf]" />
                              {formatDate(post.publishedAt)}
                            </span>
                          </>
                        )}
                        {readingTime > 0 && (
                          <>
                            <span className="text-gray-600">•</span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} className="text-[#2dd4bf]" />
                              {readingTime} мин
                            </span>
                          </>
                        )}
                      </div>

                      <h2 className="text-lg font-bold text-[#e0f7fa] group-hover:text-[#2dd4bf] transition-colors line-clamp-2 leading-tight">
                        {post.title}
                      </h2>

                      {post.excerpt && (
                        <p className="text-sm text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                          {post.excerpt}
                        </p>
                      )}

                      <div className="flex items-center gap-1 text-[#2dd4bf] text-sm font-medium mt-2 group-hover:gap-2 transition-all duration-200">
                        Читать далее
                        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}