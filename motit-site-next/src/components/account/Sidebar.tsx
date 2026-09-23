// src/components/account/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  LayoutDashboard,
  Shield,
  LifeBuoy,
  Building2,
  ShieldCheck,
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
  { href: "/cabinet/organizations", label: "Организации",  Icon: Building2 },
];

export function AccountSidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const canAccessAdmin = user.isAdmin || user.isWorker;

  return (
    <aside className="w-64 shrink-0 border-r border-(--border) bg-(--bg-card) flex flex-col">
      {/* Шапка с профилем */}
      <div className="p-5 border-b border-(--border)">
        <div className="flex items-center gap-3">
          {user.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatar_url}
              alt={user.username}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-(--accent-dim) flex items-center justify-center text-(--accent) font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <div className="text-sm font-medium text-(--text-primary) truncate">
              {user.full_name || user.username}
            </div>
            <div className="text-xs text-(--text-muted) truncate">
              @{user.username}
            </div>
          </div>
        </div>
      </div>

      {/* Навигация */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(({ href, label, Icon }) => {
          const active =
            href === "/cabinet"
              ? pathname === "/cabinet"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-(--accent-dim) text-(--accent) font-medium"
                  : "text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--accent-dim)"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Кнопка перехода в админку — только для admin и worker */}
      {canAccessAdmin && (
        <div className="px-3 pb-2">
          <Link
            href="/admin"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-(--accent) border border-(--border) hover:bg-(--accent-dim) transition-colors"
          >
            <ShieldCheck size={16} />
            Перейти в админку
          </Link>
        </div>
      )}

      {/* Футер: выход + тема */}
      <div className="p-3 border-t border-(--border)">
        <div className="flex items-center justify-between gap-2">
          <LogoutButton variant="full" />
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
