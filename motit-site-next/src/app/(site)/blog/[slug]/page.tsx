// src/app/(site)/blog/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPostBySlugPrisma, getPostsPrisma } from "@/lib/db/posts";
import RenderSlate from "@/components/editor/RenderSlate";
import { BlogPostActions } from "@/components/blog/BlogPostActions";
import { Calendar, User, Clock, ArrowLeft, Tag } from "lucide-react";
import { Element, Text, type Descendant } from "slate";
import type { CustomElement } from "@/types/slate";
import { getSafeImageUrl } from "@/lib/images";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
  searchParams?:
    | Promise<{
        search?: string;
        category?: string | string[];
        page?: string;
        view?: string;
      }>
    | undefined;
}

// SSG
export async function generateStaticParams() {
  try {
    const posts = await getPostsPrisma({ status: "published", take: 100 });
    return posts
      .filter((p) => p.slug)
      .map((p) => ({ slug: p.slug as string }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// SEO
export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const post = await getPostBySlugPrisma(slug, { withContent: true });

    if (!post) return { title: "Пост не найден" };

    return {
      title: post.meta_title || post.title || "Пост",
      description: post.meta_description || post.excerpt || "",
      robots:
        post.post_status === "draft" ? "noindex, nofollow" : "index, follow",
      openGraph: {
        title: post.meta_title || post.title || "Пост",
        description: post.meta_description || post.excerpt || "",
        type: "article",
        publishedTime: post.publishedAt || undefined,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return { title: "Пост не найден" };
  }
}

export default async function BlogPostPage({
  params,
  searchParams = Promise.resolve({}),
}: BlogPostPageProps) {
  const { slug } = await params;
  const safeSlug = typeof slug === "string" ? slug : String(slug || "");

  let searchQuery = "";
  let categorySlugs: string[] = [];
  let pageParam = "";
  let viewParam = "";

  try {
    const sp = (await searchParams) as
      | {
          search?: string;
          category?: string | string[];
          page?: string;
          view?: string;
        }
      | undefined;
    if (sp && typeof sp === "object") {
      searchQuery = sp.search || "";
      if (sp.category) {
        categorySlugs = Array.isArray(sp.category) ? sp.category : [sp.category];
      }
      if (sp.page) pageParam = String(sp.page);
      if (sp.view) viewParam = String(sp.view);
    }
  } catch {
    // ignore
  }

  const post = await getPostBySlugPrisma(safeSlug, { withContent: true });

  if (!post) notFound();

  const categories = post.categories;
  const author = post.author;

  const content = (post as { content?: CustomElement[] | null }).content ?? null;

  const hasSlateContent =
    Array.isArray(content) && content.length > 0;

  const getReadingTime = () => {
    let text = "";
    if (hasSlateContent && content) {
      const extractText = (nodes: Descendant[]): string => {
        let result = "";
        for (const node of nodes) {
          if (Text.isText(node)) {
            result += node.text + " ";
          } else if (Element.isElement(node)) {
            result += extractText(node.children);
          }
        }
        return result;
      };
      text = extractText(content);
    } else if (post.excerpt) {
      text = post.excerpt;
    }
    const words = text.replace(/<[^>]*>/g, "").split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return minutes > 0 ? minutes : 1;
  };

  const readingTime = getReadingTime();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return null;
    }
  };

  const getBackUrl = () => {
    const p = new URLSearchParams();
    if (searchQuery) p.set("search", searchQuery);
    if (categorySlugs.length > 0)
      categorySlugs.forEach((s) => p.append("category", s));
    if (pageParam) p.set("page", pageParam);
    if (viewParam) p.set("view", viewParam);
    const qs = p.toString();
    return `/blog${qs ? `?${qs}` : ""}`;
  };

  return (
    <main className="min-h-screen bg-[#0a1920] py-8 md:py-12">
      <article className="container mx-auto px-4 max-w-3xl">
        <Link
          href={getBackUrl()}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#2dd4bf] transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Назад к новостям
        </Link>

        <header className="mb-8">
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/blog?category=${cat.slug}`}
                  className="text-xs font-medium text-[#2dd4bf] bg-[#2dd4bf]/10 px-3 py-1 rounded-full hover:bg-[#2dd4bf]/20 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#e0f7fa] leading-tight tracking-tight mb-4">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            {author && (
              <Link
                href={`/authors/${author.username}`}
                className="flex items-center gap-1.5 hover:text-[#2dd4bf] transition-colors"
              >
                {(() => {
                  const avatarSrc = getSafeImageUrl(author.avatar_url);
                  return avatarSrc ? (
                    <Image
                      src={avatarSrc}
                      alt={author.full_name || author.username}
                      width={20}
                      height={20}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <User size={14} className="text-[#2dd4bf]" />
                  );
                })()}
                {author.full_name || author.username}
              </Link>
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
            {post.post_status === "draft" && (
              <span className="text-yellow-400 text-xs font-medium bg-yellow-400/10 px-2 py-0.5 rounded-full">
                ⏳ Черновик
              </span>
            )}
          </div>
        </header>

        <div className="prose prose-invert max-w-none prose-headings:text-[#e0f7fa] prose-headings:font-bold prose-p:text-gray-300 prose-a:text-[#2dd4bf] prose-a:hover:text-[#14b8a6] prose-strong:text-[#e0f7fa] prose-li:text-gray-300 prose-blockquote:border-[#2dd4bf] prose-blockquote:text-gray-400">
          {hasSlateContent && content ? (
            <RenderSlate nodes={content} />
          ) : (
            <p className="text-gray-500">Нет содержимого</p>
          )}
        </div>

        <footer className="mt-12 pt-6 border-t border-[rgba(45,212,191,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <span>
                Опубликовано в{" "}
                {categories.length > 0 ? (
                  <span className="inline-flex flex-wrap gap-1">
                    {categories.map((cat, i) => (
                      <span key={cat.id}>
                        <Link
                          href={`/blog?category=${cat.slug}`}
                          className="text-[#2dd4bf] hover:text-[#14b8a6] transition-colors inline-flex items-center gap-1"
                        >
                          <Tag size={14} />
                          {cat.name}
                        </Link>
                        {i < categories.length - 1 && (
                          <span className="text-gray-500">, </span>
                        )}
                      </span>
                    ))}
                  </span>
                ) : (
                  "общем разделе"
                )}
              </span>
            </div>
            <BlogPostActions
              title={post.title || ""}
              excerpt={post.excerpt || ""}
              url={getBackUrl().replace("/blog", `/blog/${safeSlug}`)}
            />
          </div>
        </footer>
      </article>
    </main>
  );
}
