import type { Metadata } from 'next';
import { Container } from '@/components/ui';
import { BlogList } from '@/components/blog';

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

export default function BlogPage() {
  return (
    <Container className="py-12">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Блог</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Статьи, новости и обновления от Motit
          </p>
        </div>
        <BlogList />
      </div>
    </Container>
  );
}