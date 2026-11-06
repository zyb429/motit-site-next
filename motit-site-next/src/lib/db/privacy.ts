// src/lib/db/privacy.ts
import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getPrivacyPolicy = cache(async () => {
  return prisma.privacyPolicy.findUnique({
    where: { id: 1 },
    include: {
      file: {
        select: {
          id: true,
          url: true,
          name: true,
          mime: true,
          ext: true,
          size: true,
        },
      },
    },
  });
});