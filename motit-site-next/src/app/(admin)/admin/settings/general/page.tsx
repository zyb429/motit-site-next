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
    <div className="min-h-screen bg-(--bg-primary)">
      <header className="bg-(--bg-card) border-b border-(--border) sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 max-w-3xl">
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

      <main className="container mx-auto px-6 py-8 max-w-3xl">
        <GeneralSettingsForm initial={settings} />
      </main>
    </div>
  );
}
