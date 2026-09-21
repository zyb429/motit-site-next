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

// --------------------------------------------
// Список тикетов
// --------------------------------------------
export async function listTickets(params: {
  user: { id: number; uuid: string; role: string | null };
  statusCode?: string;
  priorityCode?: string;
  assigneeId?: number;
  clientUuid?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const {
    user,
    statusCode,
    priorityCode,
    assigneeId,
    clientUuid,
    search,
    page = 1,
    pageSize = 20,
  } = params;

  const isAgent = user.role === "admin" || user.role === "worker";

  const where: Prisma.ticketsWhereInput = {
    ...(isAgent
      ? clientUuid
        ? { client_uuid: clientUuid }
        : {}
      : { client_uuid: user.uuid }),
    ...(statusCode ? { statuses: { code: statusCode } } : {}),
    ...(priorityCode ? { priorities: { code: priorityCode } } : {}),
    ...(assigneeId ? { assignee: { id: assigneeId } } : {}),
    ...(search ? { title: { contains: search } } : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.tickets.findMany({
      where,
      include: ticketInclude,
      orderBy: { updated_at: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.tickets.count({ where }),
  ]);

  return {
    items,
    total,
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
          // attachments убрали — читаем через $queryRaw ниже
        },
        orderBy: { created_at: "asc" },
      },
    },
  });

  if (!ticket) return ticket;

  // Вложения к комментариям через SQL, минуя схему Prisma Client
  const commentUuids = ticket.ticket_comments.map((c) => c.uuid);

  const attachmentsByComment: Record<
    string,
    {
      uuid: string;
      files: {
        id: number;
        uuid: string;
        name: string | null;
        url: string;
        mime: string | null;
        size: number | null;
      };
    }[]
  > = {};

  if (commentUuids.length > 0) {
    const rows = await prisma.$queryRaw<
      {
        comment_uuid: string;
        uuid: string;
        file_id: number;
        file_uuid: string;
        name: string | null;
        url: string;
        mime: string | null;
        size: number | null;
      }[]
    >`
      SELECT
        ta.comment_uuid,
        ta.uuid,
        ta.file_id,
        f.uuid AS file_uuid,
        f.name,
        f.url,
        f.mime,
        f.size
      FROM ticket_attachments ta
      LEFT JOIN files f ON f.id = ta.file_id
      WHERE ta.comment_uuid IN (${Prisma.join(commentUuids)})
    `;

    for (const row of rows) {
      if (!attachmentsByComment[row.comment_uuid]) {
        attachmentsByComment[row.comment_uuid] = [];
      }
      attachmentsByComment[row.comment_uuid].push({
        uuid: row.uuid,
        files: {
          id: row.file_id,
          uuid: row.file_uuid,
          name: row.name,
          url: row.url,
          mime: row.mime,
          size: row.size,
        },
      });
    }
  }

  return {
    ...ticket,
    ticket_comments: ticket.ticket_comments.map((c) => ({
      ...c,
      attachments: attachmentsByComment[c.uuid] ?? [],
    })),
  };
}

// --------------------------------------------
// Создание
// --------------------------------------------
export async function createTicket(params: {
  title: string;
  description?: string;
  clientUuid: string;
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
  const commentUuid = randomUUID();

  // 1. Создаём комментарий БЕЗ attachments
  const comment = await prisma.ticket_comments.create({
    data: {
      uuid: commentUuid,
      ticket_uuid: ticketUuid,
      user_uuid: userUuid,
      content,
      is_internal: !!isInternal,
      created_at: new Date(),
      updated_at: new Date(),
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
    },
  });

  // 2. Вложения через SQL — минуя схему клиента
  if (attachmentFileIds?.length) {
    for (const fileId of attachmentFileIds) {
      await prisma.$executeRaw`
        INSERT INTO ticket_attachments (uuid, ticket_uuid, comment_uuid, file_id, created_at)
        VALUES (${randomUUID()}, ${ticketUuid}, ${commentUuid}, ${fileId}, NOW())
      `;
    }
  }

  // 3. Обновить тикет
  await prisma.tickets.update({
    where: { uuid: ticketUuid },
    data: { updated_at: new Date() },
  });

  // 4. Прочитать вложения
  const attachments = attachmentFileIds?.length
    ? await prisma.$queryRaw<
        { uuid: string; comment_uuid: string; file_id: number; name: string; url: string; mime: string | null; size: number | null }[]
      >`
        SELECT ta.uuid, ta.comment_uuid, ta.file_id, f.name, f.url, f.mime, f.size
        FROM ticket_attachments ta
        LEFT JOIN files f ON f.id = ta.file_id
        WHERE ta.comment_uuid = ${commentUuid}
      `
    : [];

  return { ...comment, attachments };
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
