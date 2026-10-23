// src/app/api/languages/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  const languages = await prisma.codeLanguage.findMany({
    where: { enabled: true },
    orderBy: [{ sortOrder: "asc" }, { code: "asc" }],
    select: { code: true, label: true },
  })
  return NextResponse.json(languages)
}