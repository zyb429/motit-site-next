// scripts/backfill-chats.ts
import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { randomUUID } from "crypto";

const url = new URL(process.env.DATABASE_URL!);
const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: Number(url.port || 3306),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.slice(1),
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // Тикеты без чата
  const tickets = await prisma.tickets.findMany({
    where: { chat: { is: null } },
    include: {
      ticket_comments: {
        orderBy: { created_at: "asc" },
      },
    },
  });

  console.log(`Тикетов без чата: ${tickets.length}`);

  let created = 0;
  let messagesCreated = 0;

  for (const ticket of tickets) {
    await prisma.$transaction(async (tx) => {
      // 1. Создаём чат
      const chat = await tx.chats.create({
        data: {
          uuid: randomUUID(),
          kind: "ticket",
          ticket_uuid: ticket.uuid,
          created_by_uuid: ticket.client_uuid,
          name: ticket.title,
          created_at: ticket.created_at ?? new Date(),
          updated_at: ticket.updated_at ?? new Date(),
        },
      });

      // 2. Участники
      const memberUuids = new Set<string>();
      if (ticket.client_uuid) memberUuids.add(ticket.client_uuid);
      if (ticket.assigned_to_uuid) memberUuids.add(ticket.assigned_to_uuid);

      // Добавляем всех, кто писал комментарии
      for (const c of ticket.ticket_comments) {
        memberUuids.add(c.user_uuid);
      }

      await tx.chat_members.createMany({
        data: [...memberUuids].map((uuid) => ({
          uuid: randomUUID(),
          chat_uuid: chat.uuid,
          user_uuid: uuid,
          role: uuid === ticket.client_uuid ? "owner" : "member",
        })),
      });

      // 3. Переносим комментарии
      if (ticket.ticket_comments.length > 0) {
        await tx.chat_messages.createMany({
          data: ticket.ticket_comments.map((c) => ({
            uuid: randomUUID(),
            chat_uuid: chat.uuid,
            user_uuid: c.user_uuid,
            kind: "text",
            content: c.content,
            created_at: c.created_at ?? new Date(),
          })),
        });
        messagesCreated += ticket.ticket_comments.length;
      }

      // 4. Обновляем last_message_at
      const lastComment = ticket.ticket_comments[ticket.ticket_comments.length - 1];
      if (lastComment) {
        await tx.chats.update({
          where: { uuid: chat.uuid },
          data: { last_message_at: lastComment.created_at ?? new Date() },
        });
      }

      created++;
    });
  }

  console.log(`Создано чатов: ${created}`);
  console.log(`Перенесено комментариев: ${messagesCreated}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
