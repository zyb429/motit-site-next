// src/app/api/admin/globals/[key]/route.ts
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import {
  DEFAULT_HEADER,
  DEFAULT_FOOTER,
  DEFAULT_HOME,
  headerSchema,
  footerSchema,
  homeSchema,
} from "@/lib/globals-types"

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
  const user = await getCurrentUser()
  if (!user) return new NextResponse("Unauthorized", { status: 401 })

  const { key } = await params
  if (!isKey(key)) return new NextResponse("Not found", { status: 404 })

  const row = await prisma.globalSettings.findUnique({ where: { key } })
  const parsed = SCHEMAS[key].safeParse(row?.value ?? DEFAULTS[key])
  return NextResponse.json(parsed.success ? parsed.data : DEFAULTS[key])
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const user = await getCurrentUser()
  if (!user) return new NextResponse("Unauthorized", { status: 401 })

  const { key } = await params
  if (!isKey(key)) return new NextResponse("Not found", { status: 404 })

  const body = await req.json()
  const parsed = SCHEMAS[key].safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", issues: parsed.error.issues },
      { status: 400 },
    )
  }

  const userId = typeof user.id === "number" ? user.id : Number(user.id)

  await prisma.globalSettings.upsert({
    where: { key },
    create: {
      key,
      value: parsed.data,
      updated_by_id: Number.isFinite(userId) ? userId : null,
    },
    update: {
      value: parsed.data,
      updated_by_id: Number.isFinite(userId) ? userId : null,
    },
  })

  // Сбрасываем кэш всего сайта — хедер/футер в layout, главная на /
  revalidatePath("/", "layout")

  return NextResponse.json({ ok: true, data: parsed.data })
}