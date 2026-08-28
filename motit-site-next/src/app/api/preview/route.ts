import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug");
  const uid = searchParams.get("uid");
  const locale = searchParams.get("locale");
  const status = searchParams.get("status");

  console.log('🔍 ===== PREVIEW REQUEST =====');
  console.log('🔍 Secret from URL:', secret);
  console.log('🔍 Expected secret:', process.env.PREVIEW_SECRET);
  console.log('🔍 Secret match:', secret === process.env.PREVIEW_SECRET);
  console.log('🔍 Slug:', slug);
  console.log('🔍 UID:', uid);
  console.log('🔍 Status:', status);
  console.log('🔍 ===========================');

  // ✅ Проверяем, что секрет существует
  if (!process.env.PREVIEW_SECRET) {
    console.error('❌ PREVIEW_SECRET is not defined in .env.local');
    return new Response("Preview secret not configured", { status: 500 });
  }

  // Проверка секрета
  if (secret !== process.env.PREVIEW_SECRET) {
    console.error('❌ Invalid token!');
    return new Response("Invalid token", { status: 401 });
  }

  console.log('✅ Token valid!');

  // Определяем тип контента
  const contentType = uid?.split(".").pop();
  
  // Включаем или выключаем Draft Mode
  const draft = await draftMode();
  if (status === "draft") {
    draft.enable();
    console.log('✅ Draft mode enabled');
  } else {
    draft.disable();
    console.log('✅ Draft mode disabled');
  }

  // Определяем путь для перенаправления
  let redirectPath = "/";
  
  if (contentType === "post" && slug) {
    redirectPath = `/blog/${slug}`;
  } else if (contentType === "page" && slug) {
    redirectPath = `/${slug}`;
  }

  // Добавляем локаль если есть
  if (locale && locale !== "en") {
    redirectPath = `/${locale}${redirectPath}`;
  }

  console.log('🔍 Redirecting to:', redirectPath);
  redirect(redirectPath);
};