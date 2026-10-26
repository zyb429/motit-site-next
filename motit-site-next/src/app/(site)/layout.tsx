import { getPuckDoc } from "@/lib/db/puck";
import { SitePuckRenderer } from "@/components/site/SitePuckRenderer";
import DraftModeIndicator from "@/components/DraftModeIndicator";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [header, footer] = await Promise.all([getPuckDoc("puck_header"), getPuckDoc("puck_footer")]);
  return (
    <>
      <SitePuckRenderer kind="header" data={header} />
      <main className="min-h-screen">{children}</main>
      <DraftModeIndicator />
      <SitePuckRenderer kind="footer" data={footer} />
    </>
  );
}