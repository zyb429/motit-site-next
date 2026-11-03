"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavigationProps = {
  logoUrl?: string | null;
  siteName?: string | null;
};

const links = [
  { href: "/", label: "Главная" },
  { href: "/blog", label: "Блог" },
  { href: "/about", label: "О нас" },
  { href: "/#contact", label: "Контакты" },
];

export function Navigation({ logoUrl, siteName }: NavigationProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    const cleanPath = path.split("#")[0];
    if (cleanPath === "/blog" && pathname?.startsWith("/blog")) return true;
    return pathname === cleanPath;
  };

  return (
    <>
      {/* Логотип */}
      <Link
        href="/"
        className="flex items-center shrink-0"
        onClick={() => setIsMobileMenuOpen(false)}
      >
        {logoUrl ? (
          <div className="relative w-[140px] sm:w-[180px] h-10 sm:h-12 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt={siteName || "Логотип сайта"}
              className="absolute max-w-none w-[120%] h-[120%] object-contain scale-90"
              style={{ transformOrigin: "center center" }}
              loading="eager"
            />
          </div>
        ) : (
          <span className="flex items-center gap-2">
            <svg
              className="w-8 h-8 text-blue-600 dark:text-blue-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>

            {siteName ? (
              <span className="text-lg font-semibold text-(--text-primary)">
                {siteName}
              </span>
            ) : null}
          </span>
        )}
      </Link>

      {/* Десктопная навигация */}
      <nav className="hidden md:flex items-center gap-6 ml-auto">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
              isActive(link.href)
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-300"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Мобильное меню — кнопка */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden p-2 ml-auto"
        aria-label="Toggle menu"
        aria-expanded={isMobileMenuOpen}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isMobileMenuOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Мобильное меню (выпадающее) */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 md:hidden z-50">
          <nav className="flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActive(link.href)
                    ? "text-blue-600"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}