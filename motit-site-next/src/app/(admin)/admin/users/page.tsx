// src/app/(admin)/admin/users/page.tsx
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { UsersTable } from "./UsersTable";

async function getUsers() {
  const rows = await prisma.users.findMany({
    orderBy: { created_at: "desc" },
    take: 100,
    include: {
      users_role_lnk: { include: { roles: true } },
      avatar: true,
    },
  });

  return rows.map((u) => {
    const role = u.users_role_lnk?.[0]?.roles ?? null;
    return {
      id: u.id,
      documentId: u.document_id ?? null,
      username: u.username ?? "",
      email: u.email ?? "",
      full_name: u.full_name ?? null,
      phone: u.phone ?? null,
      blocked: u.blocked ?? false,
      confirmed: u.confirmed ?? false,
      createdAt: u.created_at?.toISOString() ?? new Date().toISOString(),
      avatar: u.avatar
        ? {
            id: u.avatar.id,
            url: u.avatar.url ?? null,
            name: u.avatar.name ?? null,
          }
        : u.avatar_url
          ? { id: 0, url: u.avatar_url, name: null }
          : null,
      role: role
        ? { id: role.id, name: role.name ?? "", type: role.type ?? "" }
        : null,
    };
  });
}

async function getRoles() {
  const rows = await prisma.roles.findMany({ orderBy: { name: "asc" } });
  return rows.map((r) => ({
    id: r.id,
    name: r.name ?? "",
    type: r.type ?? "",
    description: r.description ?? null,
  }));
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
