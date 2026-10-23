// src/app/api/globals/[key]/route.ts
import { NextResponse } from "next/server"
import {
  DEFAULT_HEADER,
  DEFAULT_FOOTER,
  DEFAULT_HOME,
  headerSchema,
  footerSchema,
  homeSchema,
} from "@/lib/globals-types"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

const SCHEMAS = {
  header: headerSchema,
  footer: footerSchema,
  home: homeSchema,
} as const

const DEFAULTS = {
  header: DEFAULT_HEADER,
  footer: DEFAULT_FOOTER,
  home: DEFAULT_HOME,
} as const

type Key = keyof typeof SCHEMAS

function isKey(k: string): k is Key {
  return k in SCHEMAS
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params
  if (!isKey(key)) {
    return NextResponse.json({ error: "Unknown key" }, { status: 404 })
  }

  const row = await prisma.globalSettings.findUnique({ where: { key } })
  const parsed = SCHEMAS[key].safeParse(row?.value ?? DEFAULTS[key])
  return NextResponse.json(parsed.success ? parsed.data : DEFAULTS[key])
}