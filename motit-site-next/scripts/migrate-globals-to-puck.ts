import { PrismaClient } from "@generated/prisma";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

function headerToProps(v: any) {
  return {
    logoText: v?.logo?.text ?? "Motit",
    logoHref: v?.logo?.href ?? "/",
    logoImageUrl: v?.logo?.image_url ?? null,
    nav: Array.isArray(v?.nav)
      ? v.nav.map((n: any) => ({
          label: String(n?.label ?? ""),
          href: String(n?.href ?? ""),
          external: Boolean(n?.external),
        }))
      : [],
    ctaLabel: v?.cta?.label ?? "Связаться",
    ctaHref: v?.cta?.href ?? "/contacts",
    ctaEnabled: v?.cta?.enabled ?? true,
  };
}

function footerToProps(v: any) {
  return {
    logoText: v?.logo?.text ?? "МОТИТ",
    logoHref: v?.logo?.href ?? "/",
    logoImageUrl: v?.logo?.image_url ?? null,
    description: v?.logo?.description ?? "",
    columns: Array.isArray(v?.columns)
      ? v.columns.map((c: any) => ({
          title: String(c?.title ?? ""),
          type: c?.type ?? "links",
          links: Array.isArray(c?.links)
            ? c.links.map((l: any) => ({
                label: String(l?.label ?? ""),
                href: String(l?.href ?? ""),
                external: Boolean(l?.external),
              }))
            : [],
          contacts: Array.isArray(c?.contacts)
            ? c.contacts.map((x: any) => ({
                icon: x?.icon ?? "phone",
                text: String(x?.text ?? ""),
                href: String(x?.href ?? ""),
              }))
            : [],
          support: c?.support
            ? {
                enabled: Boolean(c.support.enabled ?? true),
                text: String(c.support.text ?? ""),
                button_label: String(c.support.button_label ?? "ТЕХПОДДЕРЖКА"),
                button_href: String(c.support.button_href ?? "/support"),
                button_icon: Boolean(c.support.button_icon ?? true),
              }
            : {
                enabled: false,
                text: "",
                button_label: "ТЕХПОДДЕРЖКА",
                button_href: "/support",
                button_icon: true,
              },
        }))
      : [],
    social: Array.isArray(v?.social)
      ? v.social.map((s: any) => ({
          name: String(s?.name ?? ""),
          href: String(s?.href ?? ""),
        }))
      : [],
    copyright: v?.copyright ?? "© Motit",
  };
}

async function main() {
  const header = await prisma.globalSettings.findUnique({ where: { key: "header" } });
  if (header?.value) {
    await prisma.globalSettings.upsert({
      where: { key: "puck_header" },
      create: { key: "puck_header", value: { content: [{ type: "Header", props: headerToProps(header.value) }], root: { props: {} }, zones: {} } as any },
      update: { value: { content: [{ type: "Header", props: headerToProps(header.value) }], root: { props: {} }, zones: {} } as any },
    });
    console.log("puck_header ← header");
  }

  const footer = await prisma.globalSettings.findUnique({ where: { key: "footer" } });
  if (footer?.value) {
    await prisma.globalSettings.upsert({
      where: { key: "puck_footer" },
      create: { key: "puck_footer", value: { content: [{ type: "Footer", props: footerToProps(footer.value) }], root: { props: {} }, zones: {} } as any },
      update: { value: { content: [{ type: "Footer", props: footerToProps(footer.value) }], root: { props: {} }, zones: {} } as any },
    });
    console.log("puck_footer ← footer");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());