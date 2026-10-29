// src/lib/db/settings.ts
import { prisma } from "@/lib/prisma";

export async function getAllSettingsPrisma() {
  return {
    site: await prisma.siteSettings.findUnique({ where: { id: 1 } }),
    globals: await prisma.globalSettings.findMany(),
  };
}