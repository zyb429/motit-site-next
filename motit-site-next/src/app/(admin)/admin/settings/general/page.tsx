import Link from "next/link";
import { ArrowLeft, Globe } from "lucide-react";
import { getSiteSettings } from "@/lib/db/site-settings";
import { SettingsForm } from "@/components/admin/settings/SettingsForm";
import { updateGeneralSettings } from "../actions";

export default async function GeneralSettingsPage() {
  const s = await getSiteSettings();

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-(--bg-primary)">
      <header className="shrink-0 bg-(--bg-card) border-b border-(--border)">
        <div className="px-4 sm:px-6 py-4 max-w-3xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/settings"
              className="text-(--text-muted) hover:text-(--text-primary)"
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
          <SettingsForm
            settings={s}
            action={updateGeneralSettings}
            fields={[
              { name: "siteName", label: "Название сайта" },
              { name: "description", label: "Описание", textarea: true },
              { name: "language", label: "Язык (ru/en)" },
              { name: "timezone", label: "Часовой пояс" },
            ]}
          />
        </div>
      </main>
    </div>
  );
}