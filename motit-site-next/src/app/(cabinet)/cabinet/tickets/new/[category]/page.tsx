// src/app/(cabinet)/cabinet/tickets/new/[category]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTicketCategoryBySlug } from "@/lib/db/ticket-categories";
import { NewTicketForm } from "@/components/helpdesk/NewTicketForm";

export const dynamic = "force-dynamic";

export default async function NewTicketFormPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: categorySlug } = await params;

  const category = await getTicketCategoryBySlug(categorySlug);
  if (!category) notFound();

  const user = await getCurrentUser();
  if (!user) return null;

  const dbUser = await prisma.users.findUnique({
    where: { id: user.id },
    select: { full_name: true, email: true, phone: true },
  });

  const orgs = await prisma.client_organizations.findMany({
    where: { client_user_uuid: user.uuid },
    include: {
      organizations: {
        select: { uuid: true, name: true, inn: true, is_active: true },
      },
    },
    orderBy: [{ is_primary: "desc" }, { joined_at: "asc" }],
  });

  const organizations = orgs
    .filter((o) => o.organizations && o.organizations.is_active !== false)
    .map((o) => ({
      uuid: o.organizations!.uuid,
      name: o.organizations!.name,
      inn: o.organizations!.inn,
      isPrimary: !!o.is_primary,
    }));

  return (
    <div className="p-8 w-full max-w-2xl mx-auto">
      <Link
        href="/cabinet/tickets/new"
        className="inline-flex items-center gap-1 text-sm text-(--text-secondary) hover:text-(--accent) transition-colors"
      >
        <ArrowLeft size={14} />
        К выбору категории
      </Link>

      <div className="mt-4 flex items-center gap-3">
        {category.icon && <span className="text-2xl">{category.icon}</span>}
        <div>
          <h1 className="text-2xl font-bold text-(--text-primary)">
            {category.name}
          </h1>
          <p className="text-(--text-secondary) text-sm">
            Опишите проблему как можно точнее
          </p>
        </div>
      </div>

      <NewTicketForm
        defaultFullName={dbUser?.full_name ?? user.full_name ?? ""}
        defaultEmail={dbUser?.email ?? user.email ?? ""}
        defaultPhone={dbUser?.phone ?? user.phone ?? ""}
        organizations={organizations}
        categoryUuid={category.uuid}
      />
    </div>
  );
}
