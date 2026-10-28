"use client";

import { Puck } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { useRouter } from "next/navigation";
import type { Config, Data } from "@puckeditor/core";
import { headerConfig } from "@/lib/puck/headerConfig";
import { footerConfig } from "@/lib/puck/footerConfig";
import { homeConfig } from "@/lib/puck/homeConfig";

const CONFIGS: Record<string, Config> = {
  puck_header: headerConfig,
  puck_footer: footerConfig,
  puck_home: homeConfig,
};

export function PuckEditorShell({
  storageKey,
  initial,
}: {
  storageKey: "puck_header" | "puck_footer" | "puck_home";
  initial: Data;
}) {
  const router = useRouter();
  const config = CONFIGS[storageKey];
  if (!config) {
    return <div className="p-6">Редактор для {storageKey} не настроен</div>;
  }

  const onPublish = async (data: Data) => {
    try {
      const res = await fetch("/api/admin/puck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: storageKey, data }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(`Ошибка: ${body.error ?? res.status}`);
        return;
      }
      router.refresh();
      alert("Сохранено");
    } catch (e) {
      console.error(e);
      alert("Сеть недоступна");
    }
  };

    return (
        <Puck
        config={config}
        data={initial}
        onPublish={onPublish}
        iframe={{ enabled: false }}
        />
    );
}