// src/app/(admin)/admin/categories/page.tsx
import Link from "next/link";
import {
  Plus,
  Edit,
  FolderTree,
  Search,
  Tag,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

async function getCategories() {
  const rows = await prisma.categories.findMany({
    orderBy: { name: "asc" },
  });
  return rows.map((c) => ({
    id: c.id,
    documentId: c.document_id ?? null,
    name: c.name ?? "",
    slug: c.slug ?? "",
    description: c.description ?? null,
    icon: c.icon ?? null,
  }));
}

async function getPostsCountByCategory(): Promise<Record<string, number>> {
  const links = await prisma.posts_categories_links.findMany({
    select: { category_id: true },
  });
  const countsByCategoryId: Record<number, number> = {};
  for (const l of links) {
    if (l.category_id == null) continue;
    countsByCategoryId[l.category_id] =
      (countsByCategoryId[l.category_id] ?? 0) + 1;
  }

  const cats = await prisma.categories.findMany({
    select: { id: true, slug: true },
  });
  const counts: Record<string, number> = {};
  for (const c of cats) {
    if (c.slug && countsByCategoryId[c.id] != null) {
      counts[c.slug] = countsByCategoryId[c.id];
    }
  }
  return counts;
}

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = (await searchParams) || {};
  const query = (params.q || "").toLowerCase().trim();

  const [allCategories, counts] = await Promise.all([
    getCategories(),
    getPostsCountByCategory(),
  ]);

  let categories = allCategories;
  if (query) {
    categories = categories.filter((c) => {
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
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-(--bg-primary)">
      {/* ==================== ХЕДЕР (как в постах) ==================== */}
      <header className="shrink-0 bg-(--bg-card) border-b border-(--border)">
        <div className="min-h-14 sm:h-20 flex items-center px-3 sm:px-6 max-w-6xl mx-auto w-full py-2 sm:py-0">
          <div className="flex items-center justify-between gap-2 sm:gap-3 w-full min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Link
                href="/admin"
                className="text-(--text-muted) hover:text-(--text-primary) transition-colors shrink-0 p-1"
                aria-label="Назад"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="w-9 h-9 sm:w-12 sm:h-12 bg-(--accent-dim) rounded-lg flex items-center justify-center shrink-0">
                <FolderTree className="w-4 h-4 sm:w-6 sm:h-6 text-(--accent)" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-xl font-bold text-(--text-primary) truncate">
                  Категории
                </h1>
                <p className="text-[10px] sm:text-sm text-(--text-secondary) truncate">
                  Управление категориями блога
                </p>
              </div>
            </div>

            <Link
              href="/admin/categories/new"
              className="px-3 sm:px-6 py-2 bg-(--accent) text-(--bg-primary) rounded-lg hover:bg-(--accent-hover) flex items-center gap-1.5 sm:gap-2 shadow-sm hover:shadow transition-all font-medium text-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Создать</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-6 py-4 sm:py-8">
        <div className="max-w-6xl mx-auto w-full">
          {/* Статистика: 3 карточки в ряд на мобилке (как в постах) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-(--bg-card) rounded-xl border border-(--border) p-2.5 sm:p-4 shadow-sm">
              <div className="flex items-center justify-between gap-1">
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-sm text-(--text-secondary) truncate">
                    Всего
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-(--text-primary) mt-0.5">
                    {totalCount}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-(--accent-dim) rounded-lg flex items-center justify-center shrink-0">
                  <FolderTree className="w-4 h-4 sm:w-5 sm:h-5 text-(--accent)" />
                </div>
              </div>
            </div>

            <div className="bg-(--bg-card) rounded-xl border border-(--border) p-2.5 sm:p-4 shadow-sm">
              <div className="flex items-center justify-between gap-1">
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-sm text-(--text-secondary) truncate">
                    Найдено
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-(--accent) mt-0.5">
                    {categories.length}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-(--accent-dim) rounded-lg flex items-center justify-center shrink-0">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-(--accent)" />
                </div>
              </div>
            </div>

            <div className="bg-(--bg-card) rounded-xl border border-(--border) p-2.5 sm:p-4 shadow-sm">
              <div className="flex items-center justify-between gap-1">
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-sm text-(--text-secondary) truncate">
                    Со статьями
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-(--accent) mt-0.5">
                    {allCategories.filter((c) => (counts[c.slug] ?? 0) > 0).length}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-(--accent-dim) rounded-lg flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-(--accent)" />
                </div>
              </div>
            </div>
          </div>

          {/* Поиск (как фильтры в постах) */}
          <div className="bg-(--bg-card) rounded-xl border border-(--border) p-3 sm:p-4 shadow-sm mb-4 sm:mb-6">
            <form
              className="relative w-full"
              action="/admin/categories"
              method="GET"
            >
              <Search className="w-4 h-4 text-(--text-muted) absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                name="q"
                defaultValue={params.q || ""}
                placeholder="Поиск по названию, slug или описанию..."
                className="w-full pl-10 pr-4 py-2 bg-(--bg-secondary) border border-(--border) rounded-lg text-(--text-primary) focus:border-(--accent) focus:outline-none transition-colors text-sm"
              />
            </form>
          </div>

          {categories.length === 0 ? (
            <div className="bg-(--bg-card) rounded-xl border border-dashed border-(--border) p-8 sm:p-12 text-center">
              <div className="w-16 h-16 bg-(--bg-secondary) rounded-full flex items-center justify-center mx-auto mb-4">
                <FolderTree className="w-8 h-8 text-(--text-muted)" />
              </div>
              <h3 className="text-lg font-semibold text-(--text-primary) mb-1">
                {query ? "Ничего не найдено" : "Категорий пока нет"}
              </h3>
              <p className="text-sm text-(--text-secondary) mb-4">
                {query
                  ? "Попробуйте изменить поисковый запрос"
                  : "Создайте первую категорию, чтобы она появилась здесь"}
              </p>
              {!query && (
                <Link
                  href="/admin/categories/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-(--accent) text-(--bg-primary) rounded-lg hover:bg-(--accent-hover) transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Создать категорию
                </Link>
              )}
            </div>
          ) : (
            // Сетка карточек (адаптивная, как список постов на мобилке)
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
              {categories.map((cat) => {
                const catId = cat.documentId || String(cat.id);
                const postsCount = counts[cat.slug] ?? 0;

                return (
                  <div
                    key={catId}
                    className="group flex flex-col h-full bg-(--bg-card) rounded-xl border border-(--border) p-3 sm:p-5 hover:border-(--border-hover) hover:shadow-md transition-all"
                  >
                    {/* Верхняя часть (иконка и кнопка) */}
                    <div className="flex items-start justify-between gap-2.5 mb-2 sm:mb-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-(--accent-dim) rounded-lg flex items-center justify-center shrink-0">
                        {cat.icon ? (
                          <span className="text-base sm:text-lg">{cat.icon}</span>
                        ) : (
                          <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-(--accent)" />
                        )}
                      </div>
                      <Link
                        href={`/admin/categories/${catId}`}
                        className="p-1.5 sm:p-2 text-(--accent) hover:bg-(--accent-dim) rounded-lg transition-colors opacity-60 group-hover:opacity-100"
                        title="Редактировать"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </div>

                    {/* Контентная часть (заголовок, слаг, описание) — flex-1 прижимает футер вниз */}
                    <div className="flex-1">
                      <h3 className="text-sm sm:text-base font-semibold text-(--text-primary) line-clamp-1">
                        {cat.name || "Без названия"}
                      </h3>
                      
                      <code className="text-[11px] sm:text-xs text-(--text-muted) bg-(--bg-secondary) px-1.5 py-0.5 rounded font-mono inline-block mt-1 self-start max-w-full truncate">
                        {cat.slug || catId}
                      </code>

                      {cat.description && (
                        <p className="text-xs sm:text-sm text-(--text-secondary) mt-2 line-clamp-2 min-h-8 sm:min-h-10">
                          {cat.description}
                        </p>
                      )}
                    </div>

                    {/* Футер (дивайдер) — всегда внизу */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-(--border)">
                      <span className="text-[11px] sm:text-xs text-(--text-muted) flex items-center gap-1">
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
                        className="text-[11px] sm:text-xs text-(--accent) hover:text-(--accent-hover) transition-colors"
                      >
                        Открыть в блоге →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {categories.length > 0 && (
            <p className="text-[11px] sm:text-xs text-(--text-muted) text-center mt-4">
              Показано {categories.length} из {totalCount}{" "}
              {totalCount === 1
                ? "категории"
                : totalCount >= 2 && totalCount <= 4
                  ? "категорий"
                  : "категорий"}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}