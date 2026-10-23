// src/app/api/admin/languages/[id]/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },  // ← Promise
) {
  const { id: idStr } = await params                    // ← await
  const id = Number(idStr)
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Некорректный id" }, { status: 400 })
  }

  const body = (await req.json()) as {
    enabled?: boolean
    label?: string
    sortOrder?: number
  }

  const data: { enabled?: boolean; label?: string; sortOrder?: number } = {}
  if (typeof body.enabled === "boolean") data.enabled = body.enabled
  if (typeof body.label === "string") data.label = body.label.trim()
  if (typeof body.sortOrder === "number") data.sortOrder = body.sortOrder

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Нет полей для обновления" }, { status: 400 })
  }

  try {
    const updated = await prisma.codeLanguage.update({
      where: { id },
      data,
    })
    return NextResponse.json(updated)
  } catch (e: unknown) {
    const err = e as { code?: string }
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Язык не найден" }, { status: 404 })
    }
    console.error("[admin/languages/:id] PATCH failed:", e)
    return NextResponse.json({ error: "Ошибка обновления" }, { status: 500 })
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },  // ← Promise
) {
  const { id: idStr } = await params                    // ← await
  const id = Number(idStr)
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Некорректный id" }, { status: 400 })
  }

  try {
    await prisma.codeLanguage.delete({ where: { id } })
    return new Response(null, { status: 204 })
  } catch (e: unknown) {
    const err = e as { code?: string }
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Язык не найден" }, { status: 404 })
    }
    console.error("[admin/languages/:id] DELETE failed:", e)
    return NextResponse.json({ error: "Ошибка удаления" }, { status: 500 })
  }
}