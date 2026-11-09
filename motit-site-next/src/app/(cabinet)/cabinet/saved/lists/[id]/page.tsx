// src/app/(cabinet)/cabinet/saved/lists/[id]/page.tsx
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Bookmark } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SavedPostActions } from "@/components/cabinet/SavedPostActions";

export const dynamic = "force-dynamic";

export default async function ListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?from=/cabinet/saved");

  const { id } = await params;
  const list = await prisma.postList.findFirst({
    where: { id: Number(id), userId: user.id },
    include: {
      items: {
        orderBy: { addedAt: "desc" },
        include: {
          post: { include: { featured_image: true, author: true } },
        },
      },
    },
  });
  if (!list) notFound();

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-4xl space-y-5 sm:space-y-8">
        <div>
          <Link
            href="/cabinet/saved"
            className="inline-flex items-center gap-1.5 text-sm text-(--text-secondary) hover:text-(--accent) transition-colors mb-4 sm:mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад к сохранённым
          </Link>
          
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-(--text-primary) tracking-tight line-clamp-2 min-w-0">
              {list.name}
            </h1>
            <div className="shrink-0 pt-1">
              <SavedPostActions isList listId={list.id} />
            </div>
          </div>
          <p className="text-xs sm:text-sm text-(--text-muted) mt-1 sm:mt-2">
            {list.items.length} {list.items.length === 1 ? "пост" : "постов"} в списке
          </p>
        </div>

        {list.items.length === 0 ? (
          <div className="text-center py-10 sm:py-12 border-2 border-dashed border-(--border) rounded-2xl">
            <Bookmark className="w-10 h-10 sm:w-12 sm:h-12 text-(--text-muted) mx-auto mb-3 opacity-20" />
            <p className="text-sm sm:text-base text-(--text-muted) font-medium">В этом списке пока нет постов</p>
            <p className="text-xs sm:text-sm text-(--text-muted) mt-1 px-4">Добавьте их через кнопку «Сохранить» на странице статьи</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 sm:gap-3">
            {list.items.map((item) => (
              <div
                key={item.id}
                className="group flex items-center gap-3 sm:gap-4 rounded-xl border border-(--border) bg-(--bg-card) p-2.5 sm:p-3 hover:border-(--accent)/50 hover:shadow-md transition-all duration-200"
              >
                <Link
                  href={`/blog/${item.post.slug ?? item.post.id}`}
                  className="flex flex-1 gap-3 sm:gap-4 min-w-0 items-center"
                >
                  {item.post.featured_image?.url ? (
                    <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden shrink-0 bg-(--bg-secondary)">
                      <Image
                        src={item.post.featured_image.url}
                        alt={item.post.title ?? ""}
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
                      {item.post.title ?? "Без названия"}
                    </div>
                    {item.post.excerpt && (
                      <p className="text-xs text-(--text-muted) line-clamp-1 mt-0.5 hidden sm:block">
                        {item.post.excerpt}
                      </p>
                    )}
                  </div>
                </Link>

                <div className="shrink-0 pl-1 sm:pl-2">
                  <SavedPostActions listId={list.id} postId={item.post.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}