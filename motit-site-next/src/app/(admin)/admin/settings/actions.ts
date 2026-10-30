"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { CUSTOM_SOCIAL_VALUE } from "@/lib/social-options";

type Result = { ok?: boolean; error?: string };

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) throw new Error("Forbidden");
}

async function updateSite(
  id: number,
  data: Record<string, unknown>,
): Promise<Result> {
  try {
    await requireAdmin();
    await prisma.siteSettings.update({ where: { id }, data });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function updateGeneralSettings(
  _: unknown,
  fd: FormData,
): Promise<Result> {
  return updateSite(Number(fd.get("id")), {
    siteName: String(fd.get("siteName") ?? ""),
    description: String(fd.get("description") ?? ""),
    language: String(fd.get("language") ?? "ru"),
    timezone: String(fd.get("timezone") ?? "Europe/Minsk"),
  });
}

export async function updateContacts(
  _: unknown,
  fd: FormData,
): Promise<Result> {
  return updateSite(Number(fd.get("id")), {
    contactEmail: String(fd.get("contactEmail") ?? ""),
    contactPhone: String(fd.get("contactPhone") ?? ""),
    address: String(fd.get("address") ?? ""),
    workHours: String(fd.get("workHours") ?? ""),
  });
}

export async function updateSocial(
  _: unknown,
  fd: FormData,
): Promise<Result> {
  const raw = String(fd.get("socialLinks") ?? "{}");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "Некорректный JSON" };
  }
  return updateSite(Number(fd.get("id")), { socialLinks: parsed });
}

/**
 * Сохраняет пользовательские соцсети в GlobalSettings.social_options.
 * Формат: [{ label, value, icon? }, ...]
 *
 * FormData:
 *  - id — id SiteSettings (не используется, оставлен для совместимости)
 *  - items — JSON-массив существующих элементов
 *  - newItem — JSON одного нового элемента
 */
export async function updateSocialOptions(fd: FormData): Promise<Result> {
  try {
    await requireAdmin();

    type Item = { label: string; value: string; icon?: string };
    const items: Item[] = [];

    const rawItems = fd.get("items");
    if (typeof rawItems === "string") {
      try {
        const parsed = JSON.parse(rawItems);
        if (Array.isArray(parsed)) {
          for (const o of parsed) {
            if (
              !o ||
              typeof o.label !== "string" ||
              typeof o.value !== "string"
            ) {
              continue;
            }
            const value = o.value.trim();
            if (!value || value === CUSTOM_SOCIAL_VALUE) continue;
            items.push({
              label: o.label.trim(),
              value,
              icon:
                typeof o.icon === "string" && o.icon.trim()
                  ? o.icon.trim()
                  : undefined,
            });
          }
        }
      } catch {
        // ignore
      }
    }

    const rawNew = fd.get("newItem");
    if (typeof rawNew === "string") {
      try {
        const o = JSON.parse(rawNew);
        if (
          o &&
          typeof o.label === "string" &&
          typeof o.value === "string" &&
          o.label.trim() &&
          o.value.trim() &&
          o.value.trim() !== CUSTOM_SOCIAL_VALUE &&
          !items.some((it) => it.value === o.value.trim())
        ) {
          items.push({
            label: o.label.trim(),
            value: o.value.trim(),
            icon:
              typeof o.icon === "string" && o.icon.trim()
                ? o.icon.trim()
                : undefined,
          });
        }
      } catch {
        // ignore
      }
    }

    await prisma.globalSettings.upsert({
      where: { key: "social_options" },
      update: { value: items },
      create: { key: "social_options", value: items },
    });

    revalidatePath("/admin/settings/social");
    revalidatePath("/admin/settings/puck-footer");
    revalidatePath("/", "layout");

    return { ok: true };
  } catch (e) {
    console.error("[updateSocialOptions]", e);
    return {
      error: e instanceof Error ? e.message : "Не удалось сохранить соцсети",
    };
  }
}

export async function updateSeo(_: unknown, fd: FormData): Promise<Result> {
  return updateSite(Number(fd.get("id")), {
    seoTitle: String(fd.get("seoTitle") ?? ""),
    seoDescription: String(fd.get("seoDescription") ?? ""),
    seoKeywords: String(fd.get("seoKeywords") ?? ""),
    ogImageUrl: String(fd.get("ogImageUrl") ?? ""),
    robots: String(fd.get("robots") ?? "index,follow"),
  });
}

export async function updateAnalytics(
  _: unknown,
  fd: FormData,
): Promise<Result> {
  return updateSite(Number(fd.get("id")), {
    analyticsGaId: String(fd.get("analyticsGaId") ?? ""),
    analyticsYmId: String(fd.get("analyticsYmId") ?? ""),
  });
}

export async function updateNotifications(
  _: unknown,
  fd: FormData,
): Promise<Result> {
  const raw = String(fd.get("notificationEmails") ?? "[]");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "Некорректный JSON" };
  }
  return updateSite(Number(fd.get("id")), { notificationEmails: parsed });
}

export async function updateAppearance(
  _: unknown,
  fd: FormData,
): Promise<Result> {
  return updateSite(Number(fd.get("id")), {
    logoUrl: String(fd.get("logoUrl") ?? ""),
    faviconUrl: String(fd.get("faviconUrl") ?? ""),
    accentColor: String(fd.get("accentColor") ?? "#6366f1"),
  });
}