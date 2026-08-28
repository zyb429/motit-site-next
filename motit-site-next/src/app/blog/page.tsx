// frontend/src/app/blog/page.tsx
import type { Metadata } from 'next';
import { Container } from '@/components/ui';
import { BlogList } from '@/components/blog';
import { getPosts } from '@/lib/strapi';
import { getDraftModeStatus } from '@/lib/server/strapi';

export const metadata: Metadata = {
  title: 'Блог | Motit',
  description: 'Новости, статьи и обновления от Motit',
  openGraph: {
    title: 'Блог | Motit',
    description: 'Новости, статьи и обновления от Motit',
    type: 'website',
    url: '/blog',
  },
};

export default async function BlogPage() {
  const isDraftMode = await getDraftModeStatus();
  
  const postsResponse = await getPosts(
    { 
      pagination: { page: 1, pageSize: 9 },
      populate: ['category', 'admin_user']
    }, 
    isDraftMode
  );

  const posts = postsResponse?.data || [];

  return (
    <Container className="py-12">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Блог</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Статьи, новости и обновления от Motit
          </p>
          {isDraftMode && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                🔧 Режим превью: показаны черновики ({posts.length} постов)
              </p>
            </div>
          )}
        </div>
        {/* ✅ Временно заменяем BlogList на простой вывод */}
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-bold text-green-700">Посты ({posts.length}):</h3>
          <pre className="text-xs overflow-auto max-h-96 mt-2">
            {JSON.stringify(posts, null, 2)}
          </pre>
        </div>
        {/* <BlogList initialPosts={posts} /> */}
      </div>
    </Container>
  );
}