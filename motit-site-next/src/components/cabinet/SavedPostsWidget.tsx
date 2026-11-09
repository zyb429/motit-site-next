// src/components/cabinet/SavedPostsWidget.tsx
import Link from "next/link";
import Image from "next/image";
import { Bookmark, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { SavedPostActions } from "./SavedPostActions"; // импортируем меню

export async function SavedPostsWidget() {
  const user = await getCurrentUser();
  if (!user) return null;

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: {
      post: { include: { featured_image: true } },
    },
  });

  if (favorites.length === 0) return null;

  return (
    <div className="mt-8 max-w-3xl">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-(--text-muted) uppercase tracking-wider flex items-center gap-2">
          <Bookmark size={16} className="text-(--accent)" />
          Недавно сохранённое
        </h2>
        <Link
          href="/cabinet/saved"
          className="text-xs text-(--accent) hover:text-(--accent-hover) transition-colors flex items-center gap-1 group whitespace-nowrap"
        >
          Все сохранённые
          <ArrowRight
            size={12}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {favorites.map((f) => (
          <div
            key={f.id}
            className="group flex items-center justify-between gap-3 rounded-xl border border-(--border) bg-(--bg-card) p-3 hover:border-(--accent)/50 hover:shadow-md transition-all duration-200"
          >
            <Link
              href={`/blog/${f.post.slug ?? f.post.id}`}
              className="flex items-center gap-3 flex-1 min-w-0"
            >
              {f.post.featured_image?.url ? (
                <div className="relative w-16 h-16 shrink-0 overflow-hidden rounded-lg bg-(--bg-secondary)">
                  <Image
                    src={f.post.featured_image.url}
                    alt={f.post.title ?? ""}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="64px"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 shrink-0 rounded-lg bg-(--bg-secondary) flex items-center justify-center text-(--text-muted)">
                  <Bookmark size={20} className="opacity-40" />
                </div>
              )}
              <div className="min-w-0 flex flex-col justify-center">
                <div className="text-sm font-medium text-(--text-primary) group-hover:text-(--accent) line-clamp-2 transition-colors">
                  {f.post.title ?? "Без названия"}
                </div>
              </div>
            </Link>

            {/* Кнопка управления (меню) */}
            <div className="shrink-0">
              <SavedPostActions postId={f.post.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}