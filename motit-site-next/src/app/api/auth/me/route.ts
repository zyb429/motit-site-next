// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

export async function GET(request: NextRequest) {
  try {
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

    console.log(
      `[API Auth] Fetching user from Strapi: ${STRAPI_URL}/api/users/me`,
    );

    const response = await fetch(
      `${STRAPI_URL}/api/users/me?populate[role]=*&populate[avatar]=*`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-cache",
      },
    );

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
    console.log(
      `[API Auth] User found: ${user.username || user.email}, role:`,
      user.role?.name ?? user.role?.type ?? user.role,
    );

    // ✅ Приводим URL аватара к абсолютному
    const MEDIA_BASE =
      process.env.NEXT_PUBLIC_MEDIA_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:1337";

    const rawAvatar: string | null = user.avatar?.url ?? null;
    const avatarUrl = rawAvatar
      ? rawAvatar.startsWith("http://") || rawAvatar.startsWith("https://")
        ? rawAvatar
        : `${MEDIA_BASE}${rawAvatar.startsWith("/") ? "" : "/"}${rawAvatar}`
      : null;

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name || user.username,
        firstname: user.firstname || user.username,
        lastname: user.lastname || "",
        phone: user.phone ?? null,
        bio: user.bio ?? null,
        avatar_url: avatarUrl,
        role: user.role
          ? {
              id: user.role.id,
              name: user.role.name,
              type: user.role.type,
            }
          : null,
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
