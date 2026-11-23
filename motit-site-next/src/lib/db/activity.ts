// src/lib/db/activity.ts
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@generated/prisma";

export type CurrentUser = {
  uuid: string;
  role: "admin" | "worker" | "client" | "statistics" | "public" | null;
  full_name?: string | null;
  username?: string | null;
  email?: string | null;
};

const activityInclude = {
  actor: {
    select: {
      uuid: true,
      username: true,
      full_name: true,
      email: true,
    },
  },
  ticket: {
    select: {
      uuid: true,
      title: true,
      statuses: {
        select: {
          name: true,
          code: true,
          color: true,
        },
      },
    },
  },
} satisfies Prisma.ActivityInclude;

type RecentActivityOptions = {
  take?: number;
  skip?: number;
};

export async function getRecentActivity(
  user: CurrentUser,
  { take = 20, skip = 0 }: RecentActivityOptions = {},
) {
  if (!user.uuid?.trim()) {
    return [];
  }

  const isAdmin = user.role === "admin";
  const isWorker = user.role === "worker";
  const isClient = user.role === "client";

  if (!isAdmin && !isWorker && !isClient) {
    return [];
  }

  const pagination = {
    take: Number.isFinite(take)
      ? Math.min(100, Math.max(1, Math.trunc(take)))
      : 20,
    skip: Number.isFinite(skip) ? Math.max(0, Math.trunc(skip)) : 0,
  };

  // Администратору доступны все записанные события.
  if (isAdmin) {
    return prisma.activity.findMany({
      orderBy: {
        created_at: "desc",
      },
      ...pagination,
      include: activityInclude,
    });
  }

  const relatedActivity: Prisma.ActivityWhereInput = {
    OR: [
      // Собственные действия вне заявок.
      {
        actor_uuid: user.uuid,
        NOT: {
          target_type: "ticket",
        },
      },

      // События заявок, где пользователь является клиентом
      // или текущим назначенным исполнителем.
      {
        target_type: "ticket",
        ticket: {
          is: {
            OR: [
              {
                client_uuid: user.uuid,
              },
              {
                assigned_to_uuid: user.uuid,
              },
            ],
          },
        },
      },
    ],
  };

  const conditions: Prisma.ActivityWhereInput[] = [relatedActivity];

  if (isClient) {
    // Комментарий доступен клиенту только при явном
    // указании isInternal: false в JSON-поле meta.
    conditions.push({
      OR: [
        {
          NOT: {
            action: "comment",
          },
        },
        {
          target_type: "ticket",
          action: "comment",
          meta: {
            path: "$.isInternal",
            equals: false,
          },
        },
      ],
    });
  }

  const where: Prisma.ActivityWhereInput = {
    AND: conditions,
  };

  return prisma.activity.findMany({
    where,
    orderBy: {
      created_at: "desc",
    },
    ...pagination,
    include: activityInclude,
  });
}
