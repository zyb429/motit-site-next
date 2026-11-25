// src/components/account/Sidebar.tsx
"use client";


import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
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
  MessageSquare,
  Bookmark,
} from "lucide-react";
import type { CurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useSidebarCollapsed } from "@/hooks/useSidebarCollapsed";
import { NotificationBell } from "@/components/admin/NotificationBell";


interface SidebarProps {
  user: CurrentUser;
}


const NAV = [
  { href: "/cabinet", label: "Обзор", Icon: LayoutDashboard },
  { href: "/cabinet/profile", label: "Профиль", Icon: User },
  { href: "/cabinet/saved", label: "Сохранённые", Icon: Bookmark },
  { href: "/cabinet/security", label: "Безопасность", Icon: Shield },
  { href: "/cabinet/tickets", label: "Мои тикеты", Icon: LifeBuoy },
  { href: "/cabinet/chat", label: "Сообщения", Icon: MessageSquare },
  { href: "/cabinet/organizations", label: "Организации", Icon: Building2 },
];


const STORAGE_KEY = "account-sidebar-collapsed";


export function AccountSidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const canAccessAdmin = user.isAdmin || user.isWorker;


  const [collapsed, toggleCollapsed] = useSidebarCollapsed(STORAGE_KEY);
  const [mobileOpen, setMobileOpen] = useState(false);


  useEffect(() => {
    const handler = () => setMobileOpen(true);
    window.addEventListener("open-mobile-sidebar", handler);
    return () => window.removeEventListener("open-mobile-sidebar", handler);
  }, []);


  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}


      <aside
        className={`
          ${collapsed ? "w-20" : "w-64"}
          h-full shrink-0 border-r border-(--border) bg-(--bg-card)
          flex flex-col transition-all duration-200
          fixed inset-y-0 left-0 z-50
          lg:static lg:z-auto
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div
          className={`shrink-0 border-b border-(--border) flex items-center ${
            collapsed ? "min-h-44 flex-col justify-start px-1 py-4" : "h-20 px-3"
          }`}
        >
          {!collapsed ? (
            <div className="flex w-full min-w-0 items-center gap-3">
              {user.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--accent-dim) font-bold text-(--accent)">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}


              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-(--text-primary)">
                  {user.full_name || user.username}
                </div>
                <div className="truncate text-xs text-(--text-muted)">
                  @{user.username}
                </div>
              </div>


              <NotificationBell />


              <button
                type="button"
                onClick={toggleCollapsed}
                title="Свернуть"
                aria-label="Свернуть меню"
                className="hidden shrink-0 rounded-lg p-1.5 text-(--text-muted) transition-colors hover:bg-(--accent-dim) hover:text-(--accent) lg:flex"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              {user.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  title={user.full_name || user.username}
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <div
                  title={user.full_name || user.username}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-(--accent-dim) font-bold text-(--accent)"
                >
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}


              <NotificationBell />


              <button
                type="button"
                onClick={toggleCollapsed}
                title="Развернуть"
                aria-label="Развернуть меню"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-(--text-muted) transition-colors hover:bg-(--accent-dim) hover:text-(--accent)"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>


        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2">
          <div className="mt-1 space-y-0.5 px-1">
            {NAV.map(({ href, label, Icon }) => {
              const active =
                href === "/cabinet"
                  ? pathname === "/cabinet"
                  : pathname === href || pathname.startsWith(href + "/");


              return (
                <Link
                  key={href}
                  href={href}
                  title={collapsed ? label : undefined}
                  onClick={() => setMobileOpen(false)}
                  className={`group relative flex items-center rounded-lg py-2 text-sm transition-colors ${
                    collapsed ? "w-full justify-center px-0" : "gap-3 px-3"
                  } ${
                    active
                      ? "bg-(--accent-dim) font-medium text-(--accent)"
                      : "text-(--text-secondary) hover:bg-(--accent-dim) hover:text-(--text-primary)"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-(--accent)" />
                  )}
                  <Icon size={18} className="shrink-0" />
                  {!collapsed && <span className="truncate">{label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>


        <div className="space-y-0.5 border-t border-(--border) px-1 py-2">
          {canAccessAdmin && (
            <Link
              href="/admin"
              title={collapsed ? "Перейти в админку" : undefined}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center rounded-lg py-2 text-sm text-(--text-secondary) transition-colors hover:bg-(--accent-dim) hover:text-(--text-primary) ${
                collapsed ? "w-full justify-center px-0" : "gap-3 px-3"
              }`}
            >
              <ShieldCheck size={18} className="shrink-0" />
              {!collapsed && <span>Перейти в админку</span>}
            </Link>
          )}


          <Link
            href="/"
            title={collapsed ? "На сайт" : undefined}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center rounded-lg py-2 text-sm text-(--text-secondary) transition-colors hover:bg-(--accent-dim) hover:text-(--text-primary) ${
              collapsed ? "w-full justify-center px-0" : "gap-3 px-3"
            }`}
          >
            <Home size={18} className="shrink-0" />
            {!collapsed && <span>На сайт</span>}
          </Link>
        </div>


        <div
          className={`border-t border-(--border) py-3 ${
            collapsed ? "px-1" : "px-2"
          }`}
        >
          {collapsed ? (
            <div className="flex flex-col items-center gap-1">
              <NotificationBell />
              <ThemeToggle />
              <LogoutButton variant="icon" />
            </div>
          ) : (
            <>
              <div className="mb-2 truncate px-3">
                <div className="truncate text-xs text-(--text-muted)">
                  @{user.username}
                </div>
                {user.role && (
                  <div className="truncate text-[10px] text-(--text-muted)/60">
                    {user.role}
                  </div>
                )}
              </div>


              <div className="mb-2 border-t border-(--border)" />


              <div className="flex items-center justify-between px-1">
                <LogoutButton variant="full" />
                <ThemeToggle />
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}