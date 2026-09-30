// src/components/admin/SettingsSectionPlaceholder.tsx
import Link from "next/link";
import { ArrowLeft, type LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  hint?: string;
}

export function SettingsSectionPlaceholder({
  icon: Icon,
  title,
  subtitle,
  hint,
}: Props) {
  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-(--bg-primary)">
      {/* Хедер — фиксированный */}
      <header className="shrink-0 bg-(--bg-card) border-b border-(--border)">
        <div className="h-20 flex items-center gap-3 px-4 sm:px-6 max-w-6xl mx-auto w-full">
          <Link
            href="/admin/settings"
            className="text-(--text-muted) hover:text-(--text-primary) transition-colors shrink-0"
            aria-label="Назад"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-(--accent-dim) rounded-lg flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-(--accent)" />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-xl font-bold text-(--text-primary) truncate">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-(--text-secondary) truncate">
              {subtitle}
            </p>
          </div>
        </div>
      </header>

      {/* Контент — скроллится */}
      <main className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto w-full">
          <div className="bg-(--bg-card) rounded-xl border border-dashed border-(--border) p-6 sm:p-12 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-(--bg-secondary) rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-(--text-muted)" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-(--text-primary) mb-1">
              Раздел в разработке
            </h3>
            <p className="text-sm text-(--text-secondary)">
              {hint ?? "Скоро здесь появятся настройки"}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
