// src/app/(admin)/admin/ticket-categories/new/page.tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TicketCategoryForm } from "@/components/admin/TicketCategoryForm";

export const dynamic = "force-dynamic";

export default function NewTicketCategoryPage() {
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
        Новая категория
      </h1>

      <TicketCategoryForm />
    </div>
  );
}
