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
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

async function getCounts() {
  const strapiUrl = process.env.STRAPI_URL || "http://localhost:1337";
  const headers = {
    Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
  };

  const [postsRes, catsRes] = await Promise.all([
    fetch(`${strapiUrl}/api/posts?pagination[pageSize]=1`, {
      headers,
      cache: "no-store",
    }),
    fetch(`${strapiUrl}/api/categories?pagination[pageSize]=1`, {
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

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?from=/admin");

  const { posts, categories } = await getCounts();

  return (
    <div className="min-h-screen bg-(--bg-primary)">
      <header className="bg-(--bg-card) border-b border-(--border) sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-(--accent-dim) rounded-lg flex items-center justify-center">
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
          <div className="text-center py-8 text-(--text-secondary)">
            <p className="text-sm">
              Здесь будет отображаться последняя активность
            </p>
            <p className="text-xs mt-1">Скоро появится</p>
          </div>
        </div>
      </main>
    </div>
  );
}
