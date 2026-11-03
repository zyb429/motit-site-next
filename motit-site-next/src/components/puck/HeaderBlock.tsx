"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Container } from "@/components/ui";
import { useActiveSection } from "@/hooks/useActiveSection";
import { Headphones } from "lucide-react";

export type HeaderBlockProps = {
  logoText: string;
  logoHref: string;
  logoImageUrl?: string | null;
  nav: Array<{
    label: string;
    href: string;
    external?: boolean;
    icon?: string;
  }>;
  ctaLabel?: string;
  ctaHref?: string;
  ctaEnabled?: boolean;
};

export function HeaderBlock({
  logoText = "Motit",
  logoHref = "/",
  logoImageUrl,
  nav = [],
  ctaLabel = "Связаться",
  ctaHref = "/#contact",
  ctaEnabled = false,
}: HeaderBlockProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const sectionIds = nav
    .map((link) => link.href.split("#")[1])
    .filter(Boolean) as string[];

  const activeSection = useActiveSection(sectionIds);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) => {
    const [cleanPath, hash] = href.split("#");

    if (
      pathname !== cleanPath &&
      !(cleanPath === "/blog" && pathname?.startsWith("/blog"))
    ) {
      return false;
    }

    if (hash) {
      return activeSection === hash;
    }

    return !activeSection;
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#0a1920]/80 backdrop-blur-sm border-b border-[rgba(45,212,191,0.1)]"
          : "bg-[#0a1920]"
      }`}
    >
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Логотип */}
          <Link
            href={logoHref}
            className="flex shrink-0 items-center"
            aria-label={logoText || "На главную"}
          >
            {logoImageUrl ? (
              // Убираем жесткие рамки w-[160px] h-9, 
              // даем картинке заполнить высоту шапки (h-12 = 48px) и ширину автоподбором
              <div className="relative h-12 sm:h-14 flex items-center justify-start">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoImageUrl}
                  alt={logoText || "Логотип сайта"}
                  className="h-full w-auto max-w-[200px] object-contain object-left"
                  loading="eager"
                />
              </div>
            ) : (
              <span className="text-xl font-bold text-white whitespace-nowrap">
                {logoText}
              </span>
            )}
          </Link>

          {/* Десктопное меню */}
          <nav className="hidden md:flex items-center gap-6">
            {nav.map((link, index) => (
              <Link
                key={`${link.href}-${index}`}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive(link.href)
                    ? "text-[var(--accent)]"
                    : "text-gray-300 hover:text-[var(--accent)]"
                }`}
              >
                {link.icon === "headphones" && <Headphones size={16} />}
                {link.label}
              </Link>
            ))}

            {ctaEnabled && ctaLabel && ctaHref && (
              <Link
                href={ctaHref}
                className="ml-4 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 bg-[var(--accent)] text-[var(--bg-primary)]"
              >
                {ctaLabel}
              </Link>
            )}
          </nav>

          {/* Кнопка мобильного меню */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </Container>

      {/* Мобильное меню */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-[#0a1920] border-b border-[rgba(45,212,191,0.1)] p-4 md:hidden z-50">
          <nav className="flex flex-col gap-3">
            {nav.map((link, index) => (
              <Link
                key={`mobile-${link.href}-${index}`}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive(link.href)
                    ? "text-[var(--accent)]"
                    : "text-gray-300 hover:text-[var(--accent)]"
                }`}
              >
                {link.icon === "headphones" && <Headphones size={16} />}
                {link.label}
              </Link>
            ))}

            {ctaEnabled && ctaLabel && ctaHref && (
              <Link
                href={ctaHref}
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-2 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-300 bg-[var(--accent)] text-[var(--bg-primary)]"
              >
                {ctaLabel}
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export default HeaderBlock;