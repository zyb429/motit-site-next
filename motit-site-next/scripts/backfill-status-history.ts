// scripts/backfill-status-history.ts
import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

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
  // 1. Все тикеты со статусом
  const allTickets = await prisma.tickets.findMany({
    where: { status_uuid: { not: null } },
    select: {
      uuid: true,
      status_uuid: true,
      created_at: true,
      created_by_id: true,
      client_uuid: true,
      assigned_to_uuid: true,
    },
  });

  // 2. Тикеты, у которых уже есть история
  const withHistory = await prisma.ticket_status_history.findMany({
    select: { ticket_uuid: true },
  });
  const hasHistory = new Set(withHistory.map((r) => r.ticket_uuid));

  // 3. Только те, у кого истории нет
  const tickets = allTickets.filter((t) => !hasHistory.has(t.uuid));

  console.log(`Всего тикетов со статусом: ${allTickets.length}`);
  console.log(`Уже с историей: ${hasHistory.size}`);
  console.log(`Требуют бэкфилла: ${tickets.length}`);

  let created = 0;
  for (const t of tickets) {
    let changedByUuid: string | null = t.assigned_to_uuid ?? null;

    if (!changedByUuid && t.created_by_id) {
      const u = await prisma.users.findUnique({
        where: { id: t.created_by_id },
        select: { uuid: true },
      });
      changedByUuid = u?.uuid ?? null;
    }
    if (!changedByUuid && t.client_uuid) {
      changedByUuid = t.client_uuid;
    }

    await prisma.ticket_status_history.create({
      data: {
        ticket_uuid: t.uuid,
        status_uuid: t.status_uuid!,
        old_status_uuid: null,
        changed_by_uuid: changedByUuid,
        created_at: t.created_at ?? new Date(),
      },
    });
    created++;
  }

  console.log(`Создано записей истории: ${created}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
