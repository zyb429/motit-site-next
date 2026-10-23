// src/components/sections/Footer.tsx
import {
  Link as Linkedin,
  Send,
  Mail,
  Headphones,
  Phone,
  MapPin,
  User,
  Youtube,
  Instagram,
  Github,
  Twitter,
  Facebook,
  MessageCircle,
} from "lucide-react"
import type { FooterContent } from "@/lib/globals-types"
import FooterNav from "./FooterNav"

const SOCIAL_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  telegram: Send,
  vk: MessageCircle,
  youtube: Youtube,
  instagram: Instagram,
  github: Github,
  twitter: Twitter,
  facebook: Facebook,
  linkedin: Linkedin,
  support: Headphones,
}

const CONTACT_ICONS: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  phone: Phone,
  mail: Mail,
  "map-pin": MapPin,
  user: User,
}

export default function Footer({ data }: { data: FooterContent }) {
  return (
    <footer
      className="border-t"
      style={{
        backgroundColor: "#0d2029",
        borderColor: "rgba(45, 212, 191, 0.08)",
      }}
    >
      <div className="content-container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-10">
          {/* Компания */}
          <div>
            <a
              href={data.logo?.href || "/"}
              className="text-xl font-bold tracking-tight block mb-3"
              style={{ color: "#e0f7fa" }}
            >
              {data.logo?.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.logo.image_url}
                  alt={data.logo?.text || "Logo"}
                  className="h-8 w-auto"
                />
              ) : (
                data.logo?.text || "МОТИТ"
              )}
            </a>
            {data.logo.description && (
              <p
                className="text-sm leading-relaxed mb-4"
                style={{ color: "rgba(128, 222, 234, 0.6)" }}
              >
                {data.logo.description}
              </p>
            )}
            {data.social.length > 0 && (
              <div className="flex gap-3">
                {data.social.map((s) => {
                  const Icon = SOCIAL_ICONS[s.name] ?? MessageCircle
                  return (
                    <a
                      key={s.name + s.href}
                      href={s.href}
                      target={s.href.startsWith("http") ? "_blank" : undefined}
                      rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-150 hover:border-[#2dd4bf] hover:text-[#2dd4bf]"
                      style={{
                        borderColor: "rgba(45, 212, 191, 0.1)",
                        color: "rgba(128, 222, 234, 0.6)",
                      }}
                      aria-label={s.name}
                    >
                      <Icon size={16} />
                    </a>
                  )
                })}
              </div>
            )}
          </div>

          {/* Колонки */}
          {data.columns.map((col, i) => {
            if (col.type === "links") {
              return (
                <FooterNav
                  key={i}
                  title={col.title}
                  links={col.links}
                />
              )
            }

            if (col.type === "contacts") {
              return (
                <div key={i}>
                  <h4
                    className="text-sm font-semibold uppercase tracking-wider mb-4"
                    style={{ color: "#e0f7fa" }}
                  >
                    {col.title}
                  </h4>
                  <div className="flex flex-col gap-3">
                    {col.contacts.map((c, j) => {
                      const Icon = CONTACT_ICONS[c.icon] ?? Phone
                      const style = {
                        color: "rgba(128, 222, 234, 0.6)",
                      } as React.CSSProperties

                      const content = (
                        <>
                          <Icon size={14} className="flex-shrink-0" />
                          <span>{c.text}</span>
                        </>
                      )

                      if (c.href) {
                        const isExternal = c.href.startsWith("http")
                        return (
                          <a
                            key={j}
                            href={c.href}
                            target={isExternal ? "_blank" : undefined}
                            rel={isExternal ? "noopener noreferrer" : undefined}
                            className="flex items-center gap-2 text-sm transition-colors duration-100 hover:text-[#2dd4bf]"
                            style={style}
                          >
                            {content}
                          </a>
                        )
                      }
                      return (
                        <div
                          key={j}
                          className="flex items-center gap-2 text-sm"
                          style={style}
                        >
                          {content}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            }

            if (col.type === "support" && col.support?.enabled) {
              const SupportIcon = col.support.button_icon ? Headphones : null
              return (
                <div key={i}>
                  <h4
                    className="text-sm font-semibold uppercase tracking-wider mb-4"
                    style={{ color: "#e0f7fa" }}
                  >
                    {col.title}
                  </h4>
                  {col.support.text && (
                    <p
                      className="text-sm leading-relaxed mb-4"
                      style={{ color: "rgba(128, 222, 234, 0.6)" }}
                    >
                      {col.support.text}
                    </p>
                  )}
                  {col.support.button_label && (
                    <a
                      href={col.support.button_href}
                      target={
                        col.support.button_href.startsWith("http")
                          ? "_blank"
                          : undefined
                      }
                      rel={
                        col.support.button_href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="btn-primary py-2.5 px-4 text-xs inline-flex items-center"
                    >
                      {SupportIcon && <SupportIcon size={14} className="mr-2" />}
                      {col.support.button_label}
                    </a>
                  )}
                </div>
              )
            }

            return null
          })}
        </div>

        <div
          className="border-t pt-8 text-center"
          style={{ borderColor: "rgba(45, 212, 191, 0.08)" }}
        >
          <p
            className="text-xs uppercase tracking-[0.05em]"
            style={{ color: "rgba(77, 208, 225, 0.45)" }}
          >
            {data.copyright}
          </p>
        </div>
      </div>
    </footer>
  )
}