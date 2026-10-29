// prisma/seed.ts
import { PrismaClient } from "@generated/prisma";
import bcrypt from "bcryptjs";

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

  // === НОВЫЕ НАСТРОЙКИ ===
  
  // 1. Переносим MIME-типы и posts_per_page в GlobalSettings
  await prisma.globalSettings.upsert({
    where: { key: "upload.allowed_mime" },
    update: {},
    create: {
      key: "upload.allowed_mime",
      value: [
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
      ],
    },
  });

  await prisma.globalSettings.upsert({
    where: { key: "posts_per_page" },
    update: {},
    create: { key: "posts_per_page", value: 6 },
  });

  // 2. Создаем настройки сайта
  const siteSettingsData = {
    id: 1,
    siteName: "Motit",
    description: "IT-решения для бизнеса",
    language: "ru",
    timezone: "Europe/Minsk",

    // SEO — дефолтные значения
    seoTitle: "МОТИТ — IT-решения для бизнеса | Аудит, безопасность, разработка",
    seoDescription:
      "Комплексные IT-услуги для бизнеса: аудит информационной безопасности, пентест, СЗИ, разработка ПО и сайтов, умный дом. Более 10 лет опыта. Работаем по всей Беларуси.",
    seoKeywords:
      "IT-услуги, информационная безопасность, аудит, пентест, СЗИ, разработка ПО, разработка сайтов, умный дом, SOAR, SIEM, антивирусная защита, Минск, Беларусь",
    ogImageUrl: "/og-image.jpg",
    robots: "index, follow",

    // Внешний вид
    accentColor: "#6366f1",
    socialLinks: { telegram: "", vk: "", instagram: "" },
    notificationEmails: [],
  };

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: siteSettingsData,
    create: siteSettingsData,
  });

  // 3. Поля формы контактов (upsert, чтобы обновлять существующие)
  const contactFields = [
    { name: "name", label: "Имя", type: "text", required: true, placeholder: "Ваше имя", sortOrder: 1 },
    { name: "email", label: "Email", type: "email", required: true, placeholder: "email@example.com", sortOrder: 2 },
    { name: "phone", label: "Телефон", type: "tel", required: true, placeholder: "+375 (29) 123-45-67", sortOrder: 3 },
    { name: "company_name", label: "Компания", type: "text", required: false, placeholder: "Название компании", sortOrder: 4 },
    { name: "job_title", label: "Должность", type: "text", required: false, placeholder: "Ваша должность", sortOrder: 5 },
    { name: "message", label: "Сообщение", type: "textarea", required: false, placeholder: "Ваше сообщение...", sortOrder: 6 },
  ];

  for (const field of contactFields) {
    await prisma.contactFormField.upsert({
      where: { name: field.name },
      update: field,
      create: field,
    });
  }

  // 4. Языки программирования
  await prisma.codeLanguage.createMany({
    skipDuplicates: true,
    data: [
      { code: "typescript", label: "TypeScript", sortOrder: 1 },
      { code: "javascript", label: "JavaScript", sortOrder: 2 },
      { code: "python", label: "Python", sortOrder: 3 },
      { code: "go", label: "Go", sortOrder: 4 },
      { code: "rust", label: "Rust", sortOrder: 5 },
    ],
  });

  // === ADMIN ===
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@local.dev";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin123";

  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.users.upsert({
    where: { email: adminEmail },
    update: {
      password_hash: adminPasswordHash,
      is_active: true,
      confirmed: true,
    },
    create: {
      email: adminEmail,
      username: "admin",
      password_hash: adminPasswordHash,
      full_name: "Администратор",
      is_active: true,
      confirmed: true,
      locale: "ru",
    },
  });

  const adminRole = await prisma.roles.findUnique({ where: { name: "admin" } });
  if (!adminRole) {
    throw new Error("Role 'admin' not found after createMany — check seed order.");
  }

  await prisma.users_role_lnk.upsert({
    where: {
      user_id_role_id: { user_id: admin.id, role_id: adminRole.id },
    },
    update: {},
    create: { user_id: admin.id, role_id: adminRole.id },
  });

  console.log(`✓ Admin user ready: ${admin.email} (password: ${adminPassword})`);
  console.log("✓ Seeds applied");
}

main()
  .catch((e) => { 
    console.error(e); 
    process.exit(1); 
  })
  .finally(() => prisma.$disconnect());