// src/app/(admin)/admin/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  PlusCircle,
  FileText,
  FolderTree,
  Settings,
  Home,
  PenSquare,
  Ticket,
  Globe,
  SlidersHorizontal,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getRecentActivity } from "@/lib/db/activity";

async function getCounts() {
  const [posts, categories] = await Promise.all([
    prisma.posts.count(),
    prisma.categories.count(),
  ]);
  return { posts, categories };
}

const TARGET_META: Record<
  string,
  { icon: typeof FileText; label: string; href: (a: any) => string }
> = {
  post: {
    icon: FileText,
    label: "пост",
    href: (a) => `/admin/posts/${a.target_id ?? ""}`,
  },
  ticket: {
    icon: Ticket,
    label: "заявку",
    href: (a) => `/admin/tickets/${a.ticket?.uuid ?? a.target_id ?? ""}`,
  },
  settings: {
    icon: SlidersHorizontal,
    label: "настройки",
    href: () => `/admin/settings`,
  },
  site: {
    icon: Globe,
    label: "страницу сайта",
    href: () => `/admin/pages`,
  },
  user: {
    icon: PenSquare,
    label: "пользователя",
    href: () => `/admin/users`,
  },
};

const ACTION_LABEL: Record<string, string> = {
  create: "создал(а)",
  update: "обновил(а)",
  delete: "удалил(а)",
  status_change: "сменил(а) статус",
  assign: "назначил(а)",
  comment: "оставил(а) комментарий",
  login: "вошёл(ла) в систему",
};

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?from=/admin");

  const [{ posts, categories }, recentActivity] = await Promise.all([
    getCounts(),
    getRecentActivity(user),
  ]);

  const announcements = await prisma.announcements.findMany({
    where: {
      is_active: true,
      OR: [
        { audience: "all" },
        ...(user.role ? [{ audience: user.role }] : []),
      ],
    },
    include: {
      created_by: {
        select: {
          username: true,
          full_name: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
    take: 5,
  });

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-(--bg-primary)">
      <header className="shrink-0 bg-(--bg-card) border-b border-(--border)">
        <div className="h-20 px-4 sm:px-6 max-w-6xl mx-auto w-full flex items-center">
          <div className="flex items-center justify-between gap-3 w-full min-w-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-(--accent-dim) rounded-lg flex items-center justify-center shrink-0">
                <PenSquare className="w-5 h-5 text-(--accent)" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold text-(--text-primary) truncate">
                  Админ панель
                </h1>
                <p className="text-xs sm:text-sm text-(--text-secondary) truncate">
                  Добро пожаловать, {user.full_name || user.username}!
                </p>
              </div>
            </div>

            <Link
              href="/"
              className="shrink-0 text-(--text-secondary) hover:text-(--text-primary) transition-colors flex items-center justify-center gap-2 px-3 py-2 rounded-lg hover:bg-(--accent-dim)"
            >
              <Home className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">На сайт</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-(--bg-card) rounded-xl p-6 border border-(--border)">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-(--text-secondary)">
                    Всего постов
                  </p>
                  <p className="text-3xl font-bold text-(--text-primary) mt-1">
                    {posts}
                  </p>
                </div>
                <div className="w-12 h-12 bg-(--accent-dim) rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-(--accent)" />
                </div>
              </div>
            </div>

            <div className="bg-(--bg-card) rounded-xl p-6 border border-(--border)">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-(--text-secondary)">
                    Категории
                  </p>
                  <p className="text-3xl font-bold text-(--text-primary) mt-1">
                    {categories}
                  </p>
                </div>
                <div className="w-12 h-12 bg-(--accent-dim) rounded-lg flex items-center justify-center">
                  <FolderTree className="w-6 h-6 text-(--accent)" />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-(--text-primary) mb-4">
              Быстрые действия
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  href: "/admin/posts/new",
                  icon: PlusCircle,
                  title: "Создать пост",
                  desc: "Написать новый пост",
                },
                {
                  href: "/admin/posts",
                  icon: FileText,
                  title: "Все посты",
                  desc: "Управление постами",
                },
                {
                  href: "/admin/categories",
                  icon: FolderTree,
                  title: "Категории",
                  desc: "Управление категориями",
                },
                {
                  href: "/admin/settings",
                  icon: Settings,
                  title: "Настройки",
                  desc: "Настройки сайта",
                },
              ].map(({ href, icon: Icon, title, desc }) => (
                <Link
                  key={href}
                  href={href}
                  className="group bg-(--bg-card) rounded-xl p-6 border border-(--border) hover:border-(--border-hover) transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-(--accent-dim) rounded-lg flex items-center justify-center group-hover:bg-(--accent)/20 transition-colors shrink-0">
                      <Icon className="w-6 h-6 text-(--accent)" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-(--text-primary) truncate">
                        {title}
                      </h3>
                      <p className="text-sm text-(--text-secondary) truncate">
                        {desc}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-(--bg-card) rounded-xl border border-(--border) p-6">
            <h2 className="text-lg font-semibold text-(--text-primary) mb-4">
              Последняя активность
            </h2>
            {recentActivity.length === 0 ? (
              <p className="text-center py-8 text-(--text-secondary) text-sm">
                Пока нет событий
              </p>
            ) : (
              <ul className="divide-y divide-(--border)">
                {recentActivity.map((a) => {
                  const meta = TARGET_META[a.target_type] ?? TARGET_META.site;
                  const Icon = meta.icon;
                  const actor =
                    a.actor?.full_name || a.actor?.username || "Система";

                  const activityMeta = (a.meta ?? {}) as Record<
                    string,
                    unknown
                  >;

                  const actorName =
                    typeof activityMeta.actorName === "string"
                      ? activityMeta.actorName
                      : null;

                  const assigneeName =
                    typeof activityMeta.assigneeName === "string"
                      ? activityMeta.assigneeName
                      : null;

                  const actionLabel = ACTION_LABEL[a.action] ?? a.action;
                  const subject =
                    a.target_type === "ticket"
                      ? (a.ticket?.title ?? "заявку")
                      : meta.label;

                  const activityText =
                    a.action === "assign"
                      ? assigneeName
                        ? `назначил(а) исполнителем ${assigneeName}`
                        : "снял(а) исполнителя"
                      : `${actionLabel} ${subject}`;

                  const date = new Date(a.created_at).toLocaleString("ru-RU", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  return (
                    <li key={a.uuid} className="py-3">
                      <Link
                        href={meta.href(a)}
                        className="flex items-center gap-3 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-(--accent-dim) flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-(--accent)" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-(--text-primary) truncate">
                            <span className="font-medium">{actor}</span>{" "}
                            <span className="text-(--text-secondary)">
                              {activityText}
                            </span>
                          </p>
                        </div>
                        <span className="text-xs text-(--text-muted) shrink-0">
                          {date}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="bg-(--bg-card) rounded-xl border border-(--border) p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-(--text-primary)">
                Оповещения
              </h2>

              {user.role === "admin" && (
                <Link
                  href="/admin/announcements/new"
                  className="text-sm underline"
                >
                  Создать объявление
                </Link>
              )}
            </div>

            {announcements.length === 0 ? (
              <p className="text-sm text-(--text-secondary)">
                Активных объявлений пока нет.
              </p>
            ) : (
              <ul className="space-y-3">
                {announcements.map((announcement) => (
                  <li
                    key={announcement.id}
                    className="rounded-lg border border-(--border) p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-medium text-(--text-primary)">
                        {announcement.title}
                      </h3>
                      <span className="text-xs text-(--text-muted)">
                        {new Date(announcement.created_at).toLocaleDateString(
                          "ru-RU",
                        )}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-(--text-secondary) whitespace-pre-line">
                      {announcement.message}
                    </p>

                    <p className="mt-2 text-xs text-(--text-muted)">
                      {announcement.created_by?.full_name ||
                        announcement.created_by?.username ||
                        "Система"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
