// src/app/(admin)/admin/users/page.tsx
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { UsersTable } from "./UsersTable";
import { CreateUserButton } from "./CreateUserButton";

async function getUsers() {
  const rows = await prisma.users.findMany({
    orderBy: { created_at: "desc" },
    take: 100,
    include: {
      users_role_lnk: { include: { roles: true } },
      avatar: true,
      client_organizations: {
        include: { organizations: true },
      },
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
      organizations:
        u.client_organizations?.map((co) => ({
          uuid: co.organizations.uuid,
          name: co.organizations.name,
          inn: co.organizations.inn ?? null,
          role_in_company: co.role_in_company ?? "member",
          is_primary: co.is_primary ?? false,
          is_active: co.organizations.is_active ?? true,
        })) ?? [],
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

async function getAllOrganizations() {
  const rows = await prisma.organizations.findMany({
    where: { is_active: true },
    orderBy: { name: "asc" },
    take: 500,
  });
  return rows.map((o) => ({
    uuid: o.uuid,
    name: o.name,
    inn: o.inn ?? null,
  }));
}

export default async function UsersPage() {
  const [users, roles, allOrganizations] = await Promise.all([
    getUsers(),
    getRoles(),
    getAllOrganizations(),
  ]);

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-(--bg-primary)">
      <header className="shrink-0 bg-(--bg-card) border-b border-(--border)">
        <div className="h-20 px-4 sm:px-6 max-w-6xl mx-auto w-full flex items-center">
          <div className="flex items-center justify-between gap-3 w-full min-w-0">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href="/admin"
                className="text-(--text-muted) hover:text-(--text-primary) transition-colors shrink-0"
                aria-label="Назад"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-(--accent-dim) rounded-lg flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-(--accent)" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold text-(--text-primary) truncate">
                  Пользователи
                </h1>
                <p className="text-xs sm:text-sm text-(--text-secondary) truncate">
                  {users.length} пользователей
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <CreateUserButton roles={roles} />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto w-full">
          <UsersTable
            users={users}
            roles={roles}
            allOrganizations={allOrganizations}
          />
        </div>
      </main>
    </div>
  );
}
