import Link from "next/link";
import { ArrowLeft, Share2 } from "lucide-react";
import { getSiteSettings } from "@/lib/db/site-settings";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/admin/settings/SettingsForm";
import { SocialOptionsForm } from "@/components/admin/settings/SocialOptionsForm";
import { updateSocial } from "../actions";

type Option = { label: string; value: string; icon?: string };

export default async function SocialSettingsPage() {
  const [s, socialOptionsRow] = await Promise.all([
    getSiteSettings(),
    prisma.globalSettings.findUnique({ where: { key: "social_options" } }),
  ]);

  const customOptions: Option[] = Array.isArray(socialOptionsRow?.value)
    ? (socialOptionsRow!.value as Option[])
    : [];

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
              <Share2 className="w-6 h-6 text-(--accent)" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-(--text-primary)">
                Соцсети
              </h1>
              <p className="text-sm text-(--text-secondary)">
                Ссылки на соцсети и мессенджеры
              </p>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-3xl mx-auto w-full space-y-10">
          <section>
            <h2 className="text-base font-semibold text-(--text-primary) mb-3">
              Ссылки на соцсети
            </h2>
            <SettingsForm
              settings={s}
              action={updateSocial}
              fields={[
                {
                  kind: "social",
                  name: "socialLinks",
                  label: "Ссылки",
                },
              ]}
            />
          </section>

          <section>
            <h2 className="text-base font-semibold text-(--text-primary) mb-1">
              Пользовательские соцсети
            </h2>
            <p className="text-xs text-(--text-muted) mb-3">
              Задают список соцсетей для выбора в настройках Puck-футера.
              Поддерживаются SVG/PNG, загруженные как иконки, и любое имя
              соцсети.
            </p>
            <SocialOptionsForm siteId={s.id} initial={customOptions} />
          </section>
        </div>
      </main>
    </div>
  );
}