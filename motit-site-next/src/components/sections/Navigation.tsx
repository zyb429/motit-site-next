// src/components/sections/Navigation.tsx
import { Headphones } from "lucide-react"
import NavigationClient from "./NavigationClient"
import Link from "next/link"
import type { HeaderContent } from "@/lib/globals-types"

export default function Navigation({ data }: { data: HeaderContent }) {
  return (
    <header className="sticky top-0 z-50">
      <nav className="h-18">
        <div className="content-container h-full flex items-center justify-between">
          {/* Логотип */}
          <Link
            href={data.logo.href}
            className="text-xl font-bold tracking-tight transition-colors duration-200 hover:text-[#2dd4bf]"
            style={{ color: "#e0f7fa" }}
          >
            {data.logo.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.logo.image_url}
                alt={data.logo.text}
                className="h-8 w-auto"
              />
            ) : (
              data.logo.text
            )}
          </Link>

          {/* Меню (десктоп) */}
          <div className="hidden md:flex items-center gap-8">
            {data.nav.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium uppercase tracking-wider transition-colors duration-200 hover:text-[#2dd4bf]"
                  style={{ color: "rgba(224, 247, 250, 0.7)" }}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium uppercase tracking-wider transition-colors duration-200 hover:text-[#2dd4bf]"
                  style={{ color: "rgba(224, 247, 250, 0.7)" }}
                >
                  {link.label}
                </Link>
              ),
            )}

            {/* CTA */}
            {data.cta.enabled && (
              <Link
                href={data.cta.href}
                className="btn-primary py-3 px-5 text-xs"
              >
                {data.cta.label}
              </Link>
            )}
          </div>

          {/* Мобильное меню */}
          <NavigationClient data={data} />
        </div>
      </nav>
    </header>
  )
}