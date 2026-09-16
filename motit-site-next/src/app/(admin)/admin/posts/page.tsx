// src/app/admin/posts/page.tsx
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
} from "lucide-react";
import { DeletePostButton } from "./DeletePostButton";
import { StatusToggleButton } from "./StatusToggleButton";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

async function getPosts() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get("strapi_jwt")?.value || cookieStore.get("token")?.value;

  const res = await fetch(
    `${STRAPI_URL}/api/posts?populate[0]=categories&populate[1]=featured_image&sort[0]=publishedAt:desc&pagination[pageSize]=100`,
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
      month: "short",
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

  // Статистика
  const totalCount = allPosts.length;
  const publishedCount = allPosts.filter(
    (p: any) =>
      (p.post_status || (p.publishedAt ? "published" : "draft")) ===
      "published",
  ).length;
  const draftCount = totalCount - publishedCount;

  // Фильтрация
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
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Sticky header — как в CreatePostClient */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 max-w-6xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Посты</h1>
                <p className="text-sm text-gray-500">
                  Управление статьями и новостями
                </p>
              </div>
            </div>

            <Link
              href="/admin/posts/new"
              className="px-6 py-2 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 shadow-sm hover:shadow transition-all"
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
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Всего постов</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {totalCount}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Опубликовано</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {publishedCount}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Черновики</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {draftCount}
                </p>
              </div>
              <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Фильтры и поиск */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <form
              className="flex-1 relative"
              action="/admin/posts"
              method="GET"
            >
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                name="q"
                defaultValue={params.q || ""}
                placeholder="Поиск по заголовку или slug..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
              />
              {statusFilter !== "all" && (
                <input type="hidden" name="status" value={statusFilter} />
              )}
            </form>

            <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
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
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-200 text-gray-600"
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
          <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {query || statusFilter !== "all"
                ? "Ничего не найдено"
                : "Постов пока нет"}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {query || statusFilter !== "all"
                ? "Попробуйте изменить фильтры или поисковый запрос"
                : "Создайте первый пост, чтобы он появился здесь"}
            </p>
            {!query && statusFilter === "all" && (
              <Link
                href="/admin/posts/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Создать пост
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Превью
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Заголовок
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Slug
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Категории
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Дата
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
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
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                          {imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={imageUrl}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="min-w-0">
                          <Link
                            href={`/admin/posts/${postId}`}
                            className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-1"
                          >
                            {post.title || "Без названия"}
                          </Link>
                          {post.excerpt && (
                            <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                              {post.excerpt}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 hidden md:table-cell">
                        <code className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded font-mono">
                          {slug}
                        </code>
                      </td>

                      <td className="px-4 py-3 hidden lg:table-cell">
                        {categories.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {categories.slice(0, 2).map((cat: string) => (
                              <span
                                key={cat}
                                className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full"
                              >
                                <Tag className="w-3 h-3" />
                                {cat}
                              </span>
                            ))}
                            {categories.length > 2 && (
                              <span className="text-xs text-gray-400">
                                +{categories.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs text-gray-500">
                          {formatDate(post.publishedAt || post.createdAt)}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            status === "published"
                              ? "bg-green-50 text-green-700"
                              : status === "archived"
                                ? "bg-gray-100 text-gray-600"
                                : "bg-yellow-50 text-yellow-700"
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
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
          <p className="text-xs text-gray-400 text-center mt-4">
            Показано {posts.length} из {totalCount}{" "}
            {totalCount === 1 ? "поста" : "постов"}
          </p>
        )}
      </main>
    </div>
  );
}
