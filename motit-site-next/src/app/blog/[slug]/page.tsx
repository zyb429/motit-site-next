import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Container } from '@/components/ui';
import { BlogPost } from '@/components/blog';
import { getPostBySlug, getPublishedPosts } from '@/lib/strapi';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

// Генерация статических путей для SSG
export async function generateStaticParams() {
  try {
    const posts = await getPublishedPosts({ pagination: { pageSize: 100 } });
    return posts?.data?.map((post) => ({
      slug: post.attributes.slug,
    })) || [];
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Генерация мета-тегов для SEO
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  try {
    const post = await getPostBySlug(params.slug);

    if (!post) {
      return { title: 'Пост не найден' };
    }

    const { attributes } = post;
    const image = attributes.featured_image?.data?.attributes;

    return {
      title: attributes.meta_title || attributes.title,
      description: attributes.meta_description || attributes.excerpt,
      openGraph: {
        title: attributes.meta_title || attributes.title,
        description: attributes.meta_description || attributes.excerpt || '',
        images: image ? [{ url: image.url }] : [],
        type: 'article',
        publishedTime: attributes.publishedAt,
        authors: attributes.author?.data?.attributes?.full_name
          ? [attributes.author.data.attributes.full_name]
          : undefined,
        tags: attributes.category?.data?.attributes?.name
          ? [attributes.category.data.attributes.name]
          : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: attributes.meta_title || attributes.title,
        description: attributes.meta_description || attributes.excerpt || '',
        images: image ? [image.url] : [],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return { title: 'Пост не найден' };
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <Container className="py-8">
      <BlogPost slug={params.slug} initialPost={post} />
    </Container>
  );
}