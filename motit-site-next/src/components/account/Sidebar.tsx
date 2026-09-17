// src/components/account/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Inbox, PlusCircle, User } from "lucide-react";
import type { CurrentUser } from "@/lib/auth";
import { LogoutButton } from "../auth/LogoutButton";
import { ThemeToggle } from "../ui/theme-toggle";

const NAV = [
  { href: "/account", label: "Обзор", icon: LayoutDashboard, exact: true },
  { href: "/account/tickets", label: "Мои обращения", icon: Inbox },
  { href: "/account/tickets/new", label: "Новое обращение", icon: PlusCircle },
  { href: "/account/profile", label: "Профиль", icon: User },
];

export function AccountSidebar({ user }: { user: CurrentUser }) {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-[rgba(45,212,191,0.08)] bg-[#0f2832] flex flex-col">
      <div className="p-4 border-b border-[rgba(45,212,191,0.08)]">
        <Link
          href="/"
          className="text-sm font-semibold text-[#e0f7fa] hover:text-[#2dd4bf]"
        >
          ← Motit
        </Link>
        <div className="text-xs text-gray-500 mt-1">Личный кабинет</div>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact
            ? pathname === href
            : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-[#2dd4bf]/10 text-[#2dd4bf]"
                  : "text-gray-400 hover:text-[#e0f7fa] hover:bg-[#2dd4bf]/5"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[rgba(45,212,191,0.08)]">
        <div className="text-xs text-gray-500 mb-2 truncate">
          @{user.username} · {user.role ?? "no role"}
        </div>
        <LogoutButton className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/10" />
        <ThemeToggle />
      </div>
    </aside>
  );
}
