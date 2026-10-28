"use client";

import dynamic from "next/dynamic";
import type { Data } from "@puckeditor/core";

const PuckEditorShell = dynamic(
  () => import("@/components/admin/PuckEditorShell").then((m) => m.PuckEditorShell),
  { ssr: false, loading: () => <div className="p-6">Загрузка редактора…</div> }
);

export function PuckEditorLoader({
  storageKey,
  initial,
}: {
  storageKey: "puck_header" | "puck_footer" | "puck_home";
  initial: Data;
}) {
  return <PuckEditorShell storageKey={storageKey} initial={initial} />;
}