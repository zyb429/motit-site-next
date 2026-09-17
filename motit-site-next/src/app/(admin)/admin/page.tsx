// src/app/(admin)/admin/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import {
  PlusCircle,
  FileText,
  FolderTree,
  Settings,
  Home,
  PenSquare,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

async function getCounts() {
  const headers = {
    Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
  };

  const [postsRes, catsRes] = await Promise.all([
    fetch(`${STRAPI_URL}/api/posts?pagination[pageSize]=1`, {
      headers,
      cache: "no-store",
    }),
    fetch(`${STRAPI_URL}/api/categories?pagination[pageSize]=1`, {
      headers,
      cache: "no-store",
    }),
  ]);

  const posts = postsRes.ok ? await postsRes.json() : null;
  const cats = catsRes.ok ? await catsRes.json() : null;

  return {
    posts: posts?.meta?.pagination?.total ?? 0,
    categories: cats?.meta?.pagination?.total ?? 0,
  };
}

async function getRecentPosts() {
  const cookieStore = await cookies();
  const token = cookieStore.get("strapi_jwt")?.value;
  if (!token) return [];

  const res = await fetch(
    `${STRAPI_URL}/api/posts?sort[0]=updatedAt:desc&pagination[pageSize]=5&populate[0]=author&populate[1]=categories`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?from=/admin");

  const [{ posts, categories }, recentPosts] = await Promise.all([
    getCounts(),
    getRecentPosts(),
  ]);

  return (
    <div className="min-h-screen bg-(--bg-primary)">
      {/* Хедер */}
      <header className="bg-(--bg-card) border-b border-(--border) sticky top-0 z-10 h-20">
        <div className="h-full px-6 flex items-center">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-(--accent-dim) rounded-lg flex items-center justify-center shrink-0">
                <PenSquare className="w-5 h-5 text-(--accent)" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-(--text-primary)">
                  Админ панель
                </h1>
                <p className="text-sm text-(--text-secondary)">
                  Добро пожаловать, {user.full_name || user.username}!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-(--text-secondary) hover:text-(--text-primary) transition-colors flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-(--accent-dim)"
              >
                <Home className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">На сайт</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Контент */}
      <main className="px-6 py-8">
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
                  <div className="w-12 h-12 bg-(--accent-dim) rounded-lg flex items-center justify-center group-hover:bg-(--accent)/20 transition-colors">
                    <Icon className="w-6 h-6 text-(--accent)" />
                  </div>
                  <div>
                    <h3 className="font-medium text-(--text-primary)">
                      {title}
                    </h3>
                    <p className="text-sm text-(--text-secondary)">{desc}</p>
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
          {recentPosts.length === 0 ? (
            <p className="text-center py-8 text-(--text-secondary) text-sm">
              Пока нет постов
            </p>
          ) : (
            <ul className="divide-y divide-(--border)">
              {recentPosts.map((post: any) => {
                const author =
                  post.author?.full_name || post.author?.username || "—";
                const date = new Date(post.updatedAt).toLocaleDateString(
                  "ru-RU",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  },
                );
                return (
                  <li key={post.documentId || post.id} className="py-3">
                    <Link
                      href={`/admin/posts/${post.documentId || post.id}`}
                      className="flex items-center justify-between gap-4 group"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-(--text-primary) group-hover:text-(--text-accent) truncate">
                          {post.title || "Без названия"}
                        </p>
                        <p className="text-xs text-(--text-muted) mt-0.5">
                          {author}
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
      </main>
    </div>
  );
}
