import type { Metadata } from "next";
import type { Data } from "@puckeditor/core";
import { getPuckDoc } from "@/lib/db/puck";
import { getSiteSettings } from "@/lib/db/site-settings";
import { prisma } from "@/lib/prisma";
import { mergeSocialOptions } from "@/lib/social-options";
import { SitePuckRenderer } from "@/components/site/SitePuckRenderer";

export const metadata: Metadata = {
  title: "МОТИТ — IT-решения для бизнеса",
  description: "Комплексные IT-услуги: аудит, мониторинг, безопасность",
};

export const dynamic = "force-dynamic";

function injectWorkHours(data: Data, workHours: string | null): Data {
  if (!data?.content?.length) return data;
  const fallback = workHours?.trim() || "";

  return {
    ...data,
    content: data.content.map((item) => {
      if ((item as { type?: string })?.type !== "Contact") return item;
      const props = {
        ...((item as { props?: Record<string, unknown> }).props ?? {}),
      };
      if (!props.workHours) {
        props.workHours = fallback;
      }
      return { ...item, props } as typeof item;
    }),
  };
}

export default async function Home() {
  const [data, settings, socialRow] = await Promise.all([
    getPuckDoc("puck_home"),
    getSiteSettings(),
    prisma.globalSettings.findUnique({ where: { key: "social_options" } }),
  ]);

  const patched = injectWorkHours(data as Data, settings.workHours);
  const socialOptions = mergeSocialOptions(socialRow?.value);

  return (
    <SitePuckRenderer
      kind="home"
      data={patched}
      socialOptions={socialOptions}
    />
  );
}