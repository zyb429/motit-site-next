// src/app/(admin)/admin/organizations/page.tsx
import { prisma } from "@/lib/prisma";
import { OrganizationsTable } from "./OrganizationsTable";
import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import { CreateOrganizationButton } from "./CreateOrganizationButton";

export const dynamic = "force-dynamic";

async function getOrganizations() {
  const rows = await prisma.organizations.findMany({
    orderBy: { name: "asc" },
    take: 200,
    include: {
      _count: { select: { client_organizations: true, tickets: true } },
    },
  });

  return rows.map((o) => ({
    uuid: o.uuid,
    name: o.name,
    inn: o.inn ?? null,
    email: o.email ?? null,
    phone: o.phone ?? null,
    address: o.address ?? null,
    is_active: o.is_active ?? true,
    clientsCount: o._count.client_organizations,
    ticketsCount: o._count.tickets,
  }));
}

export default async function OrganizationsPage() {
  const organizations = await getOrganizations();

  return (
    <div className="min-h-screen bg-(--bg-primary)">
      <header className="bg-(--bg-card) border-b border-(--border) sticky top-0 z-10 h-20">
        <div className="container mx-auto px-6 h-full flex items-center max-w-6xl">
          <div className="flex items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="text-(--text-muted) hover:text-(--text-primary) transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="w-12 h-12 bg-(--accent-dim) rounded-lg flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6 text-(--accent)" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-(--text-primary)">
                  Организации
                </h1>
                <p className="text-sm text-(--text-secondary)">
                  Управление организациями
                </p>
              </div>
            </div>

            <CreateOrganizationButton />
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        <OrganizationsTable organizations={organizations} />
      </main>
    </div>
  );
}
