// src/components/admin/Sidebar.tsx
"use client";


import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import {
  Inbox,
  MessageSquare,
  LayoutDashboard,
  FileText,
  FolderTree,
  Settings,
  Home,
  Globe,
  Plus,
  Users,
  ChevronLeft,
  ChevronRight,
  Building2,
  User,
  ShieldCheck,
  Bookmark,
  Bell,
  type LucideIcon,
} from "lucide-react";
import type { CurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useSidebarCollapsed } from "@/hooks/useSidebarCollapsed";
import { NotificationBell } from "@/components/admin/NotificationBell";


type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  adminOnly?: boolean;
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
      {
        href: "/admin/settings/privacy-policy",
        label: "Политика конфиденциальности",
        icon: ShieldCheck,
      },
      { href: "/cabinet/saved", label: "Сохранённые посты", icon: Bookmark },
      {
        href: "/admin/announcements",
        label: "Оповещения",
        icon: Bell,
        adminOnly: true,
      },
    ],
  },
  {
    title: "Внешний вид",
    items: [
      { href: "/admin/settings/puck-home", label: "Главная", icon: Home },
      { href: "/admin/settings/puck-header", label: "Хедер", icon: Globe },
      {
        href: "/admin/settings/puck-footer",
        label: "Футер",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Система",
    items: [
      { href: "/admin/users", label: "Пользователи", icon: Users },
      { href: "/admin/organizations", label: "Организации", icon: Building2 },
      {
        href: "/admin/settings",
        label: "Настройки",
        icon: Settings,
        exact: true,
      },
    ],
  },
  {
    title: "Тикеты",
    items: [
      { href: "/admin/tickets", label: "Обращения", icon: Inbox, exact: true },
      {
        href: "/admin/tickets?segment=clients",
        label: "Клиентские",
        icon: Users,
      },
      {
        href: "/admin/tickets?segment=site",
        label: "Заявки с сайта",
        icon: Globe,
      },
      {
        href: "/admin/tickets?segment=internal",
        label: "Внутренние",
        icon: Building2,
      },
      { href: "/admin/tickets/new", label: "Новое обращение", icon: Plus },
      {
        href: "/admin/ticket-categories",
        label: "Категории обращений",
        icon: FolderTree,
      },
    ],
  },
  {
    title: "Сообщения",
    items: [{ href: "/admin/chat", label: "Чаты", icon: MessageSquare }],
  },
];


const COOKIE_KEY = "admin-sidebar-collapsed";


function SidebarContent({
  user,
  initialCollapsed = false,
}: {
  user: CurrentUser;
  initialCollapsed?: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.toString();


  const [collapsed, toggleCollapsed] = useSidebarCollapsed(
    COOKIE_KEY,
    initialCollapsed,
  );
  const [mobileOpen, setMobileOpen] = useState(false);


  useEffect(() => {
    const handler = () => setMobileOpen(true);
    window.addEventListener("open-mobile-sidebar", handler);
    return () => window.removeEventListener("open-mobile-sidebar", handler);
  }, []);


  const isActive = (href: string, exact?: boolean) => {
    const [hrefPath, hrefQuery] = href.split("?");


    let baseActive = false;
    if (hrefPath === "/admin") {
      baseActive = pathname === "/admin" || pathname === "/admin/";
    } else {
      baseActive = exact
        ? pathname === hrefPath
        : pathname === hrefPath || pathname.startsWith(hrefPath + "/");
    }


    if (!baseActive) return false;


    if (hrefQuery) {
      return currentQuery === hrefQuery;
    }


    if (exact && currentQuery !== "") {
      return false;
    }


    return currentQuery === "";
  };


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
          {GROUPS.map((group, gi) => (
            <div key={group.title} className={gi > 0 ? "mt-4" : ""}>
              {!collapsed && (
                <div className="px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-(--text-muted)">
                  {group.title}
                </div>
              )}
              <div className="mt-1 space-y-0.5 px-1">
                {group.items
                  .filter((item) => !item.adminOnly || user.role === "admin")
                  .map(({ href, label, icon: Icon, exact }) => {
                    const active = isActive(href, exact);


                    return (
                      <Link
                        key={href}
                        href={href}
                        title={collapsed ? label : undefined}
                        onClick={() => setMobileOpen(false)}
                        className={`group relative flex items-center rounded-lg py-2 text-sm transition-colors ${
                          collapsed
                            ? "w-full justify-center px-0"
                            : "gap-3 px-3"
                        } ${
                          active
                            ? "bg-(--accent-dim) text-(--accent)"
                            : "text-(--text-secondary) hover:bg-(--accent-dim) hover:text-(--text-primary)"
                        }`}
                      >
                        {active && (
                          <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-(--accent)" />
                        )}
                        <Icon size={18} className="shrink-0" />
                        {!collapsed && (
                          <span className="truncate">{label}</span>
                        )}
                      </Link>
                    );
                  })}
              </div>
            </div>
          ))}
        </nav>


        <div className="space-y-0.5 border-t border-(--border) px-1 py-2">
          <Link
            href="/cabinet"
            title={collapsed ? "Личный кабинет" : undefined}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center rounded-lg py-2 text-sm text-(--text-secondary) transition-colors hover:bg-(--accent-dim) hover:text-(--text-primary) ${
              collapsed ? "w-full justify-center px-0" : "gap-3 px-3"
            }`}
          >
            <User size={18} className="shrink-0" />
            {!collapsed && <span>Личный кабинет</span>}
          </Link>


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


export function AdminSidebar({
  user,
  initialCollapsed = false,
}: {
  user: CurrentUser;
  initialCollapsed?: boolean;
}) {
  return (
    <Suspense
      fallback={
        <div className="h-full w-64 border-r border-(--border) bg-(--bg-card)" />
      }
    >
      <SidebarContent user={user} initialCollapsed={initialCollapsed} />
    </Suspense>
  );
}