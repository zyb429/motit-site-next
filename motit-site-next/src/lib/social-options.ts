export type SocialOption = {
  label: string;
  value: string;
  icon?: string;
};

export const DEFAULT_SOCIAL_OPTIONS: SocialOption[] = [
  { label: "Telegram", value: "telegram" },
  { label: "VK", value: "vk" },
  { label: "YouTube", value: "youtube" },
  { label: "GitHub", value: "github" },
  { label: "LinkedIn", value: "linkedin" },
  { label: "Twitter / X", value: "twitter" },
  { label: "Instagram", value: "instagram" },
  { label: "Facebook", value: "facebook" },
  { label: "Twitch", value: "twitch" },
  { label: "RSS", value: "rss" },
  { label: "Поддержка", value: "support" },
];

export const CUSTOM_SOCIAL_VALUE = "__custom__";

export function mergeSocialOptions(custom: unknown): SocialOption[] {
  const map = new Map<string, SocialOption>();
  for (const o of DEFAULT_SOCIAL_OPTIONS) map.set(o.value, o);

  if (Array.isArray(custom)) {
    for (const o of custom) {
      if (
        o &&
        typeof o === "object" &&
        typeof (o as { value?: unknown }).value === "string" &&
        (o as { value: string }).value !== CUSTOM_SOCIAL_VALUE
      ) {
        const value = (o as { value: string }).value;
        const label =
          typeof (o as { label?: unknown }).label === "string"
            ? (o as { label: string }).label
            : value;
        const icon =
          typeof (o as { icon?: unknown }).icon === "string" &&
          (o as { icon: string }).icon.trim()
            ? (o as { icon: string }).icon.trim()
            : undefined;
        map.set(value, { label, value, icon });
      }
    }
  }

  return Array.from(map.values());
}
