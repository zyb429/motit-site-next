// src/lib/auth.ts
import { cookies } from "next/headers";

export async function getCurrentUser() {
  try {
    // ✅ Правильный способ получить cookies в Next.js 16
    const cookieStore = await cookies();

    // Получаем конкретную куку (замените 'token' на название вашей куки)
    const token = cookieStore.get("token")?.value;

    if (!token) {
      console.log("No token found");
      return null;
    }

    // ✅ Формируем строку cookie вручную
    const cookieString = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Cookie: cookieString,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      console.log("Auth response not OK:", response.status);
      return null;
    }

    const data = await response.json();
    return data.user || data.data || null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}
