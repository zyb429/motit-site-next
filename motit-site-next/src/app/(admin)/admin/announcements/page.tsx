// src/app/(admin)/admin/announcements/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { PlusCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export default async function AnnouncementsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?from=/admin/announcements");
  }

  if (user.role !== "admin") {
    redirect("/admin");
  }

  const announcements = await prisma.announcements.findMany({
    orderBy: {
      created_at: "desc",
    },
    include: {
      created_by: {
        select: {
          username: true,
          full_name: true,
        },
      },
    },
    take: 50,
  });

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-(--bg-primary)">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-(--text-primary)">
            Оповещения
          </h1>

          <Link
            href="/admin/announcements/new"
            className="flex items-center gap-2 rounded-lg bg-(--accent) px-4 py-2 text-sm text-white"
          >
            <PlusCircle size={16} />
            Создать
          </Link>
        </div>

        <div className="mt-6 space-y-3">
          {announcements.length === 0 ? (
            <div className="rounded-xl border border-(--border) bg-(--bg-card) p-6 text-center">
              <p className="text-sm text-(--text-secondary)">
                Объявлений пока нет.
              </p>
            </div>
          ) : (
            announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="rounded-xl border border-(--border) bg-(--bg-card) p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="font-medium text-(--text-primary)">
                      {announcement.title}
                    </h2>

                    <p className="mt-1 text-sm text-(--text-secondary) whitespace-pre-line">
                      {announcement.message}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-(--accent-dim) px-3 py-1 text-xs text-(--accent)">
                    {announcement.audience === "all"
                      ? "Все"
                      : announcement.audience}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-(--text-muted)">
                  <span>
                    {announcement.created_by?.full_name ||
                      announcement.created_by?.username ||
                      "Система"}
                  </span>

                  <span>
                    {new Date(announcement.created_at).toLocaleString("ru-RU")}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
