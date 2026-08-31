import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getPostBySlug, getPublishedPosts } from '@/lib/strapi';
import { getDraftModeStatus } from '@/lib/server/strapi';
import { BlogPost } from '@/components/blog/BlogPost';
import { BlogPostActions } from '@/components/blog/BlogPostActions';
import { Calendar, User, Clock, ArrowLeft, Tag } from 'lucide-react';

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

// Генерация метаданных для SEO
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const isDraftMode = await getDraftModeStatus();
    const post = await getPostBySlug(slug, {}, isDraftMode);

    if (!post) {
      return { title: 'Пост не найден' };
    }

    const imageUrl = post.featured_image?.url || null;
    const fullImageUrl = imageUrl?.startsWith('/uploads') 
      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}${imageUrl}`
      : imageUrl;

    return {
      title: post.meta_title || post.title || 'Пост',
      description: post.meta_description || post.excerpt || '',
      robots: post.post_status === 'draft' ? 'noindex, nofollow' : 'index, follow',
      openGraph: {
        title: post.meta_title || post.title || 'Пост',
        description: post.meta_description || post.excerpt || '',
        images: imageUrl ? [{ url: fullImageUrl }] : [],
        type: 'article',
        publishedTime: post.publishedAt || undefined,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return { title: 'Пост не найден' };
  }
}

// Основной компонент страницы
export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const safeSlug = typeof slug === 'string' ? slug : String(slug || '');
  
  const isDraftMode = await getDraftModeStatus();
  const post = await getPostBySlug(safeSlug, {
    populate: ['category', 'admin_user', 'featured_image', 'content_blocks', 'content_blocks.image'],
  }, isDraftMode);

  if (!post) {
    notFound();
  }

  const category = post.category?.data?.attributes;
  const author = post.admin_user?.data?.attributes;

  // Расчет времени чтения
  const getReadingTime = () => {
    const contentBlocks = post.content_blocks || [];
    const text = contentBlocks
      ?.filter((b: any) => b.__component === 'blog.text')
      ?.reduce((acc: string, b: any) => acc + (b.text || ''), '') || post.content || '';
    const wordsPerMinute = 200;
    const words = text.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes > 0 ? minutes : 1;
  };

  const readingTime = getReadingTime();

  // Форматирование даты
  const formatDate = (dateString: string) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return null;
    }
  };

  // Получение URL изображения
  const getImageUrl = () => {
    const image = post.featured_image;
    if (!image) return null;
    if (typeof image === 'string') return image;
    if (image.url) {
      return image.url.startsWith('/uploads') 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}${image.url}`
        : image.url;
    }
    if (image.data?.attributes?.url) {
      const url = image.data.attributes.url;
      return url.startsWith('/uploads')
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}${url}`
        : url;
    }
    return null;
  };

  const imageUrl = getImageUrl();

  return (
    <main className="min-h-screen bg-[#0a1920] py-8 md:py-12">
      <article className="container mx-auto px-4 max-w-3xl">
        {/* Навигация назад */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#2dd4bf] transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Назад к новостям
        </Link>

        {/* Заголовок */}
        <header className="mb-8">
          {/* Категория */}
          {category && (
            <div className="mb-2">
              <span className="text-xs font-medium text-[#2dd4bf] bg-[#2dd4bf]/10 px-3 py-1 rounded-full">
                {category.name}
              </span>
            </div>
          )}

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#e0f7fa] leading-tight tracking-tight mb-4">
            {post.title}
          </h1>

          {/* Метаданные */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            {author && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#2dd4bf]/20 flex items-center justify-center text-[#2dd4bf] text-xs font-medium">
                  {(author.firstname || author.username || 'A')[0].toUpperCase()}
                </div>
                <span className="text-gray-300">{author.firstname || author.username}</span>
              </div>
            )}
            {post.publishedAt && (
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-[#2dd4bf]" />
                {formatDate(post.publishedAt)}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-[#2dd4bf]" />
              {readingTime} мин чтения
            </span>
            {post.post_status === 'draft' && (
              <span className="text-yellow-400 text-xs font-medium bg-yellow-400/10 px-2 py-0.5 rounded-full">
                ⏳ Черновик
              </span>
            )}
          </div>
        </header>

        {/* Изображение */}
        {imageUrl && (
          <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-[#0f2832] mb-8">
            <Image
              src={imageUrl}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}

        {/* Содержание */}
        <div className="prose prose-invert max-w-none prose-headings:text-[#e0f7fa] prose-headings:font-bold prose-p:text-gray-300 prose-a:text-[#2dd4bf] prose-a:hover:text-[#14b8a6] prose-strong:text-[#e0f7fa] prose-li:text-gray-300 prose-blockquote:border-[#2dd4bf] prose-blockquote:text-gray-400">
          <BlogPost initialPost={post} />
        </div>

        {/* Футер */}
        <footer className="mt-12 pt-6 border-t border-[rgba(45,212,191,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <span>
                Опубликовано в{' '}
                {category ? (
                  <Link
                    href={`/blog?category=${category.slug}`}
                    className="text-[#2dd4bf] hover:text-[#14b8a6] transition-colors inline-flex items-center gap-1"
                  >
                    <Tag size={14} />
                    {category.name}
                  </Link>
                ) : (
                  'общем разделе'
                )}
              </span>
            </div>
            <BlogPostActions 
              title={post.title} 
              excerpt={post.excerpt} 
              url={`/blog/${safeSlug}`} 
            />
          </div>
        </footer>
      </article>
    </main>
  );
}