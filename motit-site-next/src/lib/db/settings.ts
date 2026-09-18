import { prisma } from "@/lib/prisma";

export async function getSettingPrisma(key: string): Promise<string | null> {
  const s = await prisma.settings.findFirst({ where: { key } });
  return s?.value ?? null;
}

export async function getAllSettingsPrisma(): Promise<Record<string, string>> {
  const rows = await prisma.settings.findMany();
  const out: Record<string, string> = {};
  for (const s of rows) {
    if (s.key) out[s.key] = s.value ?? "";
  }
  return out;
}

export async function getPostsPerPagePrisma(): Promise<number> {
  const v = await getSettingPrisma("posts_per_page");
  const n = parseInt(v ?? "6", 10);
  return isNaN(n) || n < 1 ? 6 : n;
}
