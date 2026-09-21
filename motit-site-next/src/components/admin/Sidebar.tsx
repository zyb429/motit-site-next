// src/components/admin/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Inbox,
  LayoutDashboard,
  FileText,
  FolderTree,
  Settings,
  Home,
  Plus,
  Users,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import type { CurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ThemeToggle } from "@/components/ui/theme-toggle";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const GROUPS: NavGroup[] = [
  {
    title: "Контент",
    items: [
      { href: "/admin", label: "Дашборд", icon: LayoutDashboard, exact: true },
      { href: "/admin/posts", label: "Посты", icon: FileText },
      { href: "/admin/categories", label: "Категории", icon: FolderTree },
    ],
  },
  {
    title: "Система",
    items: [
      { href: "/admin/users", label: "Пользователи", icon: Users },
      { href: "/admin/settings", label: "Настройки", icon: Settings },
    ],
  },
  {
    title: "Тикеты",
    items: [
      { href: "/admin/tickets", label: "Обращения", icon: Inbox },
      { href: "/admin/tickets/new", label: "Новое обращение", icon: Plus },
      { href: "/admin/ticket-categories", label: "Категории обращений", icon: FolderTree },
    ],
  },
];

const STORAGE_KEY = "admin-sidebar-collapsed";

export function AdminSidebar({ user }: { user: CurrentUser }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Читаем состояние из localStorage при монтировании
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "1") setCollapsed(true);
    } catch {
      // ignore
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((v) => {
      const next = !v;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-60"
      } sticky top-0 h-screen shrink-0 border-r border-(--border) bg-(--bg-card) flex flex-col transition-all duration-200 overflow-hidden`}
    >
      {/* Хедер */}
      <div className="h-20 border-b border-(--border) shrink-0 flex items-center justify-center px-3">
        {!collapsed ? (
          <div className="flex items-center justify-between w-full gap-2 min-w-0">
            <Link href="/" className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-(--accent-dim) rounded-lg flex items-center justify-center shrink-0">
                <LayoutDashboard className="w-5 h-5 text-(--accent)" />
              </div>
              <span className="text-sm font-semibold text-(--text-primary) hover:text-(--accent) truncate">
                Motit
              </span>
            </Link>
            <button
              type="button"
              onClick={toggleCollapsed}
              title="Свернуть"
              aria-label="Свернуть меню"
              className="p-1.5 rounded-lg text-(--text-muted) hover:text-(--accent) hover:bg-(--accent-dim) transition-colors shrink-0"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={toggleCollapsed}
            title="Развернуть"
            aria-label="Развернуть меню"
            className="w-10 h-10 bg-(--accent-dim) rounded-lg flex items-center justify-center text-(--accent) hover:bg-(--accent) hover:text-(--bg-card) transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      {/* Навигация */}
      <nav className="flex-1 overflow-y-auto py-2">
        {GROUPS.map((group, gi) => (
          <div key={group.title} className={gi > 0 ? "mt-4" : ""}>
            {!collapsed && (
              <div className="px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-(--text-muted)">
                {group.title}
              </div>
            )}
            <div className="px-2 space-y-0.5 mt-1">
              {group.items.map(({ href, label, icon: Icon, exact }) => {
                const active = isActive(href, exact);
                return (
                  <Link
                    key={href}
                    href={href}
                    title={collapsed ? label : undefined}
                    className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      active
                        ? "bg-(--accent-dim) text-(--accent)"
                        : "text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--accent-dim)"
                    } ${collapsed ? "justify-center" : ""}`}
                  >
                    {/* Индикатор активного слева */}
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r bg-(--accent)" />
                    )}
                    <Icon size={18} className="shrink-0" />
                    {!collapsed && <span className="truncate">{label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Быстрые ссылки */}
      <div className="px-2 py-2 border-t border-(--border) space-y-0.5">
        <Link
          href="/"
          title={collapsed ? "На сайт" : undefined}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--accent-dim) transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <Home size={18} className="shrink-0" />
          {!collapsed && <span>На сайт</span>}
        </Link>
      </div>

      {/* Футер */}
      <div className="px-2 py-3 border-t border-(--border)">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <ThemeToggle />
            <LogoutButton variant="icon" />
          </div>
        ) : (
          <>
            {/* Учётка */}
            <div className="px-3 mb-2 truncate">
              <div className="text-xs text-(--text-muted) truncate">
                @{user.username}
              </div>
              {user.role && (
                <div className="text-[10px] text-(--text-muted)/60 truncate">
                  {user.role}
                </div>
              )}
            </div>

            {/* Дивайдер */}
            <div className="border-t border-(--border) mb-2" />

            {/* Кнопки */}
            <div className="flex items-center justify-between px-1">
              <LogoutButton variant="full" />
              <ThemeToggle />
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
