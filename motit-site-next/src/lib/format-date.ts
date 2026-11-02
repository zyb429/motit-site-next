// src/lib/format-date.ts
import type { AdminLanguageCode, LanguageCode } from "./i18n";

const LOCALE_TAG: Record<LanguageCode | AdminLanguageCode, string> = {
  ru: "ru-RU",
  en: "en-US",
  be: "be-BY",
};

export function formatDateTime(
  date: Date | string | null | undefined,
  timeZone: string,
  locale: LanguageCode | AdminLanguageCode = "ru",
  opts?: Intl.DateTimeFormatOptions,
): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(LOCALE_TAG[locale], {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    ...opts,
  }).format(d);
}