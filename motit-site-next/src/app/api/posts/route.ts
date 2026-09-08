import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

export async function POST(request: NextRequest) {
  try {
    // Получаем токен пользователя из cookies
    const cookieStore = await cookies();
    const userToken =
      cookieStore.get("strapi_jwt")?.value || cookieStore.get("token")?.value;

    console.log("🔑 Токен пользователя:", userToken ? "есть" : "нет");

    if (!userToken) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const body = await request.json();
    console.log("📝 Получены данные:", JSON.stringify(body, null, 2));

    if (body.data && body.data.categories) {
      if (Array.isArray(body.data.categories)) {
        body.data.categories = {
          connect: body.data.categories,
        };
        console.log(
          "🔄 Преобразованы категории из массива в connect:",
          body.data.categories,
        );
      } else if (
        typeof body.data.categories === "object" &&
        body.data.categories.connect
      ) {
        console.log(
          "✅ Категории уже в правильном формате:",
          body.data.categories,
        );
      } else if (typeof body.data.categories === "number") {
        body.data.categories = {
          connect: [body.data.categories],
        };
        console.log(
          "🔄 Преобразована категория из числа в connect:",
          body.data.categories,
        );
      }
    }

    console.log("🚀 Отправка в Strapi:", JSON.stringify(body, null, 2));

    // Отправляем в Strapi с токеном пользователя
    const response = await fetch(`${STRAPI_URL}/api/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`, // ← Используем токен пользователя
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    console.log("📥 Ответ Strapi:", JSON.stringify(result, null, 2));

    if (!response.ok) {
      return NextResponse.json(
        { error: result.error?.message || "Ошибка создания поста" },
        { status: response.status },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}
