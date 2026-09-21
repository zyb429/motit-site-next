// src/components/account/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  LayoutDashboard,
  Shield,
  LifeBuoy,
} from "lucide-react";
import type { CurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/LogoutButton";

interface SidebarProps {
  user: CurrentUser;
}

const NAV = [
  { href: "/account",          label: "Обзор",       Icon: LayoutDashboard },
  { href: "/account/profile",  label: "Профиль",     Icon: User },
  { href: "/account/security", label: "Безопасность", Icon: Shield },
  { href: "/account/tickets",  label: "Мои тикеты",  Icon: LifeBuoy },
];

export function AccountSidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-[rgba(45,212,191,0.08)] bg-[#0d2029] flex flex-col">
      <div className="p-5 border-b border-[rgba(45,212,191,0.08)]">
        <div className="flex items-center gap-3">
          {user.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatar_url}
              alt={user.username}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#2dd4bf]/10 flex items-center justify-center text-[#2dd4bf] font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <div className="text-sm font-medium text-[#e0f7fa] truncate">
              {user.full_name || user.username}
            </div>
            <div className="text-xs text-gray-500 truncate">
              @{user.username}
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(({ href, label, Icon }) => {
          const active =
            href === "/account"
              ? pathname === "/account"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-[#2dd4bf]/10 text-[#2dd4bf] font-medium"
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
        <LogoutButton />
      </div>
    </aside>
  );
}
