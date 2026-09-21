// src/app/(admin)/admin/ticket-categories/new/page.tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TicketCategoryForm } from "@/components/admin/TicketCategoryForm";

export const dynamic = "force-dynamic";

export default function NewTicketCategoryPage() {
  return (
    <div className="p-8 max-w-2xl">
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
