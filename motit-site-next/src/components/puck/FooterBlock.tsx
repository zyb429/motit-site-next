"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Phone, Mail, MapPin, User, Headphones, Send, Github, Youtube, MessageCircle, Globe, Linkedin,
  type LucideIcon,
} from "lucide-react";

type FooterLink = { label: string; href: string; external: boolean };
type FooterContact = { icon: "phone" | "mail" | "map-pin" | "user"; text: string; href: string };
type FooterSupport = { enabled: boolean; text: string; button_label: string; button_href: string; button_icon: boolean };
type FooterSocial = { name: string; href: string };
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

const CONTACT_ICONS: Record<FooterContact["icon"], LucideIcon> = { phone: Phone, mail: Mail, "map-pin": MapPin, user: User };
const SOCIAL_ICONS: Record<string, LucideIcon> = { 
  telegram: Send, vk: MessageCircle, youtube: Youtube, github: Github, linkedin: Linkedin, support: Headphones 
};

const resolveLogoUrl = (logo: LogoImage) => !logo ? "" : typeof logo === "string" ? logo : logo.url ?? "";

export function FooterBlock(props: FooterBlockProps) {
  const logoUrl = resolveLogoUrl(props.logoImageUrl);
  const columnsCount = (props.columns || []).length;
  
  // Чтобы не ломать SSR, используем useState для ширины экрана
  const [isDesktop, setIsDesktop] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    handleResize(); // Проверяем при монтировании
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Вычисляем количество колонок в зависимости от ширины экрана
  let gridCols = 1; // По умолчанию 1 колонка (мобилка)
  if (isDesktop) {
    gridCols = 4; // На ПК: Лого + 3 колонки = 4
  } else if (isTablet) {
    gridCols = 2; // На планшете: по 2 в ряд
  }

  return (
    <footer className="border-t border-[rgba(45,212,191,0.12)] bg-[#0a1920]" style={{ color: "rgba(128, 222, 234, 0.75)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-14">
        
        {/* ГЛАВНЫЙ ФИКС: Жесткая inline-сетка, которая не зависит от Tailwind */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
            gap: "2.5rem",
            alignItems: "start",
            width: "100%",
          }}
        >
          {/* Бренд */}
          <div style={{ minWidth: 0 }}>
            <Link href={props.logoHref || "/"} className="inline-flex items-center gap-3 group">
              {logoUrl ? (
                <img src={logoUrl} alt={props.logoText || "Логотип"} className="h-10 w-auto object-contain" />
              ) : (
                <span className="text-xl font-bold tracking-tight" style={{ color: "#e0f7fa" }}>
                  {props.logoText}
                </span>
              )}
            </Link>

            {props.description && (
              <p className="mt-4 text-sm leading-relaxed" style={{ color: "rgba(128, 222, 234, 0.6)" }}>
                {props.description}
              </p>
            )}

            {(props.social || []).length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {(props.social || []).map((s, i) => {
                  const Icon = SOCIAL_ICONS[s.name] ?? Globe;
                  return (
                    <a key={`${s.name}-${i}`} href={s.href} target="_blank" rel="noreferrer" aria-label={s.name} className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-150" style={{ backgroundColor: "rgba(45, 212, 191, 0.1)", color: "#2dd4bf", border: "1px solid rgba(45, 212, 191, 0.18)" }}>
                      <Icon size={16} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Колонки */}
          {(props.columns || []).map((col, ci) => (
            <div key={ci} style={{ minWidth: 0 }}>
              {col.title && <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "#e0f7fa" }}>{col.title}</h3>}

              {col.type === "links" && (
                <ul className="space-y-2.5">
                  {(col.links || []).map((l, li) => (
                    <li key={li}>
                      <a href={l.href} target={l.external ? "_blank" : undefined} rel={l.external ? "noreferrer" : undefined} className="text-sm transition-colors duration-150 hover:text-[#2dd4bf]" style={{ color: "rgba(128, 222, 234, 0.6)" }}>
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
                        <a href={c.href} className="flex items-start gap-3 text-sm transition-colors duration-150 hover:text-[#2dd4bf]" style={{ color: "rgba(128, 222, 234, 0.6)" }}>
                          <Icon size={16} className="mt-0.5 flex-shrink-0" style={{ color: "#2dd4bf" }} />
                          <span>{c.text}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}

              {col.type === "support" && col.support?.enabled && (
                <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(45, 212, 191, 0.06)", border: "1px solid rgba(45, 212, 191, 0.15)" }}>
                  {col.support.text && <p className="text-xs leading-relaxed mb-3" style={{ color: "rgba(128, 222, 234, 0.7)" }}>{col.support.text}</p>}
                  {col.support.button_label && (
                    <a href={col.support.button_href || "#"} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-opacity duration-150 hover:opacity-90" style={{ backgroundColor: "#2dd4bf", color: "#0a1920" }}>
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

      {/* Копирайт */}
      <div className="border-t border-[rgba(45,212,191,0.12)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs" style={{ color: "rgba(128, 222, 234, 0.5)" }}>{props.copyright || ""}</p>
          {props.credit && <p className="text-xs" style={{ color: "rgba(128, 222, 234, 0.35)" }}>{props.credit}</p>}
        </div>
      </div>
    </footer>
  );
}