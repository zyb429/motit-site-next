// scripts/migrate-footer.ts
import { PrismaClient } from "@generated/prisma";

const prisma = new PrismaClient();

async function migrateFooter() {
  // Используем модель GlobalSettings и поле value (JSON)
  const row = await prisma.globalSettings.findUnique({
    where: { key: "puck_footer" },
  });

  if (!row || !row.value) {
    console.log("Данные puck_footer не найдены.");
    return;
  }

  const legacyData = row.value as any;

  // 1. Ищем старый компонент Footer
  const oldFooter = legacyData.content?.find((c: any) => c.type === "Footer");
  if (!oldFooter) {
    console.log("Компонент Footer не найден. Возможно, миграция уже выполнена.");
    return;
  }

  const oldProps = oldFooter.props;
  const now = Date.now();

  // 2. Собираем новые компоненты
  const newColumns: any[] = [
    {
      type: "FooterBrand",
      props: {
        id: `FooterBrand-${now}`,
        logoText: oldProps.logoText || "МОТИТ",
        logoHref: oldProps.logoHref || "/",
        logoImageUrl: oldProps.logoImageUrl || "",
        description: oldProps.description || "",
        social: oldProps.social || [],
        width: 3,
      },
    },
  ];

  (oldProps.columns || []).forEach((col: any, index: number) => {
    newColumns.push({
      type: "FooterColumn",
      props: {
        id: `FooterColumn-${index}-${now}`,
        title: col.title || "",
        width: col.width || 3,
        type: col.type || "links",
        links: col.links || [],
        contacts: col.contacts || [],
        support: col.support || {
          enabled: false,
          text: "",
          button_label: "",
          button_href: "",
          button_icon: true,
        },
      },
    });
  });

  const newBottom = [
    {
      type: "FooterBottom",
      props: {
        id: `FooterBottom-${now}`,
        copyright: oldProps.copyright || "© 2026 МОТИТ. Все права защищены.",
        credit: "Разработано в МОТИТ",
      },
    },
  ];

  // 3. Новый контейнер
  const newFooter = {
    type: "FooterContainer",
    props: {
      id: `FooterContainer-${now}`,
      columns: newColumns,
      bottom: newBottom,
    },
  };

  // 4. Заменяем Footer на FooterContainer
  const newContent = legacyData.content.map((c: any) =>
    c.type === "Footer" ? newFooter : c
  );

  const newData = { ...legacyData, content: newContent };

  // 5. Сохраняем в GlobalSettings.value
  await prisma.globalSettings.update({
    where: { key: "puck_footer" },
    data: { value: newData as any },
  });

  console.log("Миграция завершена:", JSON.stringify(newFooter, null, 2));
}

migrateFooter()
  .catch(console.error)
  .finally(() => prisma.$disconnect());