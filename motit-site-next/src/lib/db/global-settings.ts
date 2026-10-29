import { prisma } from "@/lib/prisma";
import type { Prisma } from "@generated/prisma";

export async function getGlobalSetting<T = unknown>(
  key: string,
  fallback: T,
): Promise<T> {
  const row = await prisma.globalSettings.findUnique({ where: { key } });
  return (row?.value as T) ?? fallback;
}

export async function setGlobalSetting(
  key: string,
  value: Prisma.InputJsonValue,
) {
  return prisma.globalSettings.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function getPostsPerPage(): Promise<number> {
  const v = await getGlobalSetting<number | string>("posts_per_page", 6);
  const n = typeof v === "number" ? v : parseInt(String(v), 10);
  return isNaN(n) || n < 1 ? 6 : n;
}