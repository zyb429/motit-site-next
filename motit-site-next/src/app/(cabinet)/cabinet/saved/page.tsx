// src/app/(cabinet)/cabinet/saved/page.tsx
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Bookmark, List, Search, X, FolderOpen } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateListButton } from "@/components/cabinet/CreateListButton";
import { SavedPostActions } from "@/components/cabinet/SavedPostActions";

export const dynamic = "force-dynamic";

export default async function SavedPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?from=/cabinet/saved");

  const { q } = await searchParams;
  const query = (q || "").trim().toLowerCase();

  const [favorites, lists] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        post: { include: { featured_image: true, author: true } },
      },
    }),
    prisma.postList.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { items: true } } },
    }),
  ]);

  const filteredFavorites = query
    ? favorites.filter((f) => {
        const title = (f.post.title || "").toLowerCase();
        const excerpt = (f.post.excerpt || "").toLowerCase();
        return title.includes(query) || excerpt.includes(query);
      })
    : favorites;

  const filteredLists = query
    ? lists.filter((l) => (l.name || "").toLowerCase().includes(query))
    : lists;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-4xl space-y-6 sm:space-y-10">
        {/* Заголовок */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-(--text-primary) tracking-tight">
            Мои сохранённые
          </h1>
          <p className="text-xs sm:text-sm text-(--text-muted) mt-1 sm:mt-2">
            Управляйте избранным и списками для чтения
          </p>
        </div>

        {/* Поиск */}
        <div className="relative w-full max-w-md">
          <form method="GET" className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text-muted)" />
            <input
              type="text"
              name="q"
              defaultValue={q || ""}
              placeholder="Поиск по названию..."
              className="w-full pl-9 pr-9 py-2 sm:py-2.5 bg-(--bg-card) border border-(--border) rounded-xl text-(--text-primary) focus:border-(--accent) focus:ring-4 focus:ring-(--accent-dim) outline-none transition-all text-sm shadow-sm"
            />
            {q && (
              <Link
                href="/cabinet/saved"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--text-muted) hover:text-(--text-primary) transition-colors p-1 rounded-full hover:bg-(--bg-secondary)"
                title="Очистить поиск"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
            )}
          </form>
        </div>

        {/* Мои списки */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-bold text-(--text-primary) flex items-center gap-2">
              <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 text-(--accent)" />
              Мои списки ({filteredLists.length})
            </h2>
            {!query && <CreateListButton />}
          </div>

          {filteredLists.length === 0 ? (
            <p className="text-sm text-(--text-muted)">
              {query ? "Списки не найдены." : "Пользовательских списков пока нет."}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filteredLists.map((l) => (
                <Link
                  key={l.id}
                  href={`/cabinet/saved/lists/${l.id}`}
                  className="group flex items-center gap-3 rounded-xl border border-(--border) bg-(--bg-card) p-4 hover:border-(--accent)/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                >
                  {/* Иконка списка */}
                  <div className="w-9 h-9 rounded-lg bg-(--accent-dim) flex items-center justify-center shrink-0">
                    <List className="w-5 h-5 text-(--accent)" />
                  </div>

                  {/* Название списка */}
                  <div className="text-sm sm:text-base font-semibold text-(--text-primary) group-hover:text-(--accent) truncate flex-1 min-w-0 transition-colors">
                    {l.name}
                  </div>

                  {/* Количество постов */}
                  <div className="text-xs text-(--text-muted) shrink-0 whitespace-nowrap">
                    {l._count.items} {l._count.items === 1 ? "пост" : "постов"}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Избранное */}
        <section>
          <h2 className="text-base sm:text-lg font-bold text-(--text-primary) flex items-center gap-2 mb-3 sm:mb-4">
            <Bookmark className="w-4 h-4 sm:w-5 sm:h-5 text-(--accent)" />
            Избранное ({filteredFavorites.length})
          </h2>

          {filteredFavorites.length === 0 ? (
            <p className="text-sm text-(--text-muted)">
              {query ? "Ничего не найдено по вашему запросу." : "Пока ничего не сохранено."}
            </p>
          ) : (
            <div className="flex flex-col gap-2.5 sm:gap-3">
              {filteredFavorites.map((f) => (
                <div
                  key={f.id}
                  className="group flex items-center gap-3 sm:gap-4 rounded-xl border border-(--border) bg-(--bg-card) p-2.5 sm:p-3 hover:border-(--accent)/50 hover:shadow-md transition-all duration-200"
                >
                  <Link
                    href={`/blog/${f.post.slug ?? f.post.id}`}
                    className="flex flex-1 gap-3 sm:gap-4 min-w-0 items-center"
                  >
                    {f.post.featured_image?.url ? (
                      <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden shrink-0 bg-(--bg-secondary)">
                        <Image
                          src={f.post.featured_image.url}
                          alt={f.post.title ?? ""}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 48px, 64px"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-(--bg-secondary) flex items-center justify-center shrink-0">
                        <Bookmark className="w-4 h-4 sm:w-6 sm:h-6 text-(--text-muted) opacity-40" />
                      </div>
                    )}
                    <div className="min-w-0 flex flex-col justify-center">
                      <div className="text-sm font-semibold text-(--text-primary) group-hover:text-(--accent) line-clamp-2 transition-colors">
                        {f.post.title ?? "Без названия"}
                      </div>
                      {f.post.excerpt && (
                        <p className="text-xs text-(--text-muted) line-clamp-1 mt-0.5 hidden sm:block">
                          {f.post.excerpt}
                        </p>
                      )}
                    </div>
                  </Link>

                  <div className="shrink-0 pl-1 sm:pl-2">
                    <SavedPostActions postId={f.post.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}