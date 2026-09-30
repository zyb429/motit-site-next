// src/app/(admin)/admin/settings/general/page.tsx
import Link from "next/link";
import { ArrowLeft, Globe } from "lucide-react";
import { GeneralSettingsForm } from "./GeneralSettingsForm";
import { getAllSettingsPrisma } from "@/lib/db/settings";

async function getSettings(): Promise<Record<string, string>> {
  return getAllSettingsPrisma();
}

export default async function GeneralSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-(--bg-primary)">
      <header className="shrink-0 bg-(--bg-card) border-b border-(--border)">
        <div className="px-4 sm:px-6 py-4 max-w-3xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/settings"
              className="text-(--text-muted) hover:text-(--text-primary) transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-12 h-12 bg-(--accent-dim) rounded-lg flex items-center justify-center">
              <Globe className="w-6 h-6 text-(--accent)" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-(--text-primary)">
                Основные
              </h1>
              <p className="text-sm text-(--text-secondary)">
                Название, описание, язык
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-3xl mx-auto w-full">
          <GeneralSettingsForm initial={settings} />
        </div>
      </main>
    </div>
  );
}
