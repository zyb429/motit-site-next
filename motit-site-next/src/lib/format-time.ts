/**
 * Время под сообщением. Всегда ЧЧ:ММ, независимо от даты.
 * Рендерить только на клиенте (через <ClientOnly>).
 */
export function formatMessageTime(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

/**
 * Компактное время для списка чатов.
 * Сегодня → ЧЧ:ММ, вчера → «Вчера», этот год → ДД.ММ, иначе → ДД.ММ.ГГГГ.
 * Рендерить только на клиенте.
 */
export function formatChatListTime(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const messageDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (messageDay.getTime() === today.getTime()) {
    return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  }
  if (messageDay.getTime() === yesterday.getTime()) {
    return "Вчера";
  }
  if (d.getFullYear() === now.getFullYear()) {
    return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
  }
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Дата-разделитель над группами сообщений.
 * Сегодня → «Сегодня», вчера → «Вчера»,
 * этот год → «1 октября», иначе → «1 октября 2025 г.».
 * Рендерить только на клиенте.
 */
export function formatMessageDateDivider(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const messageDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (messageDay.getTime() === today.getTime()) return "Сегодня";
  if (messageDay.getTime() === yesterday.getTime()) return "Вчера";

  if (d.getFullYear() === now.getFullYear()) {
    return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  }
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Ключ дня (YYYY-MM-DD) для группировки сообщений по датам.
 * Использует локальные компоненты — на клиенте это «день пользователя».
 */
export function dayKey(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
