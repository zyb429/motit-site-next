"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { CUSTOM_SOCIAL_VALUE } from "@/lib/social-options";
import { isAdminLanguage, isLanguage, isTimezone } from "@/lib/i18n";
import { logActivity } from "@/lib/activity";

type Result = { ok?: boolean; error?: string };

type SettingsSection =
  | "general"
  | "contacts"
  | "social"
  | "social_options"
  | "seo"
  | "analytics"
  | "notifications"
  | "appearance";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) throw new Error("Forbidden");
  return user;
}

async function updateSite(
  id: number,
  data: Record<string, unknown>,
  section: SettingsSection,
): Promise<Result> {
  try {
    const user = await requireAdmin();
    await prisma.siteSettings.update({ where: { id }, data });

    await logActivity({
      actorUuid: user.uuid,
      targetType: "settings",
      action: "update",
      meta: {
        section,
        fields: Object.keys(data),
      },
    });

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
  const siteLocaleRaw = String(fd.get("siteLocale") ?? "");
  const adminLocaleRaw = String(fd.get("adminLocale") ?? "");
  const timezoneRaw = String(fd.get("timezone") ?? "");

  if (!isLanguage(siteLocaleRaw)) {
    return { error: "Некорректный язык публичного сайта" };
  }
  if (!isAdminLanguage(adminLocaleRaw)) {
    return { error: "Некорректный язык админки" };
  }
  if (!isTimezone(timezoneRaw)) {
    return { error: "Некорректный часовой пояс" };
  }

  return updateSite(
    Number(fd.get("id")),
    {
      siteName: String(fd.get("siteName") ?? ""),
      description: String(fd.get("description") ?? ""),
      language: siteLocaleRaw,
      siteLocale: siteLocaleRaw,
      adminLocale: adminLocaleRaw,
      timezone: timezoneRaw,
    },
    "general",
  );
}

export async function updateContacts(
  _: unknown,
  fd: FormData,
): Promise<Result> {
  let contactEmails: { email: string; comment?: string }[] | null = null;

  const rawEmails = fd.get("contactEmails");
  if (typeof rawEmails === "string" && rawEmails.trim()) {
    try {
      const parsed = JSON.parse(rawEmails);
      if (Array.isArray(parsed)) {
        contactEmails = parsed
          .filter(
            (o) =>
              o &&
              typeof o === "object" &&
              typeof o.email === "string" &&
              o.email.trim(),
          )
          .map((o) => ({
            email: String(o.email).trim(),
            ...(typeof o.comment === "string" && o.comment.trim()
              ? { comment: o.comment.trim() }
              : {}),
          }));
      }
    } catch {
      return { error: "Некорректный JSON в email-адресах" };
    }
  }

  let contactPhones: { phone: string; comment?: string }[] | null = null;

  const rawPhones = fd.get("contactPhones");
  if (typeof rawPhones === "string" && rawPhones.trim()) {
    try {
      const parsed = JSON.parse(rawPhones);
      if (Array.isArray(parsed)) {
        contactPhones = parsed
          .filter(
            (o) =>
              o &&
              typeof o === "object" &&
              typeof o.phone === "string" &&
              o.phone.trim(),
          )
          .map((o) => ({
            phone: String(o.phone).trim(),
            ...(typeof o.comment === "string" && o.comment.trim()
              ? { comment: o.comment.trim() }
              : {}),
          }));
      }
    } catch {
      return { error: "Некорректный JSON в телефонах" };
    }
  }

  let addresses: { address: string; comment?: string }[] | null = null;

  const rawAddresses = fd.get("addresses");
  if (typeof rawAddresses === "string" && rawAddresses.trim()) {
    try {
      const parsed = JSON.parse(rawAddresses);
      if (Array.isArray(parsed)) {
        addresses = parsed
          .filter(
            (o) =>
              o &&
              typeof o === "object" &&
              typeof o.address === "string" &&
              o.address.trim(),
          )
          .map((o) => ({
            address: String(o.address).trim(),
            ...(typeof o.comment === "string" && o.comment.trim()
              ? { comment: o.comment.trim() }
              : {}),
          }));
      }
    } catch {
      return { error: "Некорректный JSON в адресах" };
    }
  }

  return updateSite(
    Number(fd.get("id")),
    {
      contactEmail: contactEmails?.[0]?.email ?? "",
      contactEmails,
      contactPhone: contactPhones?.[0]?.phone ?? "",
      contactPhones,
      address: addresses?.[0]?.address ?? "",
      addresses,
      workHours: String(fd.get("workHours") ?? ""),
    },
    "contacts",
  );
}

export async function updateSocial(_: unknown, fd: FormData): Promise<Result> {
  const raw = String(fd.get("socialLinks") ?? "{}");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "Некорректный JSON" };
  }
  return updateSite(Number(fd.get("id")), { socialLinks: parsed }, "social");
}

export async function updateSocialOptions(fd: FormData): Promise<Result> {
  try {
    const user = await requireAdmin();

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

    await logActivity({
      actorUuid: user.uuid,
      targetType: "settings",
      action: "update",
      meta: {
        section: "social_options",
        count: items.length,
      },
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
  const ogImageSvgRaw = String(fd.get("ogImageSvg") ?? "");
  const trimmed = ogImageSvgRaw.trim();
  const ogImageSvg = trimmed.toLowerCase().startsWith("<svg") ? trimmed : null;

  return updateSite(
    Number(fd.get("id")),
    {
      seoTitle: String(fd.get("seoTitle") ?? ""),
      seoDescription: String(fd.get("seoDescription") ?? ""),
      seoKeywords: String(fd.get("seoKeywords") ?? ""),
      ogImageUrl: String(fd.get("ogImageUrl") ?? ""),
      ogImageSvg,
      robots: String(fd.get("robots") ?? "index,follow"),
    },
    "seo",
  );
}

export async function updateAnalytics(
  _: unknown,
  fd: FormData,
): Promise<Result> {
  return updateSite(
    Number(fd.get("id")),
    {
      analyticsGaId: String(fd.get("analyticsGaId") ?? ""),
      analyticsYmId: String(fd.get("analyticsYmId") ?? ""),
    },
    "analytics",
  );
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
  return updateSite(
    Number(fd.get("id")),
    { notificationEmails: parsed },
    "notifications",
  );
}

export async function updateAppearance(
  _: unknown,
  fd: FormData,
): Promise<Result> {
  const faviconSvgRaw = String(fd.get("faviconSvg") ?? "");
  const trimmed = faviconSvgRaw.trim();
  const faviconSvg = trimmed.toLowerCase().startsWith("<svg") ? trimmed : null;

  return updateSite(
    Number(fd.get("id")),
    {
      logoLightUrl: String(fd.get("logoLightUrl") ?? ""),
      logoDarkUrl: String(fd.get("logoDarkUrl") ?? ""),
      faviconUrl: String(fd.get("faviconUrl") ?? ""),
      faviconSvg,
    },
    "appearance",
  );
}
