// src/components/account/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  User,
  Home,
  LayoutDashboard,
  Shield,
  LifeBuoy,
  Building2,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  MessageSquare
} from "lucide-react";
import type { CurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface SidebarProps {
  user: CurrentUser;
}

const NAV = [
  { href: "/cabinet",               label: "Обзор",        Icon: LayoutDashboard },
  { href: "/cabinet/profile",       label: "Профиль",      Icon: User },
  { href: "/cabinet/security",      label: "Безопасность", Icon: Shield },
  { href: "/cabinet/tickets",       label: "Мои тикеты",   Icon: LifeBuoy },
  { href: "/cabinet/chat",          label: "Сообщения",    Icon: MessageSquare },
  { href: "/cabinet/organizations", label: "Организации",  Icon: Building2 },
];

const STORAGE_KEY = "account-sidebar-collapsed";

export function AccountSidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const canAccessAdmin = user.isAdmin || user.isWorker;

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });

  const toggleCollapsed = () => {
    setCollapsed((v: boolean) => {
      const next = !v;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-64"
      } sticky top-0 h-screen shrink-0 border-r border-(--border) bg-(--bg-card) flex flex-col transition-all duration-200 overflow-hidden`}
    >
      {/* Шапка с профилем */}
      <div className="h-20 border-b border-(--border) shrink-0 flex items-center justify-center px-3">
        {!collapsed ? (
          <div className="flex items-center gap-3 w-full min-w-0">
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar_url}
                alt={user.username}
                className="w-10 h-10 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-(--accent-dim) flex items-center justify-center text-(--accent) font-bold shrink-0">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-(--text-primary) truncate">
                {user.full_name || user.username}
              </div>
              <div className="text-xs text-(--text-muted) truncate">
                @{user.username}
              </div>
            </div>
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
        <div className="px-2 space-y-0.5 mt-1">
          {NAV.map(({ href, label, Icon }) => {
            const active =
              href === "/cabinet"
                ? pathname === "/cabinet"
                : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-(--accent-dim) text-(--accent) font-medium"
                    : "text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--accent-dim)"
                } ${collapsed ? "justify-center" : ""}`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r bg-(--accent)" />
                )}
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Кнопка перехода в админку — только для admin и worker */}
      <div className="px-2 py-2 border-t border-(--border) space-y-0.5">
        {canAccessAdmin && (
          <Link
            href="/admin"
            title={collapsed ? "Перейти в админку" : undefined}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--accent-dim) transition-colors ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <ShieldCheck size={18} className="shrink-0" />
            {!collapsed && <span>Перейти в админку</span>}
          </Link>
        )}

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

      {/* Футер: выход + тема */}
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
