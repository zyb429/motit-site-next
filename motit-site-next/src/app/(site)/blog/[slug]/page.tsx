// src/app/(site)/blog/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPostBySlugPrisma, getPostsPrisma } from "@/lib/db/posts";
import { BlogPostActions } from "@/components/blog/BlogPostActions";
import { Calendar, User, Clock, ArrowLeft, Tag } from "lucide-react";
import { getSafeImageUrl } from "@/lib/images";
import { TaskList, TaskItem } from "@tiptap/extension-list";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import type { JSONContent } from "@tiptap/core";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";

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

// Расширения должны совпадать с теми, что используются в SimpleEditor
const TIPTAP_EXTENSIONS = [
  StarterKit.configure({
    link: {
      openOnClick: false,
      HTMLAttributes: { class: "text-[#2dd4bf] hover:text-[#14b8a6]" },
    },
  }),
  ImageExtension,
  TaskList,
  TaskItem.configure({ nested: true }),
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Typography,
  Highlight.configure({ multicolor: true }),
  Superscript,
  Subscript,
];

function renderTiptapContent(raw: unknown): string {
  if (!raw) return "";

  try {
    let json: JSONContent | null = null;

    // Если контент пришёл строкой — парсим
    if (typeof raw === "string") {
      const trimmed = raw.trim();
      if (!trimmed) return "";
      // Если это уже HTML-строка (старые посты со Strapi), вернём как есть
      if (trimmed.startsWith("<")) return trimmed;
      try {
        json = JSON.parse(trimmed);
      } catch {
        return "";
      }
    } else if (typeof raw === "object") {
      json = raw as JSONContent;
    }

    if (!json) return "";

    // Slate-массивы Tiptap не понимает — пропускаем, чтобы не упасть
    if (Array.isArray(json)) {
      console.warn(
        "[blog] Обнаружен контент в формате Slate — рендеринг пропущен. " +
          "Пересохраните пост в новом редакторе.",
      );
      return "";
    }

    // Простейшая валидация: у Tiptap-документа должен быть type "doc"
    if (json.type !== "doc" && !json.content) {
      return "";
    }

    return generateHTML(json, TIPTAP_EXTENSIONS);
  } catch (error) {
    console.error("[blog] Failed to render Tiptap content:", error);
    return "";
  }
}

function extractPlainText(raw: unknown): string {
  if (!raw) return "";

  try {
    let json: JSONContent | null = null;

    if (typeof raw === "string") {
      const trimmed = raw.trim();
      if (trimmed.startsWith("<")) {
        return trimmed.replace(/<[^>]*>/g, " ");
      }
      try {
        json = JSON.parse(trimmed);
      } catch {
        return trimmed;
      }
    } else if (typeof raw === "object" && !Array.isArray(raw)) {
      json = raw as JSONContent;
    }

    if (!json || Array.isArray(json)) return "";

    const walk = (node: JSONContent): string => {
      if (node.type === "text" && typeof node.text === "string") {
        return node.text;
      }
      if (!node.content) return "";
      return node.content.map(walk).join(" ");
    };

    return walk(json);
  } catch {
    return "";
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

  const rawContent = (post as { content?: unknown }).content ?? null;
  const htmlContent = renderTiptapContent(rawContent);

  const getReadingTime = () => {
    const text = extractPlainText(rawContent) || post.excerpt || "";
    const words = text.trim().split(/\s+/).filter(Boolean).length;
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

        {post.featuredImage?.url && (
          <div className="mb-8 rounded-lg overflow-hidden border border-[rgba(45,212,191,0.08)]">
            <Image
              src={
                getSafeImageUrl(post.featuredImage.url) ??
                post.featuredImage.url
              }
              alt={post.title || "Превью поста"}
              width={1200}
              height={630}
              className="w-full h-auto object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}

        <div className="prose prose-invert max-w-none prose-headings:text-[#e0f7fa] prose-headings:font-bold prose-p:text-gray-300 prose-a:text-[#2dd4bf] prose-a:hover:text-[#14b8a6] prose-strong:text-[#e0f7fa] prose-li:text-gray-300 prose-blockquote:border-[#2dd4bf] prose-blockquote:text-gray-400 prose-img:rounded-lg">
          {htmlContent ? (
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
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