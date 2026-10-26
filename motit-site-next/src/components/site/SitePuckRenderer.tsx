"use client";

import { Render, type Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { headerConfig } from "@/lib/puck/headerConfig";
import { footerConfig } from "@/lib/puck/footerConfig";
import { homeConfig } from "@/lib/puck/homeConfig";

const CONFIGS = { header: headerConfig, footer: footerConfig, home: homeConfig } as const;

export function SitePuckRenderer({ kind, data }: { kind: keyof typeof CONFIGS; data: Data }) {
  if (!data?.content?.length) return null;
  return <Render config={CONFIGS[kind]} data={data} />;
}