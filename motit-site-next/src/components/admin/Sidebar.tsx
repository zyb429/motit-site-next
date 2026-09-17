// src/components/admin/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, FolderTree } from "lucide-react";
import type { CurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const NAV = [
  { href: "/admin", label: "Дашборд", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Посты", icon: FileText },
  { href: "/admin/categories", label: "Категории", icon: FolderTree },
];

export function AdminSidebar({ user }: { user: CurrentUser }) {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-(--border) bg-(--bg-card) flex flex-col">
      <div className="p-4 border-b border-(--border)">
        <Link
          href="/"
          className="text-sm font-semibold text-(--text-primary) hover:text-(--accent)"
        >
          ← Motit
        </Link>
        <div className="text-xs text-(--text-muted) mt-1">Админка</div>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-(--accent-dim) text-(--accent)"
                  : "text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--accent-dim)"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-(--border)">
        <div className="text-xs text-(--text-muted) mb-2 truncate">
          @{user.username} · {user.role ?? "no role"}
        </div>
        <div className="flex items-center justify-between">
          <LogoutButton className="text-(--text-muted) hover:text-red-400 transition-colors flex items-center gap-2 text-xs" />
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
