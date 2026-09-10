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

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userToken =
      cookieStore.get("strapi_jwt")?.value || cookieStore.get("token")?.value;

    if (!userToken) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const body = await request.json();
    console.log("POST category:", JSON.stringify(body, null, 2));

    const response = await fetch(`${STRAPI_URL}/api/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    console.log("Strapi POST category:", response.status, result);

    if (!response.ok) {
      return NextResponse.json(result, { status: response.status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("POST category error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}
