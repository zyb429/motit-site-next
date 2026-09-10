// src/app/api/posts/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const userToken =
      cookieStore.get("strapi_jwt")?.value || cookieStore.get("token")?.value;

    if (!userToken) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const body = await request.json();
    const { post_status } = body;

    console.log("🔄 PATCH post status:", id, "→", post_status);

    const data: any = { post_status };

    // Strapi v5: publishedAt управляет публикацией
    if (post_status === "published") {
      data.publishedAt = new Date().toISOString();
    } else {
      data.publishedAt = null;
    }

    const response = await fetch(`${STRAPI_URL}/api/posts/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ data }),
    });

    const result = await response.json();
    console.log("📥 Strapi status update:", response.status, result);

    if (!response.ok) {
      return NextResponse.json(
        { error: result.error?.message || "Ошибка обновления статуса" },
        { status: response.status },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Status update error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}
