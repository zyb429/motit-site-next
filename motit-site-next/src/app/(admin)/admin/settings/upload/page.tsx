// src/app/(admin)/admin/settings/upload/page.tsx
import Link from "next/link";
import { ArrowLeft, Upload } from "lucide-react";
import { getAllowedMime, ALL_MIME_OPTIONS } from "@/lib/settings";
import { UploadSettingsForm } from "@/components/admin/UploadSettingsForm";

export const dynamic = "force-dynamic";

export default async function UploadSettingsPage() {
  const allowed = await getAllowedMime();

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-3xl mx-auto w-full">
        {/* Хлебная крошка / назад */}
        <Link
          href="/admin/settings"
          className="inline-flex items-center gap-1 text-sm text-(--text-muted) hover:text-(--accent) transition-colors"
        >
          <ArrowLeft size={14} />
          К настройкам
        </Link>

        {/* Хедер страницы */}
        <div className="flex items-center gap-3 mt-4 mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-(--accent-dim) rounded-lg flex items-center justify-center shrink-0">
            <Upload size={20} className="text-(--accent)" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-(--text-primary) truncate">
              Загрузка файлов
            </h1>
            <p className="text-xs sm:text-sm text-(--text-muted) truncate">
              Какие типы файлов разрешены в заявках и комментариях
            </p>
          </div>
        </div>

        {/* Карточка с формой */}
        <div className="bg-(--bg-card) rounded-xl border border-(--border) p-4 sm:p-6">
          <UploadSettingsForm
            allOptions={ALL_MIME_OPTIONS}
            initialAllowed={allowed}
          />
        </div>
      </div>
    </div>
  );
}
