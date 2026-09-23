// src/lib/db/tickets.ts
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";

const ticketInclude = {
  statuses: true,
  priorities: true,
  client: {
    select: {
      id: true,
      uuid: true,
      username: true,
      full_name: true,
      email: true,
      phone: true,
      avatar_url: true,
      client_organizations: {
        select: {
          is_primary: true,
          organizations: {
            select: { uuid: true, name: true, inn: true },
          },
        },
        orderBy: { is_primary: "desc" as const },
      },
    },
  },
  assignee: {
    select: {
      id: true,
      uuid: true,
      username: true,
      full_name: true,
      avatar_url: true,
    },
  },
  ticket_category: {
    select: { id: true, uuid: true, name: true, slug: true, icon: true },
  },
  organization: { select: { id: true, uuid: true, name: true, inn: true } },
  attachments: { where: { comment_uuid: null }, include: { files: true } },
  _count: { select: { ticket_comments: true, attachments: true } },
} satisfies Prisma.ticketsInclude;

export type CreatorInfo = {
  id: number;
  uuid: string;
  username: string | null;
  full_name: string | null;
};

async function attachCreators<T extends { created_by_id: number | null }>(
  tickets: T[],
): Promise<(T & { created_by: CreatorInfo | null })[]> {
  const ids = [
    ...new Set(tickets.map((t) => t.created_by_id).filter(Boolean)),
  ] as number[];

  if (ids.length === 0) {
    return tickets.map((t) => ({ ...t, created_by: null }));
  }

  const creators = await prisma.users.findMany({
    where: { id: { in: ids } },
    select: { id: true, uuid: true, username: true, full_name: true },
  });

  const byId = new Map(creators.map((u) => [u.id, u]));

  return tickets.map((t) => ({
    ...t,
    created_by: t.created_by_id ? byId.get(t.created_by_id) ?? null : null,
  }));
}

// --------------------------------------------
// Хелперы для отображения клиента и организации
// --------------------------------------------
type ClientWithOrgs = {
  uuid: string;
  full_name: string | null;
  username: string | null;
  client_organizations?: {
    is_primary: boolean | null;
    organizations: { uuid: string; name: string; inn: string | null } | null;
  }[];
} | null;

export function clientLabel(client: ClientWithOrgs): string {
  if (!client) return "—";
  const name = client.full_name || client.username || "—";
  return client.username ? `${name} (@${client.username})` : name;
}

export function clientOrganization(
  client: ClientWithOrgs,
  ticketOrg?: { name: string; inn: string | null } | null,
): string | null {
  if (ticketOrg) {
    return ticketOrg.inn
      ? `${ticketOrg.name} (ИНН ${ticketOrg.inn})`
      : ticketOrg.name;
  }
  if (!client?.client_organizations?.length) return null;
  const primary =
    client.client_organizations.find((o) => o.is_primary) ??
    client.client_organizations[0];
  const org = primary.organizations;
  if (!org) return null;
  return org.inn ? `${org.name} (ИНН ${org.inn})` : org.name;
}

// --------------------------------------------
// Список тикетов
// --------------------------------------------
export async function listTickets(params: {
  user: { id: number; uuid: string; role: string | null };
  statusCode?: string;
  priorityCode?: string;
  assigneeId?: number | "me" | "unassigned";
  clientUuid?: string;
  categoryUuid?: string;
  search?: string;
  sort?: "created" | "updated" | "priority" | "deadline";
  dir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}) {
  const {
    user,
    statusCode,
    priorityCode,
    assigneeId,
    clientUuid,
    categoryUuid,
    search,
    sort = "updated",
    dir = "desc",
    page = 1,
    pageSize = 20,
  } = params;

  const isAgent = user.role === "admin" || user.role === "worker";

  const assigneeFilter: Prisma.ticketsWhereInput["assignee"] =
    assigneeId === "me"
      ? { uuid: user.uuid }
      : assigneeId === "unassigned"
        ? null
        : typeof assigneeId === "number"
          ? { id: assigneeId }
          : undefined;

  const where: Prisma.ticketsWhereInput = {
    ...(isAgent
      ? clientUuid
        ? { client_uuid: clientUuid }
        : {}
      : { client_uuid: user.uuid }),
    ...(statusCode ? { statuses: { code: statusCode } } : {}),
    ...(priorityCode ? { priorities: { code: priorityCode } } : {}),
    ...(assigneeId !== undefined
      ? assigneeId === "unassigned"
        ? { assigned_to_uuid: null }
        : { assignee: assigneeFilter as Prisma.usersWhereInput }
      : {}),
    ...(categoryUuid ? { category_uuid: categoryUuid } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search } },
            { description: { contains: search } },
            { contact_name: { contains: search } },
            { contact_email: { contains: search } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.ticketsOrderByWithRelationInput =
    sort === "created"
      ? { created_at: dir }
      : sort === "priority"
        ? { priorities: { level: dir } }
        : sort === "deadline"
          ? { deadline_at: dir }
          : { updated_at: dir };

  // 1. Список + общее количество — в транзакции
  const [items, total] = await prisma.$transaction([
    prisma.tickets.findMany({
      where,
      include: ticketInclude,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.tickets.count({ where }),
  ]);

  // 2. Счётчики по статусам — отдельным запросом
  const byStatus = await prisma.tickets.groupBy({
    by: ["status_uuid"],
    where: isAgent ? {} : { client_uuid: user.uuid },
    orderBy: { status_uuid: "asc" },
    _count: { _all: true },
  });

  const statuses = await prisma.statuses.findMany({
    select: { uuid: true, code: true, name: true },
  });
  const statusByUuid = new Map(statuses.map((s) => [s.uuid, s]));
  const statusCounts: Record<string, number> = {};
  for (const row of byStatus) {
    const code = row.status_uuid ? statusByUuid.get(row.status_uuid)?.code : null;
    if (code) statusCounts[code] = row._count._all ?? 0;
  }

  const itemsWithCreators = await attachCreators(items);

  return {
    items: itemsWithCreators,
    total,
    statusCounts,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

// --------------------------------------------
// Один тикет
// --------------------------------------------
export async function getTicket(
  uuid: string,
  user: { id: number; uuid: string; role: string | null },
) {
  const isAgent = user.role === "admin" || user.role === "worker";

  const ticket = await prisma.tickets.findFirst({
    where: isAgent ? { uuid } : { uuid, client_uuid: user.uuid },
    include: {
      ...ticketInclude,
      ticket_comments: {
        where: isAgent ? {} : { is_internal: false },
        include: {
          users: {
            select: {
              id: true,
              uuid: true,
              username: true,
              full_name: true,
              avatar_url: true,
            },
          },
          attachments: {
            include: { files: true },
          },
        },
        orderBy: { created_at: "asc" },
      },
    },
  });

  if (!ticket) return null;

  const [withCreator] = await attachCreators([ticket]);
  return withCreator;
}

// --------------------------------------------
// Создание
// --------------------------------------------
export async function createTicket(params: {
  title: string;
  description?: string;
  clientUuid: string;
  createdById?: number;
  priorityCode?: string;
  categoryUuid?: string | null;
  assignedToUuid?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string | null;
  organizationUuid?: string | null;
  attachmentFileIds?: number[];
}) {
  const {
    title,
    description,
    clientUuid,
    createdById,
    priorityCode = "NORMAL",
    categoryUuid,
    assignedToUuid,
    contactName,
    contactEmail,
    contactPhone,
    organizationUuid,
    attachmentFileIds,
  } = params;

  const [status, priority] = await Promise.all([
    prisma.statuses.findFirst({ where: { code: "OPEN" } }),
    prisma.priorities.findFirst({ where: { code: priorityCode } }),
  ]);

  if (!status) throw new Error("Status OPEN not found");

  return prisma.tickets.create({
    data: {
      uuid: randomUUID(),
      title,
      description,
      client_uuid: clientUuid,
      created_by_id: createdById ?? null,
      status_uuid: status.uuid,
      priority_uuid: priority?.uuid ?? null,
      category_uuid: categoryUuid ?? null,
      assigned_to_uuid: assignedToUuid ?? null,
      contact_name: contactName ?? null,
      contact_email: contactEmail ?? null,
      contact_phone: contactPhone ?? null,
      organization_uuid: organizationUuid ?? null,
      created_at: new Date(),
      updated_at: new Date(),
      attachments: attachmentFileIds?.length
        ? {
            create: attachmentFileIds.map((fileId) => ({
              uuid: randomUUID(),
              file_id: fileId,
              created_at: new Date(),
            })),
          }
        : undefined,
    },
    include: ticketInclude,
  });
}

// --------------------------------------------
// Комментарий
// --------------------------------------------
export async function addComment(params: {
  ticketUuid: string;
  userUuid: string;
  content: string;
  isInternal?: boolean;
  attachmentFileIds?: number[];
}) {
  const { ticketUuid, userUuid, content, isInternal, attachmentFileIds } = params;

  const comment = await prisma.ticket_comments.create({
    data: {
      uuid: randomUUID(),
      ticket_uuid: ticketUuid,
      user_uuid: userUuid,
      content,
      is_internal: !!isInternal,
      created_at: new Date(),
      updated_at: new Date(),
      attachments: attachmentFileIds?.length
        ? {
            create: attachmentFileIds.map((fileId) => ({
              uuid: randomUUID(),
              ticket_uuid: ticketUuid,
              file_id: fileId,
              created_at: new Date(),
            })),
          }
        : undefined,
    },
    include: {
      users: {
        select: {
          id: true,
          uuid: true,
          username: true,
          full_name: true,
          avatar_url: true,
        },
      },
      attachments: {
        include: { files: true },
      },
    },
  });

  await prisma.tickets.update({
    where: { uuid: ticketUuid },
    data: { updated_at: new Date() },
  });

  return comment;
}

// --------------------------------------------
// Смена статуса
// --------------------------------------------
export async function changeStatus(params: {
  ticketUuid: string;
  statusCode: string;
}) {
  const { ticketUuid, statusCode } = params;
  const status = await prisma.statuses.findFirstOrThrow({
    where: { code: statusCode },
  });

  return prisma.tickets.update({
    where: { uuid: ticketUuid },
    data: {
      status_uuid: status.uuid,
      resolved_at: status.is_final ? new Date() : null,
      updated_at: new Date(),
    },
    include: ticketInclude,
  });
}

// --------------------------------------------
// Назначение исполнителя
// --------------------------------------------
export async function assignTicket(params: {
  ticketUuid: string;
  assigneeUuid: string | null;
}) {
  const { ticketUuid, assigneeUuid } = params;

  return prisma.tickets.update({
    where: { uuid: ticketUuid },
    data: { assigned_to_uuid: assigneeUuid, updated_at: new Date() },
    include: ticketInclude,
  });
}

// --------------------------------------------
// Смена приоритета
// --------------------------------------------
export async function changePriority(params: {
  ticketUuid: string;
  priorityCode: string;
}) {
  const { ticketUuid, priorityCode } = params;
  const priority = await prisma.priorities.findFirstOrThrow({
    where: { code: priorityCode },
  });

  return prisma.tickets.update({
    where: { uuid: ticketUuid },
    data: { priority_uuid: priority.uuid, updated_at: new Date() },
    include: ticketInclude,
  });
}

// --------------------------------------------
// Справочники
// --------------------------------------------
export async function listStatuses() {
  return prisma.statuses.findMany({ orderBy: { sort_order: "asc" } });
}

export async function listPriorities() {
  return prisma.priorities.findMany({ orderBy: { level: "asc" } });
}

// --------------------------------------------
// Сводка
// --------------------------------------------
export async function getTicketStats() {
  const rows = await prisma.$queryRaw<
    { total: bigint; open: bigint; overdue: bigint; unassigned: bigint }[]
  >`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN s.code IN ('OPEN','IN_PROGRESS','WAITING_CLIENT') THEN 1 ELSE 0 END) AS open,
      SUM(CASE WHEN t.deadline_at IS NOT NULL AND t.deadline_at < NOW() AND s.is_final = 0 THEN 1 ELSE 0 END) AS overdue,
      SUM(CASE WHEN t.assigned_to_uuid IS NULL AND s.is_final = 0 THEN 1 ELSE 0 END) AS unassigned
    FROM tickets t
    JOIN statuses s ON s.uuid = t.status_uuid
  `;

  const r = rows[0];
  return {
    total: Number(r.total),
    open: Number(r.open),
    overdue: Number(r.overdue),
    unassigned: Number(r.unassigned),
  };
}
