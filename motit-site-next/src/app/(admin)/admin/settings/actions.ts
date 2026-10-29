"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";

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