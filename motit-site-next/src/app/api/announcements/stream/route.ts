// src/app/api/announcements/stream/route.ts
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const AUDIENCE_BY_ROLE: Record<string, string[]> = {
  admin: ["all", "admin", "worker", "client", "statistics"],
  worker: ["all", "worker"],
  client: ["all", "client"],
};

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const audiences = AUDIENCE_BY_ROLE[user.role ?? "client"] ?? [
    "all",
    "client",
  ];

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let lastId = 0;

      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };

      const load = async () => {
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

        const newestId = announcements[0]?.id ?? 0;

        if (newestId > lastId) {
          const newItems =
            lastId === 0
              ? []
              : announcements.filter((item) => item.id > lastId);

          lastId = newestId;

          if (newItems.length > 0) {
            send("announcements", {
              announcements,
              newItems,
            });
          }
        } else {
          send("announcements", {
            announcements,
            newItems: [],
          });
        }
      };

      await load();

      const interval = setInterval(async () => {
        try {
          await load();
        } catch {
          // Не обрываем SSE из-за временной ошибки БД
        }
      }, 3000);

      // Закрываем соединение через 5 минут, браузер переподключится сам
      setTimeout(
        () => {
          clearInterval(interval);
          controller.close();
        },
        5 * 60 * 1000,
      );
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
