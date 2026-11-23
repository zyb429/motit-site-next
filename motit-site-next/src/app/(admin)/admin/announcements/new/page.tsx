// src/app/(admin)/admin/announcements/new/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { CreateAnnouncementForm } from "./CreateAnnouncementForm";

export default async function NewAnnouncementPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?from=/admin/announcements/new");
  }

  if (user.role !== "admin") {
    redirect("/admin");
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-(--bg-primary)">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-(--text-primary)">
          Создать объявление
        </h1>

        <div className="mt-6">
          <CreateAnnouncementForm />
        </div>
      </div>
    </div>
  );
}
