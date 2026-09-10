// src/app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token =
      cookieStore.get("strapi_jwt")?.value || cookieStore.get("token")?.value;

    const res = await fetch(
      `${STRAPI_URL}/api/posts/${id}?populate[]=categories&populate[]=featured_image`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: "no-store",
      },
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ GET post error:", error);
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}

export async function PUT(
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

    console.log("📝 PUT post:", id, JSON.stringify(body, null, 2));

    const response = await fetch(
      `${STRAPI_URL}/api/posts/${id}/with-relations`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(body),
      },
    );

    const result = await response.json();
    console.log("📥 Strapi PUT status:", response.status, result);

    if (!response.ok) {
      return NextResponse.json(result, { status: response.status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ PUT error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}
