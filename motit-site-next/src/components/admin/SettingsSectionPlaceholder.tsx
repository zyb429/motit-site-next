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
    <div className="min-h-screen bg-(--bg-primary)">
      <header className="bg-(--bg-card) border-b border-(--border) sticky top-0 z-10 h-20">
        <div className="container mx-auto px-6 h-full flex items-center max-w-6xl">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/settings"
              className="text-(--text-muted) hover:text-(--text-primary) transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-12 h-12 bg-(--accent-dim) rounded-lg flex items-center justify-center shrink-0">
              <Icon className="w-6 h-6 text-(--accent)" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-(--text-primary)">
                {title}
              </h1>
              <p className="text-sm text-(--text-secondary)">{subtitle}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="bg-(--bg-card) rounded-xl border border-dashed border-(--border) p-12 text-center">
          <div className="w-16 h-16 bg-(--bg-secondary) rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon className="w-8 h-8 text-(--text-muted)" />
          </div>
          <h3 className="text-lg font-semibold text-(--text-primary) mb-1">
            Раздел в разработке
          </h3>
          <p className="text-sm text-(--text-secondary)">
            {hint ?? "Скоро здесь появятся настройки"}
          </p>
        </div>
      </main>
    </div>
  );
}
