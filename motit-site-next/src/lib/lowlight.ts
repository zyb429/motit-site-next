// src/lib/lowlight.ts
import { all, createLowlight } from "lowlight"

// Единый экземпляр на всё приложение.
// Используется в: SimpleEditor, code-block-language-selector, page.tsx (SSR).
// `all` — все ~190 языков highlight.js. Бандл растёт (~5 МБ), но только
// в клиентском бандле редактора (админка). Публичные страницы блог-постов
// используют lowlight только в server component — там это не влияет на клиент.
export const lowlight = createLowlight(all)