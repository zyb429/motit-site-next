import { draftMode } from "next/headers";

/**
 * Серверная функция для проверки Draft Mode
 * Используется только в Server Components
 */
export async function getDraftModeStatus(): Promise<boolean> {
  try {
    const { isEnabled } = await draftMode();
    return isEnabled;
  } catch (error) {
    // Если draftMode недоступен (например, в статическом рендере),
    // возвращаем false — это не критичная ошибка
    console.warn("[strapi] draftMode недоступен:", error);
    return false;
  }
}

/**
 * Серверная функция для получения публикационного статуса
 */
export async function getPublicationState(): Promise<'live' | 'preview'> {
  const isDraftMode = await getDraftModeStatus();
  return isDraftMode ? 'preview' : 'live';
}

/**
 * Серверная функция для получения статуса поста
 */
export async function getPostStatus(): Promise<'draft' | 'published' | 'archived' | undefined> {
  const isDraftMode = await getDraftModeStatus();
  return isDraftMode ? 'draft' : undefined;
}
