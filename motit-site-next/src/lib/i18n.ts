export const LANGUAGE_VALUES = ["ru", "en", "be"] as const;
export type LanguageCode = (typeof LANGUAGE_VALUES)[number];

export const ADMIN_LANGUAGE_VALUES = ["ru", "en"] as const;
export type AdminLanguageCode = (typeof ADMIN_LANGUAGE_VALUES)[number];

export const LANGUAGE_OPTIONS: { value: LanguageCode; label: string }[] = [
  { value: "ru", label: "Русский (ru)" },
  { value: "en", label: "English (en)" },
  { value: "be", label: "Беларуская (be)" },
];

export const ADMIN_LANGUAGE_OPTIONS: {
  value: AdminLanguageCode;
  label: string;
}[] = [
  { value: "ru", label: "Русский (ru)" },
  { value: "en", label: "English (en)" },
];

export const TIMEZONE_VALUES = [
  "Europe/Minsk",
  "Europe/Moscow",
  "Europe/Kiev",
  "Europe/Warsaw",
  "Europe/Berlin",
  "Europe/London",
  "UTC",
  "Asia/Almaty",
  "Asia/Yekaterinburg",
  "Asia/Novosibirsk",
  "Asia/Vladivostok",
] as const;
export type TimezoneCode = (typeof TIMEZONE_VALUES)[number];

export const TIMEZONE_OPTIONS: {
  value: TimezoneCode;
  label: string;
}[] = [
  { value: "Europe/Minsk", label: "Минск (Europe/Minsk, UTC+3)" },
  { value: "Europe/Moscow", label: "Москва (Europe/Moscow, UTC+3)" },
  { value: "Europe/Kiev", label: "Киев (Europe/Kiev, UTC+2/3)" },
  { value: "Europe/Warsaw", label: "Варшава (Europe/Warsaw, UTC+1/2)" },
  { value: "Europe/Berlin", label: "Берлин (Europe/Berlin, UTC+1/2)" },
  { value: "Europe/London", label: "Лондон (Europe/London, UTC+0/1)" },
  { value: "UTC", label: "UTC" },
  { value: "Asia/Almaty", label: "Алматы (Asia/Almaty, UTC+5/6)" },
  { value: "Asia/Yekaterinburg", label: "Екатеринбург (Asia/Yekaterinburg, UTC+5/6)" },
  { value: "Asia/Novosibirsk", label: "Новосибирск (Asia/Novosibirsk, UTC+6/7)" },
  { value: "Asia/Vladivostok", label: "Владивосток (Asia/Vladivostok, UTC+10/11)" },
];

export function isLanguage(v: unknown): v is LanguageCode {
  return (
    typeof v === "string" &&
    (LANGUAGE_VALUES as readonly string[]).includes(v)
  );
}

export function isAdminLanguage(v: unknown): v is AdminLanguageCode {
  return (
    typeof v === "string" &&
    (ADMIN_LANGUAGE_VALUES as readonly string[]).includes(v)
  );
}

export function isTimezone(v: unknown): v is TimezoneCode {
  return typeof v === "string" && (TIMEZONE_VALUES as readonly string[]).includes(v);
}