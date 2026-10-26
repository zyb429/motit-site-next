// src/app/api/admin/languages/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { lowlight } from "@/lib/lowlight"

export const dynamic = "force-dynamic"

export async function GET() {
  const languages = await prisma.codeLanguage.findMany({
    orderBy: [{ sortOrder: "asc" }, { code: "asc" }],
  })
  return NextResponse.json(languages)
}

export async function POST(req: Request) {
  const body = (await req.json()) as { code?: string; label?: string }
  const code = body.code?.trim().toLowerCase()

  if (!code) {
    return NextResponse.json(
      { error: "Поле code обязательно" },
      { status: 400 },
    )
  }
  // здесь TypeScript уже знает: code: string

  const label: string = body.label?.trim() || code
  // label: string, потому что code: string

  if (!lowlight.registered(code)) {
    return NextResponse.json(
      {
        error: `Язык "${code}" не найден в highlight.js. Проверьте имя: https://github.com/highlightjs/highlight.js/tree/main/src/languages`,
      },
      { status: 400 },
    )
  }

  try {
    const created = await prisma.codeLanguage.create({
      data: { code, label, enabled: true },
    })
    return NextResponse.json(created, { status: 201 })
  } catch (e: unknown) {
    const err = e as { code?: string }
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: `Язык "${code}" уже добавлен` },
        { status: 409 },
      )
    }
    console.error("[admin/languages] POST failed:", e)
    return NextResponse.json({ error: "Ошибка сохранения" }, { status: 500 })
  }
}