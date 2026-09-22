"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { OrganizationModal } from "@/components/admin/OrganizationModal";

export function CreateOrganizationButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [creating, setCreating] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setCreating(true)}
        disabled={isPending}
        className="px-6 py-2 bg-(--accent) text-(--bg-primary) rounded-lg hover:bg-(--accent-hover) flex items-center gap-2 shadow-sm hover:shadow transition-all font-medium disabled:opacity-50"
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Создать организацию</span>
        <span className="sm:hidden">Создать</span>
      </button>

      {creating && (
        <OrganizationModal
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            startTransition(() => router.refresh());
          }}
        />
      )}
    </>
  );
}
