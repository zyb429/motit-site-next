// src/lib/db/puck.ts
import type { Data } from "@puckeditor/core";
import { prisma } from "@/lib/prisma";

const EMPTY: Data = { content: [], root: { props: {} }, zones: {} };

export async function getPuckDoc(key: string): Promise<Data> {
  const row = await prisma.globalSettings.findUnique({ where: { key } });
  if (!row?.value) return EMPTY;
  const v = row.value as any;
  if (!Array.isArray(v?.content)) return EMPTY;
  return {
    content: v.content,
    root: v.root ?? { props: {} },
    zones: v.zones ?? {},
  };
}

export async function savePuckDoc(
  key: string,
  data: Data,
  updatedById?: number | null,
) {
  return prisma.globalSettings.upsert({
    where: { key },
    create: { key, value: data as any, updated_by_id: updatedById ?? null },
    update: { value: data as any, updated_by_id: updatedById ?? null },
  });
}