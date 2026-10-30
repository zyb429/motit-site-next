import type { Data } from "@puckeditor/core";
import { getPuckDoc } from "@/lib/db/puck";
import { getSiteSettings } from "@/lib/db/site-settings";
import { prisma } from "@/lib/prisma";
import { SitePuckRenderer } from "@/components/site/SitePuckRenderer";
import { HeaderBlock } from "@/components/puck/HeaderBlock";
import DraftModeIndicator from "@/components/DraftModeIndicator";
import { Analytics } from "@/components/site/Analytics";
import { mergeSocialOptions } from "@/lib/social-options";

type SocialItem = { name: string; href: string; icon?: string };

function normalizeSocialLinks(raw: unknown): SocialItem[] {
  if (!raw) return [];

  if (typeof raw === "object" && !Array.isArray(raw)) {
    const out: SocialItem[] = [];
    for (const [name, href] of Object.entries(raw as Record<string, unknown>)) {
      if (typeof href === "string" && href.trim()) {
        out.push({ name, href: href.trim() });
      }
    }
    return out;
  }

  if (Array.isArray(raw)) {
    const out: SocialItem[] = [];
    for (const o of raw) {
      if (
        o &&
        typeof o === "object" &&
        typeof (o as { name?: unknown }).name === "string" &&
        typeof (o as { href?: unknown }).href === "string"
      ) {
        out.push({
          name: (o as { name: string }).name,
          href: (o as { href: string }).href,
        });
      }
    }
    return out;
  }

  return [];
}

function injectFooterSocial(
  data: Data,
  socialLinks: unknown,
  socialOptions: Array<{ value: string; icon?: string }>,
): Data {
  if (!data?.content?.length) return data;

  const fromSettings = normalizeSocialLinks(socialLinks);
  const fallback: SocialItem[] =
    fromSettings.length > 0
      ? fromSettings
      : [
          { name: "linkedin", href: "https://linkedin.com" },
          { name: "telegram", href: "https://t.me" },
          { name: "support", href: "https://help.motit.by" },
        ];

  const iconFor = (name: string): string | undefined =>
    socialOptions.find((o) => o.value === name)?.icon;

  const withIcons = (arr: SocialItem[]): SocialItem[] =>
    arr.map((s) => (s.icon ? s : { ...s, icon: iconFor(s.name) }));

  return {
    ...data,
    content: data.content.map((item) => {
      if ((item as { type?: string })?.type !== "Footer") return item;
      const props = {
        ...((item as { props?: Record<string, unknown> }).props ?? {}),
      };
      const current = Array.isArray(props.social) ? props.social : [];
      props.social =
        current.length === 0
          ? withIcons(fallback)
          : withIcons(current as SocialItem[]);
      return { ...item, props } as typeof item;
    }),
  };
}

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [header, footer, settings, socialOptionsRow] = await Promise.all([
    getPuckDoc("puck_header"),
    getPuckDoc("puck_footer"),
    getSiteSettings(),
    prisma.globalSettings.findUnique({ where: { key: "social_options" } }),
  ]);

  const socialOptions = mergeSocialOptions(socialOptionsRow?.value);

  const puckProps = header?.content?.[0]?.props ?? {};
  const headerProps = {
    logoText: puckProps.logoText || settings.siteName,
    logoHref: puckProps.logoHref || "/",
    logoUrl: puckProps.logoUrl || settings.logoUrl || undefined,
    nav: puckProps.nav || [
      { label: "Главная", href: "/" },
      { label: "Блог", href: "/blog" },
      { label: "О нас", href: "/about" },
      { label: "Направления", href: "/#directions" },
      { label: "Контакты", href: "/#contact" },
    ],
    ctaLabel: puckProps.ctaLabel || "Связаться",
    ctaHref: puckProps.ctaHref || "/#directions",
    ctaEnabled: puckProps.ctaEnabled ?? true,
  };

  const patchedFooter = injectFooterSocial(
    footer as Data,
    settings.socialLinks,
    socialOptions,
  );

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            :root { --accent: ${settings.accentColor ?? "#6366f1"}; }
            body:has(.site-dark) { background-color: #0a1920; color: #e0f7fa; }
          `,
        }}
      />

      <Analytics gaId={settings.analyticsGaId} ymId={settings.analyticsYmId} />

      <div className="site-dark dark bg-(--bg-primary) text-(--text-primary) min-h-screen">
        <HeaderBlock {...headerProps} />
        <main className="min-h-screen">{children}</main>
        <DraftModeIndicator />
        <SitePuckRenderer
          kind="footer"
          data={patchedFooter}
          socialOptions={socialOptions}
        />
      </div>
    </>
  );
}