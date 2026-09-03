// src/app/blog/[slug]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getPostBySlug, getPublishedPosts, getPostCategories } from '@/lib/strapi';
import { getDraftModeStatus } from '@/lib/server/strapi';
import RenderSlate from '@/components/editor/RenderSlate';
import { BlogPostActions } from '@/components/blog/BlogPostActions';
import { Calendar, User, Clock, ArrowLeft, Tag } from 'lucide-react';
import type { Post } from '@/types/slate';

// Тип для поста из Strapi с новым полем content
type StrapiPost = {
  id: number;
  attributes: {
    title: string;
    slug: string;
    content: any[]; // Slate JSON
    excerpt?: string;
    content_blocks?: any[]; // Для обратной совместимости (если есть старые посты)
    featured_image?: {
      data?: {
        attributes: {
          url: string;
          alternativeText?: string;
        };
      };
    };
    categories?: {
      data: Array<{
        id: number;
        attributes: {
          name: string;
          slug: string;
          icon?: string;
        };
      }>;
    };
    // ===== ИЗМЕНЕНО: createdBy → author =====
    author?: {
      data?: {
        attributes: {
          username?: string;
          firstname?: string;
          lastname?: string;
        };
      };
    };
    post_status?: 'draft' | 'published' | 'archived';
    publishedAt?: string;
    meta_title?: string;
    meta_description?: string;
    views?: number;
    is_featured?: boolean;
  };
};

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{ search?: string; category?: string | string[]; page?: string }> | undefined;
}

// Генерация статических путей для SSG
export async function generateStaticParams() {
  try {
    const posts = await getPublishedPosts({ pagination: { pageSize: 100 } });
    if (!posts?.data || posts.data.length === 0) {
      return [];
    }
    return posts.data
      .filter((post: StrapiPost) => post?.attributes?.slug)
      .map((post: StrapiPost) => ({
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
    const post = await getPostBySlug(slug, {
      populate: ['categories', 'author', 'featured_image'], // ← ИЗМЕНЕНО
    }, isDraftMode);

    if (!post) {
      return { title: 'Пост не найден' };
    }

    const attrs = post.attributes || post;
    const imageUrl = attrs.featured_image?.data?.attributes?.url || attrs.featured_image?.url || null;
    let fullImageUrl: string | null = null;
    if (imageUrl && typeof imageUrl === 'string') {
      fullImageUrl = imageUrl.startsWith('/uploads') 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}${imageUrl}`
        : imageUrl;
    }
    
    const images = fullImageUrl ? [{ url: fullImageUrl }] : [];
    
    return {
      title: attrs.meta_title || attrs.title || 'Пост',
      description: attrs.meta_description || attrs.excerpt || '',
      robots: attrs.post_status === 'draft' ? 'noindex, nofollow' : 'index, follow',
      openGraph: {
        title: attrs.meta_title || attrs.title || 'Пост',
        description: attrs.meta_description || attrs.excerpt || '',
        images: images,
        type: 'article',
        publishedTime: attrs.publishedAt || undefined,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return { title: 'Пост не найден' };
  }
}

// ============================================================
// ОСНОВНОЙ КОМПОНЕНТ СТРАНИЦЫ
// ============================================================
export default async function BlogPostPage({ params, searchParams = Promise.resolve({}) }: BlogPostPageProps) {
  const { slug } = await params;
  const safeSlug = typeof slug === 'string' ? slug : String(slug || '');
  
  // Получаем параметры из URL
  let searchQuery = '';
  let categorySlugs: string[] = [];
  let pageParam = '';

  try {
    const sp = (await searchParams) as { search?: string; category?: string | string[]; page?: string } | undefined;
    if (sp && typeof sp === 'object') {
      searchQuery = sp.search || '';
      
      if (sp.category) {
        if (Array.isArray(sp.category)) {
          categorySlugs = sp.category;
        } else if (typeof sp.category === 'string') {
          categorySlugs = [sp.category];
        }
      }
      
      if (sp.page) {
        pageParam = String(sp.page);
      }
    }
  } catch {
    // Игнорируем ошибки
  }

  const isDraftMode = await getDraftModeStatus();
  
  // Получаем пост с новым полем content
  const post = await getPostBySlug(safeSlug, {
    populate: ['categories', 'author', 'featured_image'], // ← ИЗМЕНЕНО
  }, isDraftMode) as StrapiPost | null;

  if (!post) {
    notFound();
  }

  const attrs = post.attributes || post;

  // Получаем категории
  const categories = getPostCategories(post);
  const author = attrs.author?.data?.attributes; // ← ИЗМЕНЕНО

  // Определяем, какой контент использовать: Slate или старые блоки
  const hasSlateContent = attrs.content && Array.isArray(attrs.content) && attrs.content.length > 0;
  const hasBlocksContent = attrs.content_blocks && Array.isArray(attrs.content_blocks) && attrs.content_blocks.length > 0;

  // Расчет времени чтения (на основе Slate-контента или старых блоков)
  const getReadingTime = () => {
    let text = '';
    
    // Если есть Slate-контент
    if (hasSlateContent) {
      const extractText = (nodes: any[]): string => {
        let result = '';
        for (const node of nodes) {
          if (node.children) {
            result += extractText(node.children);
          }
          if (node.text) {
            result += node.text + ' ';
          }
        }
        return result;
      };
      text = extractText(attrs.content);
    }
    else if (hasBlocksContent) {
      text = attrs.content_blocks
        ?.filter((b: any) => b.__component === 'blog.text')
        ?.reduce((acc: string, b: any) => acc + (b.text || ''), '') || '';
    }
    else if (attrs.excerpt) {
      text = attrs.excerpt;
    }

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
  const getImageUrl = (): string | null => {
    const image = attrs.featured_image as any;
    if (!image) return null;

    if (typeof image === 'string') {
      if (image.startsWith('/uploads')) {
        return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}${image}`;
      }
      return image;
    }

    if (image.url && typeof image.url === 'string') {
      if (image.url.startsWith('/uploads')) {
        return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}${image.url}`;
      }
      return image.url;
    }

    if (image.data?.attributes?.url && typeof image.data.attributes.url === 'string') {
      const url = image.data.attributes.url;
      if (url.startsWith('/uploads')) {
        return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}${url}`;
      }
      return url;
    }

    return null;
  };

  const imageUrl = getImageUrl();

  // Функция для возврата на блог с сохранением параметров
  const getBackUrl = () => {
    const params = new URLSearchParams();
    if (searchQuery) {
      params.set('search', searchQuery);
    }
    if (categorySlugs.length > 0) {
      categorySlugs.forEach(slug => params.append('category', slug));
    }
    if (pageParam) {
      params.set('page', pageParam);
    }
    const queryString = params.toString();
    return `/blog${queryString ? `?${queryString}` : ''}`;
  };

  return (
    <main className="min-h-screen bg-[#0a1920] py-8 md:py-12">
      <article className="container mx-auto px-4 max-w-3xl">
        {/* Навигация назад */}
        <Link
          href={getBackUrl()}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#2dd4bf] transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Назад к новостям
        </Link>

        {/* Заголовок */}
        <header className="mb-8">
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {categories.map((cat: any) => (
                <Link
                  key={cat.slug}
                  href={`/blog?category=${cat.slug}`}
                  className="text-xs font-medium text-[#2dd4bf] bg-[#2dd4bf]/10 px-3 py-1 rounded-full hover:bg-[#2dd4bf]/20 transition-colors"
                >
                  {cat.icon && <span className="mr-1">{cat.icon}</span>}
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#e0f7fa] leading-tight tracking-tight mb-4">
            {attrs.title}
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
            {attrs.publishedAt && (
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-[#2dd4bf]" />
                {formatDate(attrs.publishedAt)}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-[#2dd4bf]" />
              {readingTime} мин чтения
            </span>
            {attrs.post_status === 'draft' && (
              <span className="text-yellow-400 text-xs font-medium bg-yellow-400/10 px-2 py-0.5 rounded-full">
                ⏳ Черновик
              </span>
            )}
          </div>
        </header>

        {/* Изображение */}
        {imageUrl && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#0f2832] mb-8">
            <Image
              src={imageUrl}
              alt={attrs.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}

        {/* Содержание */}
        <div className="prose prose-invert max-w-none prose-headings:text-[#e0f7fa] prose-headings:font-bold prose-p:text-gray-300 prose-a:text-[#2dd4bf] prose-a:hover:text-[#14b8a6] prose-strong:text-[#e0f7fa] prose-li:text-gray-300 prose-blockquote:border-[#2dd4bf] prose-blockquote:text-gray-400">
          {hasSlateContent && (
            <RenderSlate nodes={attrs.content} />
          )}

          {!hasSlateContent && hasBlocksContent && (
            <div>
              {attrs.content_blocks?.map((block: any, index: number) => {
                switch (block.__component) {
                  case 'blog.text':
                    return <p key={index} className="text-gray-300">{block.text}</p>;
                  case 'blog.heading':
                    return <h2 key={index} className="text-[#e0f7fa]">{block.heading}</h2>;
                  case 'blog.quote':
                    return <blockquote key={index} className="border-l-4 border-[#2dd4bf] pl-4 italic text-gray-400">{block.quote}</blockquote>;
                  case 'blog.image':
                    return (
                      <div key={index} className="my-4">
                        <Image
                          src={block.image?.url || ''}
                          alt={block.image?.alternativeText || ''}
                          width={800}
                          height={400}
                          className="rounded-lg"
                        />
                      </div>
                    );
                  default:
                    return null;
                }
              })}
            </div>
          )}

          {!hasSlateContent && !hasBlocksContent && (
            <p className="text-gray-500">Нет содержимого</p>
          )}
        </div>

        {/* Футер */}
        <footer className="mt-12 pt-6 border-t border-[rgba(45,212,191,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <span>
                Опубликовано в{' '}
                {categories.length > 0 ? (
                  <span className="inline-flex flex-wrap gap-1">
                    {categories.map((cat: any, index: number) => (
                      <span key={cat.slug}>
                        <Link
                          href={`/blog?category=${cat.slug}`}
                          className="text-[#2dd4bf] hover:text-[#14b8a6] transition-colors inline-flex items-center gap-1"
                        >
                          <Tag size={14} />
                          {cat.name}
                        </Link>
                        {index < categories.length - 1 && <span className="text-gray-500">, </span>}
                      </span>
                    ))}
                  </span>
                ) : (
                  'общем разделе'
                )}
              </span>
            </div>
            <BlogPostActions 
              title={attrs.title} 
              excerpt={attrs.excerpt} 
              url={`/blog/${safeSlug}`} 
            />
          </div>
        </footer>
      </article>
    </main>
  );
}