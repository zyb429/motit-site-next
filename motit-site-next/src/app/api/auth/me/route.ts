// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

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

    if (!token) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    // ✅ Логируем запрос к Strapi
    console.log(
      `[API Auth] Fetching user from Strapi: ${STRAPI_URL}/api/users/me`,
    );

    const response = await fetch(`${STRAPI_URL}/api/users/me?populate=*`, {
      headers: {
        Authorization: `Bearer ${token}`,
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

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name || user.username, // Используем full_name
        firstname: user.firstname || user.username,
        lastname: user.lastname || "",
      },
    });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка", code: "SERVER_ERROR" },
      { status: 500 },
    );
  }
}
