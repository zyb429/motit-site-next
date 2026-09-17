// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

function getRedirectForRole(roleName: string): string {
  const r = roleName.toLowerCase();
  if (r === "admin" || r === "worker") return "/admin";
  if (r === "statistics") return "/stats";
  if (r === "client" || r === "authenticated") return "/account";
  return "/account";
}

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();

    // 1. Логин в Strapi
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

    // 2. Получаем роль
    let roleName = "authenticated";
    try {
      const meRes = await fetch(`${STRAPI_URL}/api/users/me?populate[role]=*`, {
        headers: { Authorization: `Bearer ${data.jwt}` },
        cache: "no-store",
      });
      if (meRes.ok) {
        const me = await meRes.json();
        roleName = me?.role?.name ?? me?.role?.type ?? "authenticated";
      }
    } catch (e) {
      console.warn(
        "[Login] failed to fetch role, default to authenticated:",
        e,
      );
    }

    const redirectTo = getRedirectForRole(roleName);

    // 3. Ответ + cookie
    const res = NextResponse.json({
      success: true,
      redirectTo,
      user: {
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        full_name: data.user.full_name,
        role: roleName,
      },
    });

    res.cookies.set("strapi_jwt", data.jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    console.log(
      `[Login] user=${data.user.username} role=${roleName} → ${redirectTo}`,
    );

    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Ошибка сервера" }, { status: 500 });
  }
}
