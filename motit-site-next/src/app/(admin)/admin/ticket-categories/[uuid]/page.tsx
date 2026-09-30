// src/app/(admin)/admin/ticket-categories/[uuid]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { TicketCategoryForm } from "@/components/admin/TicketCategoryForm";

export const dynamic = "force-dynamic";

export default async function EditTicketCategoryPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;

  const category = await prisma.ticket_categories.findUnique({
    where: { uuid },
  });
  if (!category) notFound();

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <Link
        href="/admin/ticket-categories"
        className="inline-flex items-center gap-1 text-sm text-(--text-muted) hover:text-(--accent)"
      >
        <ArrowLeft size={14} />
        К списку
      </Link>

      <h1 className="text-2xl font-bold text-(--text-primary) mt-4">
        Редактирование категории
      </h1>

      <TicketCategoryForm
        initial={{
          uuid: category.uuid,
          name: category.name,
          slug: category.slug,
          description: category.description ?? "",
          icon: category.icon ?? "",
          sortOrder: category.sort_order,
          isActive: category.is_active,
        }}
      />
    </div>
  );
}
