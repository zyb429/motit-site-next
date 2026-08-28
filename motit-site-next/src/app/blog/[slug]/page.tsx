import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Container } from '@/components/ui';
import { BlogPost } from '@/components/blog';
import { getPostBySlug, getPublishedPosts } from '@/lib/strapi';
import { getDraftModeStatus } from '@/lib/server/strapi';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Генерация статических путей для SSG
export async function generateStaticParams() {
  try {
    const posts = await getPublishedPosts({ pagination: { pageSize: 100 } });
    if (!posts?.data || posts.data.length === 0) {
      return [];
    }
    return posts.data
      .filter((post) => post?.attributes?.slug)
      .map((post) => ({
        slug: post.attributes.slug,
      }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Генерация мета-тегов для SEO
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const isDraftMode = await getDraftModeStatus();
    const post = await getPostBySlug(slug, {}, isDraftMode);

    if (!post) {
      return { title: 'Пост не найден' };
    }

    // ✅ Безопасное получение атрибутов
    const attributes = post.attributes || post;
    
    // ✅ Безопасное получение полей
    const imageUrl = attributes.featured_image || null;
    const isDraft = attributes.post_status === 'draft';
    const title = attributes.meta_title || attributes.title || 'Пост';
    const description = attributes.meta_description || attributes.excerpt || '';
    const publishedAt = attributes.publishedAt || null;
    
    const authorName = attributes.admin_user?.data?.attributes?.firstname ||
                       attributes.admin_user?.data?.attributes?.username ||
                       null;
    
    const categoryName = attributes.category?.data?.attributes?.name || null;

    return {
      title,
      description,
      robots: isDraft ? 'noindex, nofollow' : 'index, follow',
      openGraph: {
        title,
        description,
        images: imageUrl ? [{ url: imageUrl }] : [],
        type: 'article',
        publishedTime: publishedAt || undefined,
        authors: authorName ? [authorName] : undefined,
        tags: categoryName ? [categoryName] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: imageUrl ? [imageUrl] : [],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return { title: 'Пост не найден' };
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  
  // ✅ Убеждаемся, что slug - строка
  const safeSlug = typeof slug === 'string' ? slug : String(slug || '');
  
  const isDraftMode = await getDraftModeStatus();
  const post = await getPostBySlug(safeSlug, {}, isDraftMode);

  if (!post) {
    notFound();
  }

  return (
    <Container className="py-8">
      <BlogPost slug={safeSlug} initialPost={post} />
    </Container>
  );
}