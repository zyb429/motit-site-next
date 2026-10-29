// src/app/(admin)/admin/settings/seo/page.tsx
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { getSiteSettings } from "@/lib/db/site-settings";
import { SettingsForm } from "@/components/admin/settings/SettingsForm";
import { updateSeo } from "../actions";

export default async function SeoSettingsPage() {
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
              <Search className="w-6 h-6 text-(--accent)" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-(--text-primary)">SEO</h1>
              <p className="text-sm text-(--text-secondary)">
                Meta-теги, OG-картинка, robots
              </p>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-3xl mx-auto w-full">
          <SettingsForm
            settings={s}
            action={updateSeo}
            fields={[
              { name: "seoTitle", label: "Meta title" },
              {
                name: "seoDescription",
                label: "Meta description",
                textarea: true,
              },
              {
                name: "seoKeywords",
                label: "Ключевые слова (через запятую)",
                textarea: true,
              },
              {
                kind: "image",
                name: "ogImageUrl",
                label: "OG image (1200×630)",
                accept: "image/*",
              },
              {
                name: "robots",
                label: "Robots (index,follow)",
              },
            ]}
          />
        </div>
      </main>
    </div>
  );
}