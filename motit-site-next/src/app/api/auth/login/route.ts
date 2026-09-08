import { NextResponse } from "next/server";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();

    const response = await fetch(`${STRAPI_URL}/api/auth/local`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || "Неверные данные" },
        { status: 401 },
      );
    }

    // ✅ Создаем ответ
    const res = NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        full_name: data.user.full_name,
      },
    });

    // ✅ Устанавливаем куку
    res.cookies.set("strapi_jwt", data.jwt, {
      httpOnly: true,
      secure: false, // ⚠️ Для localhost ставим false
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    console.log("[Login] Cookie set:", data.jwt ? "✅" : "❌");

    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Ошибка сервера" }, { status: 500 });
  }
}
