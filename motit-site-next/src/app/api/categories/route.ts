import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sort = searchParams.get("sort") || "name:asc";
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("pageSize") || "100";

    // Получаем токен из cookies
    const cookieStore = await cookies();
    const token =
      cookieStore.get("strapi_jwt")?.value || cookieStore.get("token")?.value;

    // Формируем заголовки
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Запрашиваем категории из Strapi
    const response = await fetch(
      `${STRAPI_URL}/api/categories?sort=${sort}&pagination[page]=${page}&pagination[pageSize]=${pageSize}`,
      {
        headers,
        cache: "no-store", // Отключаем кеш для разработки
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Strapi error:", data);
      return NextResponse.json(
        { error: data.error?.message || "Ошибка получения категорий" },
        { status: response.status },
      );
    }

    // Возвращаем данные в формате, который ожидает фронтенд
    return NextResponse.json({
      data: data.data || [],
      meta: data.meta || {},
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}
