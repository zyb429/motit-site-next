"use client";

import { Render, type Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { headerConfig } from "@/lib/puck/headerConfig";
import { footerConfig } from "@/lib/puck/footerConfig";
import { homeConfig } from "@/lib/puck/homeConfig";

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const orig = console.error;
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes('Each child in a list should have a unique "key"') ||
        args[0].includes("Encountered a script tag"))
    ) {
      return;
    }
    orig.apply(console, args);
  };
}

const CONFIGS = { header: headerConfig, footer: footerConfig, home: homeConfig } as const;

export function SitePuckRenderer({ kind, data }: { kind: keyof typeof CONFIGS; data: Data }) {
  if (!data?.content?.length) return null;
  return <Render config={CONFIGS[kind]} data={data} />;
}