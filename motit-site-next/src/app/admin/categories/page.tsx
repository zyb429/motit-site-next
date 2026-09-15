// src/app/admin/categories/page.tsx
import Link from "next/link";
import { cookies } from "next/headers";
import {
  Plus,
  Edit,
  FolderTree,
  Search,
  Tag,
  FileText,
  ArrowLeft,
} from "lucide-react";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

async function getCategories() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get("strapi_jwt")?.value || cookieStore.get("token")?.value;

  const res = await fetch(
    `${STRAPI_URL}/api/categories?sort[0]=name:asc&pagination[pageSize]=100`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );

  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

async function getPostsCountByCategory(): Promise<Record<string, number>> {
  const cookieStore = await cookies();
  const token =
    cookieStore.get("strapi_jwt")?.value || cookieStore.get("token")?.value;

  const res = await fetch(
    `${STRAPI_URL}/api/posts?populate%5B0%5D=categories&pagination%5BpageSize%5D=1000`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );

  if (!res.ok) return {};

  const data = await res.json();
  const counts: Record<string, number> = {};

  for (const post of data.data || []) {
    const cats = post.categories || [];
    for (const cat of cats) {
      const slug = cat.slug;
      if (slug) {
        counts[slug] = (counts[slug] || 0) + 1;
      }
    }
  }

  return counts;
}

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }> | { q?: string };
}) {
  const params = (await searchParams) || {};
  const query = (params.q || "").toLowerCase().trim();

  const [allCategories, counts] = await Promise.all([
    getCategories(),
    getPostsCountByCategory(),
  ]);

  // Фильтрация по поиску
  let categories = allCategories;
  if (query) {
    categories = categories.filter((c: any) => {
      const name = (c.name || "").toLowerCase();
      const slug = (c.slug || "").toLowerCase();
      const description = (c.description || "").toLowerCase();
      return (
        name.includes(query) ||
        slug.includes(query) ||
        description.includes(query)
      );
    });
  }

  const totalCount = allCategories.length;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Sticky header — как в /admin/posts */}
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
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <FolderTree className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Категории</h1>
                <p className="text-sm text-gray-500">
                  Управление категориями блога
                </p>
              </div>
            </div>

            <Link
              href="/admin/categories/new"
              className="px-6 py-2 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 shadow-sm hover:shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Создать категорию</span>
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
                <p className="text-sm text-gray-500">Всего категорий</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {totalCount}
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <FolderTree className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Найдено</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {categories.length}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Со статьями</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {
                    allCategories.filter((c: any) => (counts[c.slug] ?? 0) > 0)
                      .length
                  }
                </p>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Поиск */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm mb-6">
          <form className="relative" action="/admin/categories" method="GET">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              name="q"
              defaultValue={params.q || ""}
              placeholder="Поиск по названию, slug или описанию..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
            />
          </form>
        </div>

        {/* Сетка или пустое состояние */}
        {categories.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderTree className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {query ? "Ничего не найдено" : "Категорий пока нет"}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {query
                ? "Попробуйте изменить поисковый запрос"
                : "Создайте первую категорию, чтобы она появилась здесь"}
            </p>
            {!query && (
              <Link
                href="/admin/categories/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Создать категорию
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat: any) => {
              const catId = cat.documentId || cat.id;
              const postsCount = counts[cat.slug] ?? 0;

              return (
                <div
                  key={catId}
                  className="group bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:border-purple-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                      {cat.icon ? (
                        <span className="text-lg">{cat.icon}</span>
                      ) : (
                        <Tag className="w-5 h-5 text-purple-600" />
                      )}
                    </div>
                    <Link
                      href={`/admin/categories/${catId}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-60 group-hover:opacity-100"
                      title="Редактировать"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                  </div>

                  <h3 className="font-semibold text-gray-900 line-clamp-1">
                    {cat.name || "Без названия"}
                  </h3>
                  <code className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded font-mono inline-block mt-1">
                    {cat.slug || catId}
                  </code>

                  {cat.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {cat.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {postsCount}{" "}
                      {postsCount === 1
                        ? "статья"
                        : postsCount >= 2 && postsCount <= 4
                          ? "статьи"
                          : "статей"}
                    </span>
                    <Link
                      href={`/blog?category=${cat.slug}`}
                      className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Открыть в блоге →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Футер */}
        {categories.length > 0 && (
          <p className="text-xs text-gray-400 text-center mt-4">
            Показано {categories.length} из {totalCount}{" "}
            {totalCount === 1
              ? "категории"
              : totalCount >= 2 && totalCount <= 4
                ? "категорий"
                : "категорий"}
          </p>
        )}
      </main>
    </div>
  );
}
