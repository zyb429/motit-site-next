"use client";

import { Puck, type Config, type Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPuckConfig } from "@/lib/puck/config";
import type { SocialOption } from "@/lib/social-options";

export function PuckEditorShell({
  storageKey,
  initial,
  initialSocialOptions = [],
}: {
  storageKey: "puck_header" | "puck_footer" | "puck_home";
  initial: Data;
  initialSocialOptions?: SocialOption[];
}) {
  const router = useRouter();
  const [socialOptions, setSocialOptions] =
    useState<SocialOption[]>(initialSocialOptions);

  // Конфиг пересобираем при изменении socialOptions. Puck чувствителен к
  // идентичности config (сбрасывает состояние при смене), поэтому memo
  // критичен.
  const config: Config = useMemo(
    () => createPuckConfig(socialOptions),
    [socialOptions],
  );

  // Периодически подтягиваем свежие socialOptions из API (раз в 15 сек
  // и при возврате фокуса на вкладку), чтобы редактор не показывал
  // устаревший список.
  useEffect(() => {
    let cancelled = false;

    const sync = async () => {
      try {
        const res = await fetch("/api/settings/social-options", {
          cache: "no-store",
        });
        if (!res.ok || cancelled) return;
        const next: SocialOption[] = await res.json();
        setSocialOptions((prev) =>
          JSON.stringify(prev) === JSON.stringify(next) ? prev : next,
        );
      } catch {
        /* при ошибке оставляем как есть */
      }
    };

    void sync();

    window.addEventListener("focus", sync);
    const id = window.setInterval(sync, 15_000);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", sync);
      window.clearInterval(id);
    };
  }, []);

  const onPublish = useCallback(
    async (data: Data) => {
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
    },
    [router, storageKey],
  );

  return (
    <div className="puck-theme-wrapper h-full min-h-0">
      <Puck
        config={config}
        data={initial}
        onPublish={onPublish}
        iframe={{ enabled: false }}
      />
    </div>
  );
}