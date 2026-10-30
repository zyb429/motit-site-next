"use client";

import "@puckeditor/core/puck.css";
import {
  Render,
  type ComponentConfig,
  type Config,
  type Data,
} from "@puckeditor/core";
import { useMemo } from "react";
import { createHeaderConfig } from "@/lib/puck/headerConfig";
import { createFooterConfig } from "@/lib/puck/footerConfig";
import { createHomeConfig } from "@/lib/puck/homeConfig";
import type { SocialOption } from "@/lib/social-options";

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

export type SitePuckRendererProps = {
  data: Partial<Data>;
  /** Какой набор компонентов рендерить: home, header, footer или всё сразу */
  kind?: "home" | "header" | "footer" | "all";
  /** Пользовательские соцсети для футера (влияет на select в Puck) */
  socialOptions?: SocialOption[];
};

export function SitePuckRenderer({
  data,
  kind = "all",
  socialOptions = [],
}: SitePuckRendererProps) {
  const config = useMemo(() => {
    const components: Record<string, ComponentConfig> = {};

    if (kind === "all" || kind === "home") {
      Object.assign(components, createHomeConfig().components);
    }
    if (kind === "all" || kind === "header") {
      Object.assign(components, createHeaderConfig().components);
    }
    if (kind === "all" || kind === "footer") {
      Object.assign(components, createFooterConfig(socialOptions).components);
    }

    return { components } as Config;
  }, [kind, socialOptions]);

  if (!data?.content?.length) return null;

  return <Render config={config} data={data} />;
}