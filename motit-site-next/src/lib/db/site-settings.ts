import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getSiteSettings = cache(async () => {
  const s = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  if (!s) {
    throw new Error(
      "SiteSettings не создан. Выполните: npx prisma db seed",
    );
  }
  return s;
});