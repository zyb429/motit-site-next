// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.roles.createMany({
    data: [
      { name: "admin", type: "admin", description: "Администратор" },
      { name: "worker", type: "worker", description: "Сотрудник" },
      { name: "client", type: "client", description: "Клиент" },
      { name: "statistics", type: "statistics", description: "Статистика" },
      { name: "public", type: "public", description: "Публичный" },
    ],
    skipDuplicates: true,
  });

  await prisma.statuses.createMany({
    data: [
      { code: "OPEN", name: "Открыт", color: "#2dd4bf", sort_order: 1, is_final: false },
      { code: "IN_PROGRESS", name: "В работе", color: "#f59e0b", sort_order: 2, is_final: false },
      { code: "WAITING_CLIENT", name: "Ждём клиента", color: "#60a5fa", sort_order: 3, is_final: false },
      { code: "RESOLVED", name: "Решён", color: "#22c55e", sort_order: 4, is_final: true },
      { code: "CLOSED", name: "Закрыт", color: "#6b7280", sort_order: 5, is_final: true },
    ],
    skipDuplicates: true,
  });

  await prisma.priorities.createMany({
    data: [
      { code: "LOW", name: "Низкий", color: "#6b7280", level: 1 },
      { code: "NORMAL", name: "Обычный", color: "#2dd4bf", level: 2 },
      { code: "HIGH", name: "Высокий", color: "#f59e0b", level: 3 },
      { code: "URGENT", name: "Срочный", color: "#ef4444", level: 4 },
    ],
    skipDuplicates: true,
  });

  await prisma.ticket_categories.createMany({
    data: [
      { name: "Техническая поддержка", slug: "tech-support", icon: "🛠️", sort_order: 1 },
      { name: "СЗИ", slug: "szi", icon: "🔒", sort_order: 2 },
      { name: "Аудит, проектирование, создание и аттестация", slug: "audit", icon: "📋", sort_order: 3 },
      { name: "Пинтест", slug: "pentest", icon: "🎯", sort_order: 4 },
      { name: "Умный дом", slug: "smart-home", icon: "🏠", sort_order: 5 },
      { name: "Разработка программного обеспечения", slug: "software-dev", icon: "💻", sort_order: 6 },
      { name: "Разработка и поддержка сайтов", slug: "web-dev", icon: "🌐", sort_order: 7 },
      { name: "SOAR and SIEM", slug: "soar-siem", icon: "📊", sort_order: 8 },
      { name: "Антивирусная защита", slug: "antivirus", icon: "🛡️", sort_order: 9 },
      { name: "Продажа продуктов", slug: "products", icon: "🛒", sort_order: 10 },
    ],
    skipDuplicates: true,
  });

  await prisma.settings.upsert({
    where: { key: "upload.allowed_mime" },
    update: {},
    create: {
      key: "upload.allowed_mime",
      value: JSON.stringify([
        "image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml",
        "image/bmp", "text/plain", "text/markdown", "text/csv", "text/html",
        "text/css", "application/json", "application/xml", "application/x-yaml",
        "application/javascript", "application/typescript", "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/zip", "application/x-rar-compressed", "application/gzip",
        "application/x-7z-compressed",
      ]),
      description: "Разрешённые MIME-типы для загрузки файлов",
    },
  });

  console.log("✓ Seeds applied");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
