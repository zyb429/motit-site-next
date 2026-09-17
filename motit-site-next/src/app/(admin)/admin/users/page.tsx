// src/app/(admin)/admin/users/page.tsx
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { UsersTable } from "./UsersTable";
import { getMediaItemUrl } from "@/lib/strapi";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";
const API_TOKEN = process.env.STRAPI_API_TOKEN || "";

async function getUsers() {
  const res = await fetch(
    `${STRAPI_URL}/api/users?populate[role]=*&populate[avatar]=*&sort[0]=createdAt:desc&pagination[pageSize]=100`,
    {
      headers: { Authorization: `Bearer ${API_TOKEN}` },
      cache: "no-store",
    },
  );
  if (!res.ok) return [];
  const data = await res.json();
  const users = Array.isArray(data) ? data : (data.data ?? []);

  // ✅ Преобразуем avatar.url в абсолютный
  return users.map((u: any) => ({
    ...u,
    avatar: u.avatar ? { ...u.avatar, url: getMediaItemUrl(u.avatar) } : null,
  }));
}

async function getRoles() {
  const res = await fetch(`${STRAPI_URL}/api/users-permissions/roles`, {
    headers: { Authorization: `Bearer ${API_TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.roles ?? [];
}

export default async function UsersPage() {
  const [users, roles] = await Promise.all([getUsers(), getRoles()]);

  return (
    <div className="min-h-screen bg-(--bg-primary)">
      <header className="bg-(--bg-card) border-b border-(--border) sticky top-0 z-10 h-20">
        <div className="h-full px-6 flex items-center">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="text-(--text-muted) hover:text-(--text-primary) transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-12 h-12 bg-(--accent-dim) rounded-lg flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-(--accent)" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-(--text-primary)">
                Пользователи
              </h1>
              <p className="text-sm text-(--text-secondary)">
                {users.length} пользователей
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        <UsersTable users={users} roles={roles} />
      </main>
    </div>
  );
}
