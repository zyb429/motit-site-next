// src/app/(admin)/admin/posts/page.tsx
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  FileText,
  Search,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  Tag,
  ArrowLeft,
  User,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { DeletePostButton } from "./DeletePostButton";
import { StatusToggleButton } from "./StatusToggleButton";
import { EditPostButton } from "./EditPostButton";

async function getPosts() {
  const user = await getCurrentUser();
  if (!user) return [];

  const isAdmin = user.isAdmin;

  const rows = await prisma.posts.findMany({
    where: isAdmin ? {} : { author_id: user.id },
    orderBy: [{ published_at: "desc" }, { updated_at: "desc" }],
    take: 100,
    include: {
      users: { include: { avatar: true } },
      posts_categories_lnk: { include: { categories: true } },
      featured_image: true,
    },
  });

  return rows.map((p) => ({
    id: p.id,
    documentId: p.document_id ?? null,
    title: p.title ?? "",
    slug: p.slug ?? null,
    excerpt: p.excerpt ?? null,
    post_status: p.post_status ?? null,
    publishedAt: p.published_at?.toISOString() ?? null,
    createdAt: p.created_at?.toISOString() ?? null,
    updatedAt: p.updated_at?.toISOString() ?? null,
    featuredImage: p.featured_image
      ? {
        id: p.featured_image.id,
        url: p.featured_image.url ?? null,
        name: p.featured_image.name ?? null,
      }
      : null,
    author: p.users
      ? {
        username: p.users.username ?? "",
        full_name: p.users.full_name ?? null,
        avatar_url: p.users.avatar?.url ?? null,
      }
      : null,
    categories:
      p.posts_categories_lnk
        ?.map((l) => l.categories)
        .filter(Boolean)
        .map((c: any) => ({ name: c.name ?? "", slug: c.slug ?? null })) ?? [],
  }));
}

function formatDate(dateString?: string | null) {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function getAuthorInfo(post: any): {
  name: string;
  username: string;
  avatarUrl: string | null;
} | null {
  const author = post.author;
  if (!author) return null;
  const username = author.username || "";
  const fullName = author.full_name || username;
  if (!fullName && !username) return null;
  return {
    name: fullName || username,
    username,
    avatarUrl: author.avatar_url ?? null,
  };
}

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams?:
  Promise<{ q?: string; status?: string }> | { q?: string; status?: string };
}) {
  const params = (await searchParams) || {};
  const query = (params.q || "").toLowerCase().trim();
  const statusFilter = params.status || "all";

  const allPosts = await getPosts();

  const totalCount = allPosts.length;
  const publishedCount = allPosts.filter(
    (p) =>
      (p.post_status || (p.publishedAt ? "published" : "draft")) ===
      "published",
  ).length;
  const draftCount = totalCount - publishedCount;

  let posts = allPosts;
  if (query) {
    posts = posts.filter((p) => {
      const title = (p.title || "").toLowerCase();
      const slug = (p.slug || "").toLowerCase();
      return title.includes(query) || slug.includes(query);
    });
  }
  if (statusFilter !== "all") {
    posts = posts.filter((p) => {
      const status = p.post_status || (p.publishedAt ? "published" : "draft");
      return status === statusFilter;
    });
  }

  return (
    <div className="min-h-screen bg-(--bg-primary)">
      <header className="bg-(--bg-card) border-b border-(--border) sticky top-0 z-10 h-20">
        <div className="container mx-auto px-6 h-full flex items-center max-w-6xl">
          <div className="flex items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="text-(--text-muted) hover:text-(--text-primary) transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="w-12 h-12 bg-(--accent-dim) rounded-lg flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-(--accent)" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-(--text-primary)">
                  Посты
                </h1>
                <p className="text-sm text-(--text-secondary)">
                  Управление статьями и новостями
                </p>
              </div>
            </div>

            <Link
              href="/admin/posts/new"
              className="px-6 py-2 bg-(--accent) text-(--bg-primary) rounded-lg hover:bg-(--accent-hover) flex items-center gap-2 shadow-sm hover:shadow transition-all font-medium"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Создать пост</span>
              <span className="sm:hidden">Создать</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-(--bg-card) rounded-xl border border-(--border) p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-(--text-secondary)">Всего постов</p>
                <p className="text-2xl font-bold text-(--text-primary) mt-1">
                  {totalCount}
                </p>
              </div>
              <div className="w-10 h-10 bg-(--accent-dim) rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-(--accent)" />
              </div>
            </div>
          </div>

          <div className="bg-(--bg-card) rounded-xl border border-(--border) p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-(--text-secondary)">Опубликовано</p>
                <p className="text-2xl font-bold text-(--accent) mt-1">
                  {publishedCount}
                </p>
              </div>
              <div className="w-10 h-10 bg-(--accent-dim) rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-(--accent)" />
              </div>
            </div>
          </div>

          <div className="bg-(--bg-card) rounded-xl border border-(--border) p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-(--text-secondary)">Черновики</p>
                <p className="text-2xl font-bold text-yellow-500 mt-1">
                  {draftCount}
                </p>
              </div>
              <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-(--bg-card) rounded-xl border border-(--border) p-4 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <form
              className="flex-1 relative"
              action="/admin/posts"
              method="GET"
            >
              <Search className="w-4 h-4 text-(--text-muted) absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                name="q"
                defaultValue={params.q || ""}
                placeholder="Поиск по заголовку или slug..."
                className="w-full pl-10 pr-4 py-2 bg-(--bg-secondary) border border-(--border) rounded-lg text-(--text-primary) focus:border-(--accent) focus:outline-none transition-colors text-sm"
              />
              {statusFilter !== "all" && (
                <input type="hidden" name="status" value={statusFilter} />
              )}
            </form>

            <div className="flex items-center gap-1 bg-(--bg-secondary) rounded-lg p-1">
              {[
                { key: "all", label: "Все", count: totalCount },
                {
                  key: "published",
                  label: "Опубликовано",
                  count: publishedCount,
                },
                { key: "draft", label: "Черновики", count: draftCount },
              ].map((tab) => {
                const isActive = statusFilter === tab.key;
                const href = `/admin/posts?${new URLSearchParams({
                  ...(query ? { q: params.q! } : {}),
                  ...(tab.key !== "all" ? { status: tab.key } : {}),
                }).toString()}`;
                return (
                  <Link
                    key={tab.key}
                    href={href}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${isActive
                        ? "bg-(--bg-card) text-(--accent) shadow-sm"
                        : "text-(--text-secondary) hover:text-(--text-primary)"
                      }`}
                  >
                    {tab.label}
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full ${isActive
                          ? "bg-(--accent-dim) text-(--accent)"
                          : "bg-(--bg-card) text-(--text-muted)"
                        }`}
                    >
                      {tab.count}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="bg-(--bg-card) rounded-xl border border-dashed border-(--border) p-12 text-center">
            <div className="w-16 h-16 bg-(--bg-secondary) rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-(--text-muted)" />
            </div>
            <h3 className="text-lg font-semibold text-(--text-primary) mb-1">
              {query || statusFilter !== "all"
                ? "Ничего не найдено"
                : "Постов пока нет"}
            </h3>
            <p className="text-sm text-(--text-secondary) mb-4">
              {query || statusFilter !== "all"
                ? "Попробуйте изменить фильтры или поисковый запрос"
                : "Создайте первый пост, чтобы он появился здесь"}
            </p>
            {!query && statusFilter === "all" && (
              <Link
                href="/admin/posts/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-(--accent) text-(--bg-primary) rounded-lg hover:bg-(--accent-hover) transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Создать пост
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Карточки — < lg */}
            <div className="lg:hidden space-y-3">
              {posts.map((post) => {
                const postId = post.documentId || String(post.id);
                const slug = post.slug || postId;
                const status =
                  post.post_status ||
                  (post.publishedAt ? "published" : "draft");
                const author = getAuthorInfo(post);
                const categories = (post.categories || [])
                  .map((c: any) => c.name)
                  .filter(Boolean);

                return (
                  <div
                    key={postId}
                    className="bg-(--bg-card) rounded-xl border border-(--border) p-4 space-y-3"
                  >
                    <div className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-(--bg-secondary) flex items-center justify-center shrink-0">
                        {post.featuredImage?.url ? (
                          <Image
                            src={post.featuredImage.url}
                            alt={post.title || ""}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-(--text-muted)" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/admin/posts/${postId}`}
                          className="text-sm font-semibold text-(--text-primary) hover:text-(--accent) transition-colors line-clamp-2"
                        >
                          {post.title || "Без названия"}
                        </Link>
                        {post.excerpt && (
                          <p className="text-xs text-(--text-muted) line-clamp-2 mt-1">
                            {post.excerpt}
                          </p>
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/blog/${slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <code className="text-xs text-(--text-muted) font-mono bg-(--bg-secondary) px-2 py-0.5 rounded block truncate">
                        /{slug}
                      </code>
                    </Link>

                    {categories.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {categories.map((cat: string) => (
                          <span
                            key={cat}
                            className="inline-flex items-center gap-1 text-xs bg-(--accent-dim) text-(--accent) px-2 py-0.5 rounded-full"
                          >
                            <Tag className="w-3 h-3" />
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-(--text-secondary)">
                      {author && (
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-full overflow-hidden bg-(--bg-secondary) flex items-center justify-center shrink-0">
                            {author.avatarUrl ? (
                              <Image
                                src={author.avatarUrl}
                                alt={author.name}
                                width={24}
                                height={24}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-3 h-3 text-(--text-muted)" />
                            )}
                          </div>
                          <span className="truncate">{author.name}</span>
                        </div>
                      )}
                      <span className="whitespace-nowrap">
                        {formatDate(post.publishedAt || post.createdAt)}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status === "published"
                            ? "bg-(--accent-dim) text-(--accent)"
                            : status === "archived"
                              ? "bg-(--bg-secondary) text-(--text-muted)"
                              : "bg-yellow-500/10 text-yellow-500"
                          }`}
                      >
                        {status === "published" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {status === "published"
                          ? "Опубликован"
                          : status === "archived"
                            ? "Архив"
                            : "Черновик"}
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-1 pt-2 border-t border-(--border)">
                      <EditPostButton postId={postId} />
                      <StatusToggleButton
                        postId={postId}
                        currentStatus={status}
                      />
                      <DeletePostButton
                        postId={postId}
                        postTitle={post.title}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Таблица — ≥ lg */}
            <div className="hidden lg:block bg-(--bg-card) rounded-xl shadow-sm border border-(--border) overflow-hidden">
              <table className="w-full table-fixed">
                <colgroup>
                  <col style={{ width: "7%" }} />
                  <col />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "10%" }} />
                </colgroup>
                <thead className="bg-(--bg-secondary) border-b border-(--border)">
                  <tr>
                    <th className="text-center px-2 py-3 text-xs font-medium text-(--text-muted) uppercase tracking-wider">
                      Превью
                    </th>
                    <th className="text-left px-3 py-3 text-xs font-medium text-(--text-muted) uppercase tracking-wider">
                      Заголовок
                    </th>
                    <th className="text-left px-3 py-3 text-xs font-medium text-(--text-muted) uppercase tracking-wider">
                      Slug
                    </th>
                    <th className="text-left px-3 py-3 text-xs font-medium text-(--text-muted) uppercase tracking-wider">
                      Категории
                    </th>
                    <th className="text-left px-3 py-3 text-xs font-medium text-(--text-muted) uppercase tracking-wider">
                      Дата
                    </th>
                    <th className="text-left px-3 py-3 text-xs font-medium text-(--text-muted) uppercase tracking-wider">
                      Автор
                    </th>
                    <th className="text-left px-3 py-3 text-xs font-medium text-(--text-muted) uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="text-right px-3 py-3 text-xs font-medium text-(--text-muted) uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--border)">
                  {posts.map((post) => {
                    const postId = post.documentId || String(post.id);
                    const slug = post.slug || postId;
                    const status =
                      post.post_status ||
                      (post.publishedAt ? "published" : "draft");
                    const categories = (post.categories || [])
                      .map((c: any) => c.name)
                      .filter(Boolean);

                    return (
                      <tr
                        key={postId}
                        className="hover:bg-(--bg-secondary)/50 transition-colors group"
                      >
                        <td className="px-2 py-3 align-middle">
                          <div className="w-10 h-10 mx-auto rounded-lg overflow-hidden bg-(--bg-secondary) flex items-center justify-center">
                            {post.featuredImage?.url ? (
                              <Image
                                src={post.featuredImage.url}
                                alt={post.title || ""}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-(--text-muted)" />
                            )}
                          </div>
                        </td>

                        <td className="px-3 py-3 align-middle overflow-hidden">
                          <Link
                            href={`/admin/posts/${postId}`}
                            className="text-sm font-medium text-(--text-primary) hover:text-(--accent) transition-colors block truncate"
                            title={post.title || "Без названия"}
                          >
                            {post.title || "Без названия"}
                          </Link>
                          {post.excerpt && (
                            <p className="text-xs text-(--text-muted) truncate mt-0.5">
                              {post.excerpt}
                            </p>
                          )}
                        </td>

                        <td className="px-3 py-3 align-middle overflow-hidden">
                          <Link
                            href={`/blog/${slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/slug block"
                            title={`/${slug}`}
                          >
                            <code className="text-xs text-(--text-muted) font-mono bg-(--bg-secondary) px-2 py-0.5 rounded transition-colors group-hover/slug:text-(--accent) group-hover/slug:bg-(--accent-dim) block truncate">
                              /{slug}
                            </code>
                          </Link>
                        </td>

                        <td className="px-3 py-3 align-middle overflow-hidden">
                          {categories.length > 0 ? (
                            <div className="flex items-center gap-1 min-w-0">
                              <span className="inline-flex items-center gap-1 text-xs bg-(--accent-dim) text-(--accent) px-2 py-0.5 rounded-full max-w-full min-w-0">
                                <Tag className="w-3 h-3 shrink-0" />
                                <span className="truncate">
                                  {categories[0]}
                                </span>
                              </span>
                              {categories.length > 1 && (
                                <span className="text-xs text-(--text-muted) shrink-0">
                                  +{categories.length - 1}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-(--text-muted)">
                              —
                            </span>
                          )}
                        </td>

                        <td className="px-3 py-3 align-middle overflow-hidden">
                          <span className="text-xs text-(--text-secondary) truncate block whitespace-nowrap">
                            {formatDate(post.publishedAt || post.createdAt)}
                          </span>
                        </td>

                        <td className="px-3 py-3 align-middle overflow-hidden">
                          {(() => {
                            const author = getAuthorInfo(post);
                            if (!author) {
                              return (
                                <span className="text-xs text-(--text-muted)">
                                  —
                                </span>
                              );
                            }
                            return (
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-7 h-7 rounded-full overflow-hidden bg-(--bg-secondary) flex items-center justify-center shrink-0">
                                  {author.avatarUrl ? (
                                    <Image
                                      src={author.avatarUrl}
                                      alt={author.name}
                                      width={28}
                                      height={28}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <User className="w-3.5 h-3.5 text-(--text-muted)" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p
                                    className="text-xs font-medium text-(--text-primary) truncate"
                                    title={author.name}
                                  >
                                    {author.name}
                                  </p>
                                  {author.username &&
                                    author.username !== author.name && (
                                      <p className="text-[10px] text-(--text-muted) truncate">
                                        @{author.username}
                                      </p>
                                    )}
                                </div>
                              </div>
                            );
                          })()}
                        </td>

                        <td className="px-3 py-3 align-middle overflow-hidden">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${status === "published"
                                ? "bg-(--accent-dim) text-(--accent)"
                                : status === "archived"
                                  ? "bg-(--bg-secondary) text-(--text-muted)"
                                  : "bg-yellow-500/10 text-yellow-500"
                              }`}
                          >
                            {status === "published" ? (
                              <CheckCircle2 className="w-3 h-3 shrink-0" />
                            ) : (
                              <Clock className="w-3 h-3 shrink-0" />
                            )}
                            <span className="hidden xl:inline">
                              {status === "published"
                                ? "Опубликован"
                                : status === "archived"
                                  ? "Архив"
                                  : "Черновик"}
                            </span>
                          </span>
                        </td>

                        <td className="px-3 py-3 align-middle">
                          <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <EditPostButton postId={postId} />
                            <StatusToggleButton
                              postId={postId}
                              currentStatus={status}
                            />
                            <DeletePostButton
                              postId={postId}
                              postTitle={post.title}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {posts.length > 0 && (
          <p className="text-xs text-(--text-muted) text-center mt-4">
            Показано {posts.length} из {totalCount}{" "}
            {totalCount === 1 ? "поста" : "постов"}
          </p>
        )}
      </main>
    </div>
  );
}
