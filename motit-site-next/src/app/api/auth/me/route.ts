import { NextRequest, NextResponse } from "next/server";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

export async function GET(request: NextRequest) {
  try {
    // Получаем токен из cookies или заголовков
    const token = request.cookies.get("strapi_jwt")?.value;

    if (!token) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    // Запрашиваем пользователя из Strapi
    const response = await fetch(`${STRAPI_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    });

    if (!response.ok) {
      const errorResponse = NextResponse.json(
        {
          error:
            response.status === 401 ? "Сессия истекла" : "Ошибка авторизации",
          code: response.status === 401 ? "SESSION_EXPIRED" : "AUTH_ERROR",
          status: response.status,
        },
        { status: response.status },
      );

      if (response.status === 401) {
        errorResponse.cookies.delete("strapi_jwt");
        errorResponse.cookies.delete("token");
      }

      return errorResponse;
    }

    const user = await response.json();
    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstname: user.firstname || user.username,
        lastname: user.lastname || "",
        full_name:
          user.full_name ||
          `${user.firstname || ""} ${user.lastname || ""}`.trim(),
        avatar: user.avatar || null,
        role: user.role || null,
      },
      token: token,
    });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка", code: "SERVER_ERROR" },
      { status: 500 },
    );
  }
}
