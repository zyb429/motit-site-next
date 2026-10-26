"use client";

import { useState } from "react";
import Link from "next/link";

export type HeaderBlockProps = {
  logoText: string;
  logoHref: string;
  logoImageUrl: string | null;
  nav: Array<{ label: string; href: string; external: boolean }>;
  ctaLabel: string;
  ctaHref: string;
  ctaEnabled: boolean;
};

export function HeaderBlock(props: HeaderBlockProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-card)] border-b border-[var(--border)]">
      <div className="h-20 px-4 sm:px-6 max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Логотип */}
        <Link href={props.logoHref || "/"} className="flex items-center gap-3 shrink-0">
          {props.logoImageUrl ? (
            <img src={props.logoImageUrl} alt="" className="h-10 w-auto" />
          ) : (
            <span className="text-lg font-bold text-[var(--text-primary)]">
              {props.logoText}
            </span>
          )}
        </Link>

        {/* Меню — десктоп */}
        <nav className="hidden md:flex items-center gap-6 flex-1 justify-center">
          {props.nav.map((item, i) => (
            <a
              key={i}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noreferrer" : undefined}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3 shrink-0">
          {props.ctaEnabled && (
            <a
              href={props.ctaHref || "/"}
              className="hidden sm:inline-block px-4 py-2 rounded-md bg-[var(--accent)] text-white text-sm hover:opacity-90 transition-opacity"
            >
              {props.ctaLabel}
            </a>
          )}

          {/* Бургер — мобилка */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden p-2 text-[var(--text-primary)]"
            aria-label="Меню"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Мобильное меню */}
      {open && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--bg-card)]">
          <nav className="px-4 py-3 space-y-1">
            {props.nav.map((item, i) => (
              <a
                key={i}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noreferrer" : undefined}
                onClick={() => setOpen(false)}
                className="block px-2 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)]"
              >
                {item.label}
              </a>
            ))}
            {props.ctaEnabled && (
              <a
                href={props.ctaHref || "/"}
                onClick={() => setOpen(false)}
                className="block mt-2 px-4 py-2 rounded-md bg-[var(--accent)] text-white text-sm text-center"
              >
                {props.ctaLabel}
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}