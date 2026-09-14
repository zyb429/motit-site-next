import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const strapiJwt = cookieStore.get("strapi_jwt")?.value;

  if (!strapiJwt) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  // Получаем текущего пользователя, чтобы знать его ID
  const meRes = await fetch(`${STRAPI_URL}/api/users/me`, {
    headers: { Authorization: `Bearer ${strapiJwt}` },
    cache: "no-store",
  });

  if (!meRes.ok) {
    return NextResponse.json({ error: "Не удалось получить пользователя" }, { status: 401 });
  }

  const me = await meRes.json();

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "Файл не найден" }, { status: 400 });
  }

  const strapiFormData = new FormData();
  strapiFormData.append("files", file);
  strapiFormData.append("ref", "plugin::users-permissions.user");
  strapiFormData.append("refId", String(me.id));
  strapiFormData.append("field", "avatar");

  const uploadRes = await fetch(`${STRAPI_URL}/api/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${strapiJwt}` },
    body: strapiFormData,
  });

  const data = await uploadRes.json().catch(() => null);

  if (!uploadRes.ok) {
    return NextResponse.json(
      { error: data?.error?.message || "Ошибка загрузки" },
      { status: uploadRes.status },
    );
  }

  return NextResponse.json(data);
}