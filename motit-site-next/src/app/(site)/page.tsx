import type { Metadata } from "next";
import { getPuckDoc } from "@/lib/db/puck";
import { SitePuckRenderer } from "@/components/site/SitePuckRenderer";

export const metadata: Metadata = {
  title: "МОТИТ — IT-решения для бизнеса",
  description: "Комплексные IT-услуги: аудит, мониторинг, безопасность",
};

export default async function Home() {
  const data = await getPuckDoc("puck_home");
  return <SitePuckRenderer kind="home" data={data} />;
}