import Link from "next/link";
import { ArrowLeft, Palette } from "lucide-react";
import { getSiteSettings } from "@/lib/db/site-settings";
import { SettingsForm } from "@/components/admin/settings/SettingsForm";
import { updateAppearance } from "../actions";

export default async function AppearanceSettingsPage() {
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
              <Palette className="w-6 h-6 text-(--accent)" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-(--text-primary)">
                Внешний вид
              </h1>
              <p className="text-sm text-(--text-secondary)">
                Логотип, favicon, акцентный цвет
              </p>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-3xl mx-auto w-full">
          <SettingsForm
            settings={s}
            action={updateAppearance}
            fields={[
              { kind: "image", name: "logoUrl", label: "Логотип" },
              {
                kind: "image",
                name: "faviconUrl",
                label: "Favicon",
                accept: "image/x-icon,image/png,image/svg+xml",
              },
              {
                kind: "color",
                name: "accentColor",
                label: "Акцентный цвет",
              },
            ]}
          />
        </div>
      </main>
    </div>
  );
}