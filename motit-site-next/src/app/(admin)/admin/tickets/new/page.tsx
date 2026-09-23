// src/app/(admin)/admin/tickets/new/page.tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { listTicketCategories } from "@/lib/db/ticket-categories";
import { NewTicketForm } from "@/components/helpdesk/NewTicketForm";

export const dynamic = "force-dynamic";

export default async function AdminNewTicketPage() {
  const [categories, clients] = await Promise.all([
    listTicketCategories(),
    prisma.users.findMany({
      where: {
        users_role_lnk: { some: { roles: { name: "client" } } },
        blocked: false,
      },
      select: {
        uuid: true,
        username: true,
        full_name: true,
        email: true,
        phone: true,
        client_organizations: {
          select: {
            organization_uuid: true,
            is_primary: true,
          },
          orderBy: { is_primary: "desc" },
        },
      },
      orderBy: { full_name: "asc" },
    }),
  ]);

  return (
    <div className="p-8 max-w-3xl">
      <Link
        href="/admin/tickets"
        className="inline-flex items-center gap-1 text-sm text-(--text-muted) hover:text-(--accent)"
      >
        <ArrowLeft size={14} />
        К списку обращений
      </Link>

      <h1 className="text-2xl font-bold text-(--text-primary) mt-4">
        Новое обращение
      </h1>
      <p className="text-sm text-(--text-muted) mt-1">
        Выберите клиента и заполните данные
      </p>

      {clients.length === 0 ? (
        <div className="mt-8 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/15 text-yellow-400 text-sm">
          Нет ни одного активного клиента с ролью «client». Создайте
          пользователя и назначьте ему роль.
        </div>
      ) : (
        <NewTicketForm
          mode="admin"
          categories={categories.map((c) => ({
            uuid: c.uuid,
            name: c.name,
            icon: c.icon,
          }))}
          clients={clients.map((c) => ({
            uuid: c.uuid,
            name: c.full_name || c.username || "—",
            email: c.email ?? "",
            phone: c.phone ?? "",
            organizationUuid: c.client_organizations[0]?.organization_uuid ?? null,
          }))}
        />
      )}
    </div>
  );
}
