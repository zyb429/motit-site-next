// src/app/api/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
    }

    const { data } = await request.json();
    if (!data || typeof data !== "object") {
      return NextResponse.json({ error: "Нет данных" }, { status: 400 });
    }

    for (const [key, value] of Object.entries(data)) {
      const strValue = String(value ?? "");
      const existing = await prisma.settings.findFirst({ where: { key } });

      if (existing) {
        await prisma.settings.update({
          where: { id: existing.id },
          data: { value: strValue },
        });
      } else {
        await prisma.settings.create({
          data: { key, value: strValue },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/settings] error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}
