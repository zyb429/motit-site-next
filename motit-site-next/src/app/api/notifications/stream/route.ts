// src/app/api/notifications/stream/route.ts
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const AUDIENCE_BY_ROLE: Record<string, string[]> = {
  admin: ["all", "admin", "worker", "client", "statistics"],
  worker: ["all", "worker"],
  client: ["all", "client"],
};

type JsonValue =
  string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function toPlainJson(value: unknown): JsonValue {
  if (typeof value === "bigint") {
    return value.toString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(toPlainJson);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        toPlainJson(item),
      ]),
    );
  }

  return value as JsonValue;
}

export async function GET() {
  const user = await getCurrentUser();

  if (!user?.uuid) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userUuid = user.uuid;

  const audiences = AUDIENCE_BY_ROLE[user.role ?? "client"] ?? [
    "all",
    "client",
  ];

  const encoder = new TextEncoder();

  let isClosed = false;
  let interval: ReturnType<typeof setInterval> | undefined;
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const stream = new ReadableStream({
    start(controller) {
      let lastAnnouncementId = 0;
      let lastMessageId = "0";

      const close = () => {
        if (isClosed) return;

        isClosed = true;

        if (interval) {
          clearInterval(interval);
          interval = undefined;
        }

        if (timeout) {
          clearTimeout(timeout);
          timeout = undefined;
        }

        try {
          controller.close();
        } catch {
          // Контроллер уже закрыт
        }
      };

      const send = (event: string, data: unknown) => {
        if (isClosed) return;

        try {
          controller.enqueue(
            encoder.encode(
              `event: ${event}\ndata: ${JSON.stringify(toPlainJson(data))}\n\n`,
            ),
          );
        } catch {
          close();
        }
      };

      const load = async () => {
        if (isClosed) return;

        const memberships = await prisma.chat_members.findMany({
          where: {
            user_uuid: userUuid,
            is_muted: false,
            hidden_at: null,
          },
          select: {
            chat_uuid: true,
            last_read_at: true,
          },
        });

        const chatUuids = memberships.map((item) => item.chat_uuid);

        const unreadFilters = memberships.map((membership) => ({
          chat_uuid: membership.chat_uuid,
          ...(membership.last_read_at
            ? {
                created_at: {
                  gt: membership.last_read_at,
                },
              }
            : {}),
        }));

        const unreadMessages =
          chatUuids.length === 0
            ? []
            : await prisma.chat_messages.findMany({
                where: {
                  chat_uuid: {
                    in: chatUuids,
                  },
                  user_uuid: {
                    not: userUuid,
                  },
                  deleted_at: null,
                  OR: unreadFilters,
                  read_receipts: {
                    none: {
                      user_uuid: userUuid,
                    },
                  },
                },
                orderBy: {
                  created_at: "desc",
                },
                include: {
                  chat: {
                    select: {
                      uuid: true,
                      name: true,
                      kind: true,
                    },
                  },
                  user: {
                    select: {
                      uuid: true,
                      username: true,
                      full_name: true,
                      avatar_url: true,
                    },
                  },
                },
                take: 30,
              });

        const announcements = await prisma.announcements.findMany({
          where: {
            audience: {
              in: audiences,
            },
          },
          orderBy: {
            created_at: "desc",
          },
          include: {
            created_by: {
              select: {
                username: true,
                full_name: true,
              },
            },
          },
          take: 30,
        });

        if (isClosed) return;

        const newestAnnouncementId = announcements[0]?.id ?? 0;
        const newestMessageId = unreadMessages[0]?.id?.toString() ?? "0";

        const newAnnouncements =
          lastAnnouncementId === 0
            ? []
            : announcements.filter((item) => item.id > lastAnnouncementId);

        const newMessages =
          lastMessageId === "0"
            ? []
            : unreadMessages.filter(
                (item) => item.id.toString() > lastMessageId,
              );

        lastAnnouncementId = newestAnnouncementId;
        lastMessageId = newestMessageId;

        send("notifications", {
          announcements,
          messages: unreadMessages,
          newAnnouncements,
          newMessages,
        });
      };

      const run = async () => {
        try {
          await load();
        } catch (error) {
          console.error("[notifications stream] load error:", error);
        }
      };

      void run();

      interval = setInterval(run, 3000);

      // SSE живёт 5 минут, затем браузер автоматически переподключается
      timeout = setTimeout(close, 5 * 60 * 1000);
    },
    cancel() {
      // Вызывается, когда браузер закрыл соединение
      isClosed = true;

      if (interval) {
        clearInterval(interval);
        interval = undefined;
      }

      if (timeout) {
        clearTimeout(timeout);
        timeout = undefined;
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
