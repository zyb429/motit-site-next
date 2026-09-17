// src/app/(admin)/admin/posts/page.tsx
import Link from "next/link";
import { cookies } from "next/headers";
import {
  Plus,
  Edit,
  FileText,
  Search,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  Tag,
  ArrowLeft,
  User,
} from "lucide-react";
import { DeletePostButton } from "./DeletePostButton";
import { StatusToggleButton } from "./StatusToggleButton";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

async function getPosts() {
  const cookieStore = await cookies();
  const token = cookieStore.get("strapi_jwt")?.value;
  if (!token) return [];

  // Кто я?
  const meRes = await fetch(`${STRAPI_URL}/api/users/me?populate[role]=*`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!meRes.ok) return [];
  const me = await meRes.json();
  const roleName = (me.role?.name ?? me.role?.type ?? "").toLowerCase();
  const isAdmin = roleName === "admin";

  // Админ — все посты, автор — только свои
  const filter = isAdmin ? "" : `filters[author][id][$eq]=${me.id}&`;

  const res = await fetch(
    `${STRAPI_URL}/api/posts?${filter}` +
    `populate[0]=categories&` +
    `populate[1]=featured_image&` +
    `populate[2]=author&` +
    `populate[3]=author.avatar&` +
    `sort[0]=publishedAt:desc&` +
    `pagination[pageSize]=100`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );

  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

function formatDate(dateString?: string) {
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

function getFeaturedImageUrl(post: any): string | null {
  const img = post.featured_image;
  if (!img) return null;

  const raw = img.url || img.data?.attributes?.url || img.data?.url || null;

  if (!raw) return null;

  if (raw.startsWith("http")) return raw;

  const base =
    process.env.NEXT_PUBLIC_MEDIA_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    STRAPI_URL;

  return `${base}${raw.startsWith("/") ? "" : "/"}${raw}`;
}

function getAuthorInfo(post: any): {
  name: string;
  username: string;
  avatarUrl: string | null;
} | null {
  const author = post.author;
  if (!author) return null;

  // Strapi v5: author — плоский объект
  // Strapi v4: author = { data: { attributes: {...} } }
  const data = author.data?.attributes ?? author.attributes ?? author;

  const username = data.username || "";
  const fullName =
    data.full_name ||
    [data.firstname, data.lastname].filter(Boolean).join(" ") ||
    username;

  if (!fullName && !username) return null;

  // Аватар
  const rawAvatar =
    data.avatar?.url ||
    data.avatar?.data?.attributes?.url ||
    data.avatar?.data?.url ||
    null;

  let avatarUrl: string | null = null;
  if (rawAvatar) {
    if (rawAvatar.startsWith("http")) {
      avatarUrl = rawAvatar;
    } else {
      const base =
        process.env.NEXT_PUBLIC_MEDIA_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        STRAPI_URL;
      avatarUrl = `${base}${rawAvatar.startsWith("/") ? "" : "/"}${rawAvatar}`;
    }
  }

  return { name: fullName || username, username, avatarUrl };
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
    (p: any) =>
      (p.post_status || (p.publishedAt ? "published" : "draft")) ===
      "published",
  ).length;
  const draftCount = totalCount - publishedCount;

  let posts = allPosts;
  if (query) {
    posts = posts.filter((p: any) => {
      const title = (p.title || "").toLowerCase();
      const slug = (p.slug || "").toLowerCase();
      return title.includes(query) || slug.includes(query);
    });
  }
  if (statusFilter !== "all") {
    posts = posts.filter((p: any) => {
      const status = p.post_status || (p.publishedAt ? "published" : "draft");
      return status === statusFilter;
    });
  }

  return (
    <div className="min-h-screen bg-(--bg-primary)">
      {/* Sticky header */}
      <header className="bg-(--bg-card) border-b border-(--border) sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 max-w-6xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="text-(--text-muted) hover:text-(--text-primary) transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="w-12 h-12 bg-(--accent-dim) rounded-lg flex items-center justify-center">
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
        {/* Статистика */}
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

        {/* Фильтры и поиск */}
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

        {/* Таблица или пустое состояние */}
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
          <div className="bg-(--bg-card) rounded-xl shadow-sm border border-(--border) overflow-hidden">
            <table className="w-full">
              <thead className="bg-(--bg-secondary) border-b border-(--border)">
                <tr>
                  <th className="text-center px-4 py-3 text-xs font-medium text-(--text-muted) uppercase tracking-wider">
                    Превью
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-(--text-muted) uppercase tracking-wider">
                    Заголовок
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-(--text-muted) uppercase tracking-wider hidden lg:table-cell">
                    Slug
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-(--text-muted) uppercase tracking-wider hidden lg:table-cell">
                    Категории
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-(--text-muted) uppercase tracking-wider hidden sm:table-cell">
                    Дата
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-(--text-muted) uppercase tracking-wider hidden lg:table-cell">
                    Автор
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-(--text-muted) uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-(--text-muted) uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--border)">
                {posts.map((post: any) => {
                  const postId = post.documentId || String(post.id);
                  const slug = post.slug || postId;
                  const status =
                    post.post_status ||
                    (post.publishedAt ? "published" : "draft");
                  const imageUrl = getFeaturedImageUrl(post);
                  const categories = (post.categories || [])
                    .map((c: any) => c.attributes?.name || c.name)
                    .filter(Boolean);

                  return (
                    <tr
                      key={postId}
                      className="hover:bg-(--bg-secondary)/50 transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-(--bg-secondary) flex items-center justify-center shrink-0">
                          {imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={imageUrl}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-(--text-muted)" />
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="min-w-0">
                          <Link
                            href={`/admin/posts/${postId}`}
                            className="text-sm font-medium text-(--text-primary) hover:text-(--accent) transition-colors line-clamp-1"
                          >
                            {post.title || "Без названия"}
                          </Link>
                          {post.excerpt && (
                            <p className="text-xs text-(--text-muted) line-clamp-1 mt-0.5">
                              {post.excerpt}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 hidden md:table-cell">
                        <code className="text-xs text-(--text-muted) font-mono truncate max-w-45 block">
                          /{slug}
                        </code>
                      </td>

                      <td className="px-4 py-3 hidden lg:table-cell">
                        {categories.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {categories.slice(0, 2).map((cat: string) => (
                              <span
                                key={cat}
                                className="inline-flex items-center gap-1 text-xs bg-(--accent-dim) text-(--accent) px-2 py-0.5 rounded-full"
                              >
                                <Tag className="w-3 h-3" />
                                {cat}
                              </span>
                            ))}
                            {categories.length > 2 && (
                              <span className="text-xs text-(--text-muted)">
                                +{categories.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-(--text-muted)">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs text-(--text-secondary)">
                          {formatDate(post.publishedAt || post.createdAt)}
                        </span>
                      </td>

                      <td className="px-4 py-3 hidden lg:table-cell">
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
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full overflow-hidden bg-(--bg-secondary) flex items-center justify-center shrink-0">
                                {author.avatarUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={author.avatarUrl}
                                    alt={author.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User className="w-4 h-4 text-(--text-muted)" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-(--text-primary) truncate">
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

                      <td className="px-4 py-3">
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
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/admin/posts/${postId}`}
                            className="p-2 text-(--accent) hover:bg-(--accent-dim) rounded-lg transition-colors"
                            title="Редактировать"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
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
