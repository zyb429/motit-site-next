// src/app/(admin)/admin/settings/page.tsx
import Link from "next/link";
import {
  ArrowLeft,
  Settings,
  Globe,
  Phone,
  Share2,
  Mail,
  Search,
  BarChart3,
  Bell,
  Palette,
  Shield,
  Database,
} from "lucide-react";

const SECTIONS = [
  {
    href: "/admin/settings/general",
    icon: Globe,
    title: "Основные",
    desc: "Название, описание, язык, часовой пояс",
  },
  {
    href: "/admin/settings/contacts",
    icon: Phone,
    title: "Контакты",
    desc: "Email, телефон, адрес, график работы",
  },
  {
    href: "/admin/settings/social",
    icon: Share2,
    title: "Соцсети",
    desc: "Ссылки на Telegram, Instagram, VK и др.",
  },
  {
    href: "/admin/settings/email",
    icon: Mail,
    title: "Почта",
    desc: "Адрес и имя отправителя писем",
  },
  {
    href: "/admin/settings/seo",
    icon: Search,
    title: "SEO",
    desc: "Meta-теги, OG-картинка, robots",
  },
  {
    href: "/admin/settings/analytics",
    icon: BarChart3,
    title: "Аналитика",
    desc: "Google Analytics, Яндекс.Метрика",
  },
  {
    href: "/admin/settings/notifications",
    icon: Bell,
    title: "Уведомления",
    desc: "Куда присылать заявки и события",
  },
  {
    href: "/admin/settings/appearance",
    icon: Palette,
    title: "Внешний вид",
    desc: "Логотип, favicon, акцентный цвет",
  },
  {
    href: "/admin/settings/security",
    icon: Shield,
    title: "Безопасность",
    desc: "2FA, срок сессии, IP-ограничения",
  },
  {
    href: "/admin/settings/backups",
    icon: Database,
    title: "Резервные копии",
    desc: "Экспорт, импорт и сброс настроек",
  },
];

export default function SettingsPage() {
  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-(--bg-primary)">
      <header className="shrink-0 bg-(--bg-card) border-b border-(--border)">
        <div className="h-20 px-4 sm:px-6 max-w-6xl mx-auto w-full flex items-center">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/admin"
              className="text-(--text-muted) hover:text-(--text-primary) transition-colors shrink-0"
              aria-label="Назад"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-(--accent-dim) rounded-lg flex items-center justify-center shrink-0">
              <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-(--accent)" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-(--text-primary) truncate">
                Настройки
              </h1>
              <p className="text-xs sm:text-sm text-(--text-secondary) truncate">
                Управление параметрами сайта
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6 auto-rows-fr">
            {SECTIONS.map(({ href, icon: Icon, title, desc }) => (
              <Link
                key={href}
                href={href}
                className="group flex gap-3 bg-(--bg-card) rounded-xl border border-(--border) p-4 hover:border-(--border-hover) transition-all"
              >
                <div className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center bg-(--accent-dim)">
                  <Icon className="w-5 h-5 text-(--accent)" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm text-(--text-primary) group-hover:text-(--accent) transition-colors">
                    {title}
                  </div>
                  <div className="text-xs text-(--text-muted) mt-0.5 line-clamp-2">
                    {desc}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="bg-(--bg-card) rounded-xl border border-(--border) p-6">
            <h2 className="text-lg font-semibold text-(--text-primary) mb-4">
              О системе
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-(--border)">
                <span className="text-(--text-secondary)">Next.js</span>
                <span className="text-(--text-primary) font-medium">16.3.5</span>
              </div>
              <div className="flex justify-between py-2 border-b border-(--border)">
                <span className="text-(--text-secondary)">БД</span>
                <span className="text-(--text-primary) font-medium">
                  MySQL + Prisma
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-(--border)">
                <span className="text-(--text-secondary)">Режим</span>
                <span className="text-(--accent) font-medium">
                  {process.env.NODE_ENV === "production"
                    ? "Production"
                    : "Development"}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-(--text-secondary)">Хранилище</span>
                <span className="text-(--text-primary) font-medium">
                  S3 / MinIO
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
