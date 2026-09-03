import type { Metadata } from 'next';
import Link from 'next/link';
import { getPosts, getPostsPerPage } from '@/lib/strapi';
import { getDraftModeStatus } from '@/lib/server/strapi';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogCategories } from '@/components/blog/BlogCategories';
import { PaginationClient } from '@/components/blog/PaginationClient';
import { SearchInput } from '@/components/blog/SearchInput';

// ISR - пересоздаем страницу каждый час
export const revalidate = 3600; // 1 час

export const metadata: Metadata = {
  title: 'Блог | Motit',
  description: 'Новости, статьи и обновления от Motit',
};

// Генерируем статические страницы для первых 10 страниц
export async function generateStaticParams() {
  try {
    const postsPerPage = await getPostsPerPage();
    const postsResponse = await getPosts({
      pagination: { page: 1, pageSize: postsPerPage },
      populate: ['categories', 'author', 'featured_image'],
    }, false);
    
    const total = postsResponse?.meta?.pagination?.total || 0;
    const totalPages = Math.ceil(total / postsPerPage);
    
    const pagesToGenerate = Math.min(totalPages, 10);
    
    return Array.from({ length: pagesToGenerate }, (_, i) => ({
      page: String(i + 1),
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string | string[]; page?: string }> | { search?: string; category?: string | string[]; page?: string };
}) {
  const params = await searchParams;
  const searchQuery = params?.search || '';
  const currentPage = parseInt(params?.page || '1', 10);

  let categorySlugs: string[] = [];
  if (params?.category) {
    if (Array.isArray(params.category)) {
      categorySlugs = params.category;
    } else {
      categorySlugs = [params.category];
    }
  }

  const isDraftMode = await getDraftModeStatus();
  const postsPerPage = await getPostsPerPage();

  // ✅ Загружаем все посты (с пагинацией только для поиска)
  const postsResponse = await getPosts(
    {
      pagination: { page: 1, pageSize: 100 },
      populate: ['categories', 'author', 'featured_image'],
      filters: searchQuery ? { title: { $containsi: searchQuery } } : undefined,
    },
    isDraftMode
  );

  let allPosts = postsResponse?.data || [];

  // ✅ Фильтруем по категориям на клиенте (AND - все категории должны быть)
  if (categorySlugs.length > 0) {
    allPosts = allPosts.filter((post: any) => {
      const attrs = post.attributes || post;
      const categories = attrs.categories?.data || attrs.categories || [];
      const postCategorySlugs = categories.map((cat: any) => 
        (cat.attributes || cat).slug
      );
      
      // Проверяем, что все выбранные категории есть в посте
      return categorySlugs.every(slug => postCategorySlugs.includes(slug));
    });
  }

  // ✅ Пагинация на клиенте
  const total = allPosts.length;
  const totalPages = Math.ceil(total / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = Math.min(startIndex + postsPerPage, total);
  const posts = allPosts.slice(startIndex, endIndex);

  const paginationStart = total > 0 ? startIndex + 1 : 0;
  const paginationEnd = endIndex;

  console.log('🔍 [BlogPage] categorySlugs:', categorySlugs);
  console.log('🔍 [BlogPage] searchQuery:', searchQuery);
  console.log('🔍 [BlogPage] total posts after filter:', total);
  console.log('🔍 [BlogPage] displayed posts:', posts.length);

  // Формируем baseUrl без hostname
  const buildBaseUrl = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (categorySlugs.length > 0) {
      categorySlugs.forEach(slug => params.append('category', slug));
    }
    return `/blog${params.toString() ? `?${params.toString()}` : ''}`;
  };

  const baseUrl = buildBaseUrl();

  return (
    <div className="min-h-screen bg-[#0a1920] py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Шапка блога */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-[rgba(45,212,191,0.06)]">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#e0f7fa] tracking-tight">
              Блог
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Статьи и новости от Motit
            </p>
          </div>

          <SearchInput 
            defaultValue={searchQuery} 
            className="w-full md:w-72"
          />
        </div>

        {/* Категории - над постами */}
        <BlogCategories currentCategories={categorySlugs} />

        {/* Статусы */}
        {searchQuery && (
          <div className="mb-4 p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg text-sm text-blue-400 flex items-center justify-between">
            <span>Результаты поиска: «{searchQuery}» ({total} постов)</span>
            <Link href="/blog" className="hover:underline hover:text-blue-300 transition-colors">✕</Link>
          </div>
        )}
        {isDraftMode && (
          <div className="mb-4 p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-lg text-sm text-yellow-400">
            🔧 Режим превью: показаны черновики ({total} постов)
          </div>
        )}

        {/* Список постов */}
        <div id="blog-posts">
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-sm">
                {searchQuery && categorySlugs.length > 0 
                  ? 'Нет постов, соответствующих вашему запросу и всем выбранным категориям'
                  : searchQuery 
                    ? 'Ничего не найдено по вашему запросу'
                    : categorySlugs.length > 0 
                      ? 'Нет постов, содержащих все выбранные категории'
                      : 'Постов пока нет'}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {posts.map((post: any) => {
                  const normalizedPost = {
                    ...post,
                    attributes: post.attributes || post,
                  };
                  return (
                    <BlogCard 
                      key={post.id || post.documentId} 
                      post={normalizedPost} 
                      variant="list"
                    />
                  );
                })}
              </div>

              {/* Пагинация */}
              {totalPages > 1 && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 border-t border-[rgba(45,212,191,0.06)] pt-4 sm:pt-6">
                  <div className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
                    {total > 0 ? (
                      <>
                        <span className="hidden sm:inline">Показаны посты </span>
                        <span className="text-[#e0f7fa] font-medium">{paginationStart}</span>
                        <span className="text-gray-500"> – </span>
                        <span className="text-[#e0f7fa] font-medium">{paginationEnd}</span>
                        <span className="hidden sm:inline"> из </span>
                        <span className="text-[#e0f7fa] font-medium">{total}</span>
                      </>
                    ) : (
                      <>Нет постов</>
                    )}
                  </div>
                  <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 px-0.5 sm:px-0">
                    <PaginationClient 
                      currentPage={currentPage}
                      totalPages={totalPages}
                      baseUrl={baseUrl}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}