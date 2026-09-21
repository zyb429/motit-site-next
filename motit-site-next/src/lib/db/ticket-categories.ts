// src/lib/db/ticket-categories.ts
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export async function listTicketCategories(params?: {
  includeInactive?: boolean;
}) {
  return prisma.ticket_categories.findMany({
    where: params?.includeInactive ? {} : { is_active: true },
    orderBy: [{ sort_order: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { tickets: true } },
    },
  });
}

export async function getTicketCategoryBySlug(slug: string) {
  return prisma.ticket_categories.findFirst({
    where: { slug, is_active: true },
  });
}

export async function getTicketCategoryByUuid(uuid: string) {
  return prisma.ticket_categories.findUnique({ where: { uuid } });
}

export async function createTicketCategory(params: {
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  sortOrder?: number;
}) {
  return prisma.ticket_categories.create({
    data: {
      uuid: randomUUID(),
      name: params.name,
      slug: params.slug,
      description: params.description ?? null,
      icon: params.icon ?? null,
      sort_order: params.sortOrder ?? 0,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });
}

export async function updateTicketCategory(
  uuid: string,
  data: {
    name?: string;
    slug?: string;
    description?: string | null;
    icon?: string | null;
    sortOrder?: number;
    isActive?: boolean;
  },
) {
  return prisma.ticket_categories.update({
    where: { uuid },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.icon !== undefined && { icon: data.icon }),
      ...(data.sortOrder !== undefined && { sort_order: data.sortOrder }),
      ...(data.isActive !== undefined && { is_active: data.isActive }),
      updated_at: new Date(),
    },
  });
}

export async function deleteTicketCategory(uuid: string) {
  return prisma.ticket_categories.delete({ where: { uuid } });
}
