// src/app/api/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get("strapi_jwt")?.value || cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { data } = await request.json();
    if (!data || typeof data !== "object") {
      return NextResponse.json({ error: "Нет данных" }, { status: 400 });
    }

    // Получаем существующие настройки
    const existingRes = await fetch(
      `${STRAPI_URL}/api/settings?pagination[pageSize]=100`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      },
    );
    if (!existingRes.ok) {
      return NextResponse.json(
        { error: "Не удалось прочитать настройки" },
        { status: existingRes.status },
      );
    }
    const existing = await existingRes.json();
    const byKey = new Map<string, any>();
    for (const item of existing.data || []) {
      byKey.set(item.key, item);
    }

    // Создаём или обновляем по ключу
    for (const [key, value] of Object.entries(data)) {
      const item = byKey.get(key);
      const payload = { data: { key, value: String(value ?? "") } };

      const url = item
        ? `${STRAPI_URL}/api/settings/${item.documentId ?? item.id}`
        : `${STRAPI_URL}/api/settings`;

      const method = item ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return NextResponse.json(
          { error: err.error?.message || `Ошибка сохранения: ${key}` },
          { status: res.status },
        );
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
