// src/lib/view.ts
export const VIEWS = ["tiles", "grid", "list"] as const;
export type View = (typeof VIEWS)[number];

export const DEFAULT_VIEW: View = "list";

export function parseView(v: string | null | undefined): View {
  return (VIEWS as readonly string[]).includes(v ?? "")
    ? (v as View)
    : DEFAULT_VIEW;
}
