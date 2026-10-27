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
  logoImageUrl?: string;
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
          {/* Логотип — всегда белый */}
          <Link
            href={logoHref}
            className="text-xl font-bold flex items-center gap-2 text-white"
          >
            {logoImageUrl ? (
              <img src={logoImageUrl} alt={logoText} className="h-8 w-auto" />
            ) : (
              logoText
            )}
          </Link>

          {/* Десктопное меню */}
          <nav className="hidden md:flex items-center gap-6">
            {nav.map((link, i) => (
              <Link
                key={i}
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

            {/* CTA */}
            {ctaEnabled && ctaLabel && ctaHref && (
              <Link
                href={ctaHref}
                className="ml-4 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 bg-[var(--accent)] text-[var(--bg-primary)]"
              >
                {ctaLabel}
              </Link>
            )}
          </nav>

          {/* Кнопка мобильного меню — всегда белая */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white"
            aria-label="Toggle menu"
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

      {/* Мобильное меню — всегда тёмное */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-[#0a1920] border-b border-[rgba(45,212,191,0.1)] p-4 md:hidden z-50">
          <nav className="flex flex-col gap-3">
            {nav.map((link, i) => (
              <Link
                key={i}
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