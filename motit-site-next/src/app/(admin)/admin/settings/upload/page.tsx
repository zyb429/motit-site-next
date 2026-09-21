// src/app/(admin)/admin/settings/upload/page.tsx
import { Upload } from "lucide-react";
import { getAllowedMime, ALL_MIME_OPTIONS } from "@/lib/settings";
import { UploadSettingsForm } from "@/components/admin/UploadSettingsForm";

export const dynamic = "force-dynamic";

export default async function UploadSettingsPage() {
  const allowed = await getAllowedMime();

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Upload size={20} className="text-(--accent)" />
        <div>
          <h1 className="text-2xl font-bold text-(--text-primary)">
            Загрузка файлов
          </h1>
          <p className="text-sm text-(--text-muted) mt-1">
            Какие типы файлов разрешены в заявках и комментариях
          </p>
        </div>
      </div>

      <UploadSettingsForm
        allOptions={ALL_MIME_OPTIONS}
        initialAllowed={allowed}
      />
    </div>
  );
}
