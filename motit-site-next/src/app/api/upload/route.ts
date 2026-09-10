// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userToken = cookieStore.get("strapi_jwt")?.value;

    if (!userToken) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("files") as File;

    if (!file) {
      return NextResponse.json({ error: "Файл не найден" }, { status: 400 });
    }

    // Отправляем в Strapi
    const strapiFormData = new FormData();
    strapiFormData.append("files", file);

    const response = await fetch(`${STRAPI_URL}/api/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
      body: strapiFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Strapi upload error:", errorText);
      return NextResponse.json(
        { error: "Ошибка загрузки файла" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}
