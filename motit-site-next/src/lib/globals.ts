// src/lib/globals.ts
import { prisma } from "@/lib/prisma"
import {
  DEFAULT_HEADER,
  DEFAULT_FOOTER,
  DEFAULT_HOME,
  headerSchema,
  footerSchema,
  homeSchema,
  type HeaderContent,
  type FooterContent,
  type HomeContent,
} from "@/lib/globals-types"

export async function getHeader(): Promise<HeaderContent> {
  const row = await prisma.globalSettings.findUnique({ where: { key: "header" } })
  const parsed = headerSchema.safeParse(row?.value)
  return parsed.success ? parsed.data : DEFAULT_HEADER
}

export async function getFooter(): Promise<FooterContent> {
  const row = await prisma.globalSettings.findUnique({ where: { key: "footer" } })
  const parsed = footerSchema.safeParse(row?.value)
  return parsed.success ? parsed.data : DEFAULT_FOOTER
}

export async function getHome(): Promise<HomeContent> {
  const row = await prisma.globalSettings.findUnique({ where: { key: "home" } })
  const parsed = homeSchema.safeParse(row?.value)
  return parsed.success ? parsed.data : DEFAULT_HOME
}