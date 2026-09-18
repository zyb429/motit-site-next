import { prisma } from "@/lib/prisma";

export type CategoryItem = {
  id: number;
  name: string;
  slug: string | null;
  description: string | null;
  icon: string | null;
};

export async function getCategoriesPrisma(): Promise<CategoryItem[]> {
  const rows = await prisma.categories.findMany({
    orderBy: { name: "asc" },
  });
  return rows.map((c) => ({
    id: c.id,
    name: c.name ?? "",
    slug: c.slug ?? null,
    description: c.description ?? null,
    icon: c.icon ?? null,
  }));
}

export async function getCategoryBySlugPrisma(
  slug: string,
): Promise<CategoryItem | null> {
  const c = await prisma.categories.findFirst({ where: { slug } });
  if (!c) return null;
  return {
    id: c.id,
    name: c.name ?? "",
    slug: c.slug ?? null,
    description: c.description ?? null,
    icon: c.icon ?? null,
  };
}
