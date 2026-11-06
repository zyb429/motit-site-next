// src/components/puck/FooterBlock.tsx
"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  User,
  Headphones,
  Send,
  Github,
  Youtube,
  MessageCircle,
  Globe,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Twitch,
  Rss,
  Moon,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { CUSTOM_SOCIAL_VALUE } from "@/lib/social-options";
import { Container } from "@/components/ui";

type FooterLink = { label: string; href: string; external: boolean };
type FooterContact = {
  icon: "phone" | "mail" | "map-pin" | "user";
  text: string;
  href: string;
};
type FooterSupport = {
  enabled: boolean;
  text: string;
  button_label: string;
  button_href: string;
  button_icon: boolean;
};
type FooterSocial = {
  name: string;
  href: string;
  customName?: string;
  customIcon?: string;
  icon?: string;
};
type LogoImage = string | { url: string } | null | undefined;

export type FooterBlockProps = {
  logoText: string;
  logoHref: string;
  logoImageUrl: LogoImage;
  description: string;
  columns: Array<{
    title: string;
    type: "links" | "contacts" | "support";
    links: FooterLink[];
    contacts: FooterContact[];
    support?: FooterSupport;
  }>;
  social: FooterSocial[];
  copyright: string;
  credit?: string;
};

const CONTACT_ICONS: Record<FooterContact["icon"], LucideIcon> = {
  phone: Phone,
  mail: Mail,
  "map-pin": MapPin,
  user: User,
};

const SOCIAL_ICONS: Record<string, LucideIcon> = {
  telegram: Send,
  vk: MessageCircle,
  youtube: Youtube,
  github: Github,
  linkedin: Linkedin,
  support: Headphones,
  twitter: Twitter,
  x: Twitter,
  instagram: Instagram,
  facebook: Facebook,
  twitch: Twitch,
  rss: Rss,
};

const resolveLogoUrl = (logo: LogoImage) =>
  !logo ? "" : typeof logo === "string" ? logo : (logo.url ?? "");

export function FooterBlock(props: FooterBlockProps) {
  const logoUrl = resolveLogoUrl(props.logoImageUrl);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Избегаем ошибки гидратации при чтении темы
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer className="border-t border-(--border) bg-(--bg-secondary) text-(--text-secondary) transition-colors duration-300">
      <Container>
        <div className="py-12 sm:py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 items-start w-full">
            {/* Бренд */}
            <div className="min-w-0">
              <Link
                href={props.logoHref || "/"}
                className="inline-flex items-center gap-3 group"
              >
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={props.logoText || "Логотип"}
                    className="h-10 w-auto object-contain"
                  />
                ) : (
                  <span className="text-xl font-bold tracking-tight text-(--text-primary)">
                    {props.logoText}
                  </span>
                )}
              </Link>

              {props.description && (
                <p className="mt-4 text-sm leading-relaxed text-(--text-muted)">
                  {props.description}
                </p>
              )}

              {(props.social || []).length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {(props.social || []).map((s, i) => {
                    const isCustom = s.name === CUSTOM_SOCIAL_VALUE;
                    const Icon = SOCIAL_ICONS[s.name?.toLowerCase()] ?? Globe;
                    const label = isCustom
                      ? s.customName || "Соцсеть"
                      : s.name;
                    const iconUrl = s.customIcon || s.icon;

                    return (
                      <a
                        key={`${s.name}-${i}`}
                        href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={label}
                        title={label}
                        className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150 hover:-translate-y-0.5 bg-(--accent-dim) text-(--accent) border border-(--border) hover:border-(--border-hover)"
                      >
                        {iconUrl ? (
                          <img
                            src={iconUrl}
                            alt={label}
                            className="w-4 h-4 object-contain"
                          />
                        ) : (
                          <Icon size={16} />
                        )}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Колонки */}
            {(props.columns || []).map((col, ci) => (
              <div key={ci} className="min-w-0">
                {col.title && (
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 text-(--text-primary)">
                    {col.title}
                  </h3>
                )}

                {col.type === "links" && (
                  <ul className="space-y-2.5">
                    {(col.links || []).map((l, li) => (
                      <li key={li}>
                        <a
                          href={l.href}
                          target={l.external ? "_blank" : undefined}
                          rel={l.external ? "noreferrer" : undefined}
                          className="text-sm transition-colors duration-150 hover:text-(--accent) text-(--text-muted)"
                        >
                          {l.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}

                {col.type === "contacts" && (
                  <ul className="space-y-3">
                    {(col.contacts || []).map((c, ci2) => {
                      const Icon = CONTACT_ICONS[c.icon] ?? Phone;
                      return (
                        <li key={ci2}>
                          <a
                            href={c.href}
                            className="flex items-start gap-3 text-sm transition-colors duration-150 hover:text-(--accent) text-(--text-muted)"
                          >
                            <Icon
                              size={16}
                              className="mt-0.5 flex-shrink-0 text-(--accent)"
                            />
                            <span>{c.text}</span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {col.type === "support" && col.support?.enabled && (
                  <div className="rounded-xl p-4 bg-(--accent-dim) border border-(--border)">
                    {col.support.text && (
                      <p className="text-xs leading-relaxed mb-3 text-(--text-secondary)">
                        {col.support.text}
                      </p>
                    )}
                    {col.support.button_label && (
                      <a
                        href={col.support.button_href || "#"}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-opacity duration-150 hover:opacity-90 bg-(--accent) text-(--bg-primary)"
                      >
                        {col.support.button_icon && <Headphones size={14} />}
                        {col.support.button_label}
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Container>

      <div className="border-t border-(--border)">
        <Container>
          <div className="py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <p className="text-xs text-(--text-muted)">
                {props.copyright || ""}
              </p>
              {props.credit && (
                <p className="text-xs text-(--text-muted) opacity-70">
                  {props.credit}
                </p>
              )}
            </div>

            {/* Переключатель темы */}
            {mounted && (
              <button
                type="button"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex items-center gap-2 text-xs font-medium transition-colors text-(--text-muted) hover:text-(--accent)"
              >
                {theme === "dark" ? (
                  <>
                    <Sun size={14} /> Светлая тема
                  </>
                ) : (
                  <>
                    <Moon size={14} /> Тёмная тема
                  </>
                )}
              </button>
            )}
          </div>
        </Container>
      </div>
    </footer>
  );
}