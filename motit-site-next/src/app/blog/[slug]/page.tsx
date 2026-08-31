import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getPostBySlug, getPublishedPosts } from '@/lib/strapi';
import { getDraftModeStatus } from '@/lib/server/strapi';
import { BlogPost } from '@/components/blog/BlogPost';
import { Calendar, User, Clock, ArrowLeft, Tag } from 'lucide-react';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

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

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const isDraftMode = await getDraftModeStatus();
    const post = await getPostBySlug(slug, {}, isDraftMode);

    if (!post) {
      return { title: 'Пост не найден' };
    }

    const imageUrl = post.featured_image?.url || null;

    return {
      title: post.meta_title || post.title || 'Пост',
      description: post.meta_description || post.excerpt || '',
      robots: post.post_status === 'draft' ? 'noindex, nofollow' : 'index, follow',
      openGraph: {
        title: post.meta_title || post.title || 'Пост',
        description: post.meta_description || post.excerpt || '',
        images: imageUrl ? [{ url: imageUrl.startsWith('/uploads') ? `http://localhost:1337${imageUrl}` : imageUrl }] : [],
        type: 'article',
        publishedTime: post.publishedAt || undefined,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return { title: 'Пост не найден' };
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const safeSlug = typeof slug === 'string' ? slug : String(slug || '');
  
  const isDraftMode = await getDraftModeStatus();
  const post = await getPostBySlug(safeSlug, {}, isDraftMode);

  if (!post) {
    notFound();
  }

  const category = post.category?.data?.attributes;
  const author = post.admin_user?.data?.attributes;
  const readingTime = Math.ceil((post.content?.length || 0) / 1500);

  const formatDate = (dateString: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Назад */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#2dd4bf] transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Назад
      </Link>

      {/* Категория */}
      {category && (
        <div className="mb-2">
          <span className="text-xs font-medium text-[#2dd4bf] bg-[#2dd4bf]/10 px-2 py-0.5 rounded-full">
            {category.name}
          </span>
        </div>
      )}

      {/* Заголовок */}
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#e0f7fa] mb-3 leading-tight tracking-tight">
        {post.title}
      </h1>

      {/* Метаданные */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mb-6 pb-4 border-b border-[rgba(45,212,191,0.04)]">
        {author && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#2dd4bf]/20 flex items-center justify-center text-[#2dd4bf] text-xs font-medium">
              {(author.firstname || author.username || 'A')[0].toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-300">{author.firstname || author.username}</span>
          </div>
        )}
        {post.publishedAt && (
          <span className="flex items-center gap-1.5">
            <Calendar size={14} className="text-[#2dd4bf]" />
            {formatDate(post.publishedAt)}
          </span>
        )}
        {readingTime > 0 && (
          <span className="flex items-center gap-1.5 text-gray-500">
            <Clock size={14} />
            {readingTime} мин
          </span>
        )}
        {post.post_status === 'draft' && (
          <span className="text-yellow-400">⏳ Черновик</span>
        )}
      </div>

      {/* Изображение */}
      {post.featured_image?.url && (
        <div className="relative w-full aspect-[16/9] mb-6 rounded-xl overflow-hidden bg-[#0a1920]">
          <img
            src={post.featured_image.url.startsWith('/uploads') 
              ? `http://localhost:1337${post.featured_image.url}`
              : post.featured_image.url}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Контент */}
      <BlogPost initialPost={post} />

      {/* Подвал */}
      <footer className="mt-8 pt-4 border-t border-[rgba(45,212,191,0.04)] flex flex-wrap items-center justify-between gap-2 text-sm">
        <Link
          href="/blog"
          className="text-gray-400 hover:text-[#2dd4bf] transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft size={14} />
          Назад
        </Link>
        {category && (
          <Link
            href={`/blog?category=${category.slug}`}
            className="text-gray-400 hover:text-[#2dd4bf] transition-colors inline-flex items-center gap-1.5"
          >
            <Tag size={14} />
            {category.name}
          </Link>
        )}
      </footer>
    </div>
  );
}