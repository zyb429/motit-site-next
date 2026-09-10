import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userToken =
      cookieStore.get("strapi_jwt")?.value || cookieStore.get("token")?.value;

    console.log("🔑 Токен пользователя:", userToken ? "есть" : "нет");

    if (!userToken) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const body = await request.json();
    console.log("📝 Получены данные:", JSON.stringify(body, null, 2));

    if (!body.data) {
      return NextResponse.json(
        { error: "Отсутствуют данные поста" },
        { status: 400 },
      );
    }

    // ✅ Формируем данные
    const postData: any = {
      title: body.data.title,
      slug: body.data.slug || generateUniqueSlug(body.data.title),
      content:
        typeof body.data.content === "string"
          ? body.data.content
          : JSON.stringify(body.data.content),
      excerpt: body.data.excerpt || "",
      post_status: body.data.post_status || "published",
    };

    // ✅ Обработка категории (поле category из формы → categories для Strapi)
    if (body.data.category) {
      const categoryId = body.data.category;

      // Получаем documentId категории
      const catResponse = await fetch(
        `${STRAPI_URL}/api/categories/${categoryId}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        },
      );

      if (catResponse.ok) {
        const catData = await catResponse.json();
        const categoryDocumentId = catData.data?.documentId;

        console.log("🔍 Category documentId:", categoryDocumentId);

        if (categoryDocumentId) {
          // ✅ Используем set с documentId (правильно для Strapi v5)
          postData.categories = {
            set: [{ documentId: categoryDocumentId }],
          };
          console.log("🔄 Категория (set с documentId):", postData.categories);
        }
      } else {
        const errorText = await catResponse.text();
        console.error("❌ Category fetch error:", errorText);
      }
    }

    // ✅ Добавляем publishedAt
    if (postData.post_status === "published") {
      postData.publishedAt = new Date().toISOString();
    }

    console.log(
      "🚀 Отправка в Strapi:",
      JSON.stringify({ data: postData }, null, 2),
    );

    const response = await fetch(`${STRAPI_URL}/api/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ data: postData }),
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

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function generateUniqueSlug(title: string): string {
  const baseSlug = generateSlug(title);
  const timestamp = Date.now();
  return `${baseSlug}-${timestamp}`;
}
