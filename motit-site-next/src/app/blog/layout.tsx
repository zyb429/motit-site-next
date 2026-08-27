import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Блог | Motit',
  description: 'Новости, статьи и обновления от Motit',
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}