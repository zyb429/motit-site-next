import { getPuckDoc } from "@/lib/db/puck";
import { SitePuckRenderer } from "@/components/site/SitePuckRenderer";
import { HeaderBlock } from "@/components/puck/HeaderBlock";
import DraftModeIndicator from "@/components/DraftModeIndicator";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [header, footer] = await Promise.all([
    getPuckDoc("puck_header"),
    getPuckDoc("puck_footer"),
  ]);

  // Достаем пропсы из документа Puck (первый блок)
  const headerProps = header?.content?.[0]?.props ?? {
    logoText: "Motit",
    logoHref: "/",
    nav: [
      { label: "Главная", href: "/" },
      { label: "Блог", href: "/blog" },
      { label: "О нас", href: "/about" },
      { label: "Направления", href: "/#directions" }, 
      { label: "Контакты", href: "/#contact" },
    ],
    ctaLabel: "Связаться",
    ctaHref: "/#directions",
    ctaEnabled: true,
  };

  return (
    <>
      {/* Рендерим HeaderBlock напрямую, без оберток Puck */}
      <HeaderBlock {...headerProps} />
      
      <main className="min-h-screen">{children}</main>
      
      <DraftModeIndicator />
      
      {/* Футер оставляем через Puck */}
      <SitePuckRenderer kind="footer" data={footer} />
    </>
  );
}