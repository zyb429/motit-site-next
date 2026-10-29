// src/app/(site)/layout.tsx
import { getPuckDoc } from "@/lib/db/puck";
import { getSiteSettings } from "@/lib/db/site-settings";
import { SitePuckRenderer } from "@/components/site/SitePuckRenderer";
import { HeaderBlock } from "@/components/puck/HeaderBlock";
import DraftModeIndicator from "@/components/DraftModeIndicator";
import { Analytics } from "@/components/site/Analytics";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [header, footer, settings] = await Promise.all([
    getPuckDoc("puck_header"),
    getPuckDoc("puck_footer"),
    getSiteSettings(),
  ]);

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

      <Analytics
        gaId={settings.analyticsGaId}
        ymId={settings.analyticsYmId}
      />

      <div className="site-dark dark bg-(--bg-primary) text-(--text-primary) min-h-screen">
        <HeaderBlock {...headerProps} />
        <main className="min-h-screen">{children}</main>
        <DraftModeIndicator />
        <SitePuckRenderer kind="footer" data={footer} />
      </div>
    </>
  );
}