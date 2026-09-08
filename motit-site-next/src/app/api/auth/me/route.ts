// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

export async function GET(request: NextRequest) {
  try {
    // ✅ Логируем все куки
    const cookieStore = request.cookies;
    const allCookies = cookieStore.getAll();
    console.log(
      "[API Auth] All cookies:",
      allCookies.map((c) => c.name),
    );

    const token = cookieStore.get("strapi_jwt")?.value;
    console.log(`[API Auth] User token: ${token ? "✅" : "❌"}`);
    console.log(`[API Auth] API Token: ${STRAPI_API_TOKEN ? "✅" : "❌"}`);

    if (!token) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    // ✅ Логируем запрос к Strapi
    console.log(
      `[API Auth] Fetching user from Strapi: ${STRAPI_URL}/api/users/me`,
    );

    const response = await fetch(`${STRAPI_URL}/api/users/me?populate=*`, {
      headers: {
        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    });

    console.log(`[API Auth] Strapi response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`[API Auth] Strapi error: ${errorText}`);

      const errorResponse = NextResponse.json(
        { error: "Ошибка получения пользователя" },
        { status: response.status },
      );

      if (response.status === 401) {
        errorResponse.cookies.delete("strapi_jwt");
      }

      return errorResponse;
    }

    const user = await response.json();
    console.log(`[API Auth] User found: ${user.username || user.email}`);

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка", code: "SERVER_ERROR" },
      { status: 500 },
    );
  }
}
