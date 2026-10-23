// src/lib/globals-types.ts
import { z } from "zod"

// ==================== ХЕДЕР ====================
export const headerSchema = z.object({
  logo: z
    .object({
      text: z.string().default("Motit"),
      href: z.string().default("/"),
      image_url: z.string().nullable().default(null),
    })
    .default({ text: "Motit", href: "/", image_url: null }),
  nav: z
    .array(
      z.object({
        label: z.string(),
        href: z.string(),
        external: z.boolean().default(false),
      }),
    )
    .default([]),
  cta: z
    .object({
      label: z.string().default("Связаться"),
      href: z.string().default("/contacts"),
      enabled: z.boolean().default(true),
    })
    .default({ label: "Связаться", href: "/contacts", enabled: true }),
})
export type HeaderContent = z.infer<typeof headerSchema>

// ==================== ФУТЕР ====================
const socialItemSchema = z.object({
  name: z.string(),
  href: z.string(),
})

const contactItemSchema = z.object({
  icon: z.enum(["phone", "mail", "map-pin", "user"]).default("phone"),
  text: z.string(),
  href: z.string().default(""),
})

const supportBlockSchema = z.object({
  enabled: z.boolean().default(true),
  text: z.string().default(""),
  button_label: z.string().default("ТЕХПОДДЕРЖКА"),
  button_href: z.string().default("/support"),
  button_icon: z.boolean().default(true),
})

export const footerSchema = z.object({
  logo: z
    .object({
      text: z.string().default("МОТИТ"),
      href: z.string().default("/"),
      description: z.string().default(""),
    })
    .default({ text: "МОТИТ", href: "/", description: "" }),
  columns: z
    .array(
      z.object({
        title: z.string(),
        type: z.enum(["links", "contacts", "support"]).default("links"),
        links: z
          .array(
            z.object({
              label: z.string(),
              href: z.string(),
              external: z.boolean().default(false),
            }),
          )
          .default([]),
        contacts: z.array(contactItemSchema).default([]),
        support: supportBlockSchema.optional(),
      }),
    )
    .default([]),
  social: z.array(socialItemSchema).default([]),
  copyright: z.string().default("© Motit"),
})
export type FooterContent = z.infer<typeof footerSchema>

// ==================== ГЛАВНАЯ ====================
export const homeSchema = z.object({
  hero: z
    .object({
      title: z.string().default(""),
      subtitle: z.string().default(""),
      image_url: z.string().nullable().default(null),
      cta_label: z.string().default(""),
      cta_href: z.string().default(""),
    })
    .default({
      title: "",
      subtitle: "",
      image_url: null,
      cta_label: "",
      cta_href: "",
    }),
  content: z.any().default(null),
  seo: z
    .object({
      meta_title: z.string().default(""),
      meta_description: z.string().default(""),
    })
    .default({ meta_title: "", meta_description: "" }),
})
export type HomeContent = z.infer<typeof homeSchema>

// ==================== Дефолты ====================
export const DEFAULT_HEADER: HeaderContent = headerSchema.parse({})
export const DEFAULT_FOOTER: FooterContent = footerSchema.parse({})
export const DEFAULT_HOME: HomeContent = homeSchema.parse({})