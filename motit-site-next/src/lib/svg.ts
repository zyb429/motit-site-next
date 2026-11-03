// src/lib/svg.ts
/**
 * Превращает SVG-код в data:image/svg+xml,... (URL-encoded).
 *
 * - безопасно для кириллицы, `#`, кавычек;
 * - возвращает null, если строка пустая или не начинается с <svg;
 * - содержимое НЕ санитизируется (источник — админка).
 */
export function toSvgDataUrl(svg: string | null | undefined): string | null {
  if (!svg || typeof svg !== "string") return null;
  const trimmed = svg.trim();
  if (!trimmed.toLowerCase().startsWith("<svg")) return null;

  const encoded = encodeURIComponent(trimmed)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");

  return `data:image/svg+xml,${encoded}`;
}