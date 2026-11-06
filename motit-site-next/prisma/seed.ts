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

  await prisma.privacyPolicy.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                marks: [{ type: "bold" }],
                text: "Дата последнего обновления: [дата]",
              },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Настоящая Политика конфиденциальности (далее — Политика) разработана в соответствии с Законом Республики Беларусь от 7 мая 2021 г. № 99-З «О защите персональных данных» и определяет порядок обработки и защиты персональных данных пользователей сайта Motit (далее — Сайт).",
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "1. Общие положения" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "1.1. Оператором персональных данных является [полное наименование организации], УНП [номер], место нахождения: [адрес] (далее — Оператор).",
              },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "1.2. Контактные данные Оператора по вопросам обработки персональных данных: электронная почта info@motit.by, телефон +375 (29) 118-50-82, почтовый адрес: г. Минск, ул. Сухаревская, д. 16, п. 71.",
              },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "1.3. Настоящая Политика применяется к информации, которую Оператор получает через Сайт, включая данные, предоставляемые пользователями при заполнении формы обратной связи, а также технические данные о посещении Сайта.",
              },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "1.4. Использование Сайта и отправка формы обратной связи означает ознакомление пользователя с настоящей Политикой и согласие на обработку персональных данных на изложенных в ней условиях.",
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "2. Какие данные мы обрабатываем" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "2.1. При заполнении формы обратной связи на Сайте Оператор может обрабатывать следующие персональные данные:",
              },
            ],
          },
          {
            type: "bulletList",
            content: [
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "имя;" }] }] },
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "адрес электронной почты;" }] }] },
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "номер телефона;" }] }] },
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "название компании;" }] }] },
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "должность;" }] }] },
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "текст сообщения." }] }] },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "2.2. При посещении Сайта с использованием сервисов веб-аналитики (Google Analytics, Яндекс.Метрика) Оператор обрабатывает обезличенные технические данные: IP-адрес, тип браузера и операционной системы, дату и время посещения, просмотренные страницы, источник перехода, файлы cookie.",
              },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "2.3. Оператор не обрабатывает специальные персональные данные (о расовой или национальной принадлежности, политических взглядах, состоянии здоровья и т.п.) и просит пользователей не направлять такие сведения через форму на Сайте.",
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "3. Цели обработки персональных данных" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "3.1. Оператор обрабатывает персональные данные в следующих целях:",
              },
            ],
          },
          {
            type: "bulletList",
            content: [
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "обработка обращений и запросов, направленных через форму обратной связи;" }] }] },
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "установление с пользователем обратной связи, включая направление ответов на обращения;" }] }] },
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "подготовка и заключение договоров на оказание услуг, выставление счетов;" }] }] },
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "ведение внутреннего учёта обращений в CRM-системе Оператора;" }] }] },
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "анализ посещаемости Сайта и улучшение его работы с помощью обезличенных данных веб-аналитики." }] }] },
            ],
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "4. Правовые основания обработки" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "4.1. Обработка персональных данных осуществляется на основании согласия субъекта персональных данных, выражаемого путём отправки формы обратной связи на Сайте.",
              },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "4.2. Обработка обезличенных данных веб-аналитики осуществляется на основании согласия пользователя, выражаемого путём продолжения использования Сайта (в соответствии с настройками браузера в отношении файлов cookie).",
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "5. Порядок и условия обработки" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "5.1. Обработка персональных данных осуществляется с использованием средств автоматизации и без их использования.",
              },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "5.2. Персональные данные, полученные через форму обратной связи, сохраняются на собственном сервере Оператора, дублируются на внутреннюю корпоративную электронную почту и вносятся в собственную CRM-систему Оператора для учёта обращений.",
              },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "5.3. Оператор принимает необходимые правовые, организационные и технические меры для защиты персональных данных от неправомерного или случайного доступа, уничтожения, изменения, блокирования, копирования, предоставления, распространения, а также от иных неправомерных действий.",
              },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "5.4. Персональные данные хранятся не дольше, чем этого требуют цели их обработки, либо в течение срока, установленного законодательством Республики Беларусь.",
              },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "5.5. Оператор не передаёт персональные данные третьим лицам, за исключением случаев, предусмотренных законодательством Республики Беларусь, либо с согласия субъекта персональных данных.",
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "6. Права субъекта персональных данных" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "6.1. Пользователь имеет право:",
              },
            ],
          },
          {
            type: "bulletList",
            content: [
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "получать информацию, касающуюся обработки своих персональных данных;" }] }] },
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "требовать внесения изменений в свои персональные данные, если они являются неполными, устаревшими или неточными;" }] }] },
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "требовать прекращения обработки своих персональных данных, включая их удаление, при отсутствии оснований для обработки, предусмотренных законодательством;" }] }] },
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "отозвать своё согласие на обработку персональных данных;" }] }] },
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "обжаловать действия (бездействие) Оператора, нарушающие его права, в уполномоченный орган по защите персональных данных или в суд." }] }] },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "6.2. Для реализации своих прав пользователь может направить запрос на электронную почту info@motit.by или письменно по адресу: г. Минск, ул. Сухаревская, д. 16, п. 71.",
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "7. Файлы cookie и веб-аналитика" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "7.1. Сайт использует файлы cookie и сервисы веб-аналитики (Google Analytics, Яндекс.Метрика) для сбора обезличенной статистики о посещениях.",
              },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "7.2. Пользователь может отключить файлы cookie в настройках своего браузера. При отключении cookie некоторые функции Сайта могут работать некорректно.",
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "8. Заключительные положения" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "8.1. Оператор вправе вносить изменения в настоящую Политику. Актуальная версия всегда доступна на странице https://motit.by/privacy-policy.",
              },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "8.2. По всем вопросам, связанным с обработкой персональных данных, пользователь может обратиться по контактам, указанным в разделе 1.",
              },
            ],
          },
        ],
      },
      displayMode: "page",
    },
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
    siteLocale: "ru",
    adminLocale: "ru",
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