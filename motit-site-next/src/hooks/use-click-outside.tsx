"use client"

import { useEffect, type RefObject } from "react"

/**
 * Вызывает handler при клике вне элемента ref.
 * Пропускает клики по элементам, совпадающим с ignoreSelector.
 */
export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  handler: (event: MouseEvent) => void,
  enabled = true,
  ignoreSelector?: string
) {
  useEffect(() => {
    if (!enabled) return

    const onClick = (e: MouseEvent) => {
      const el = ref.current
      if (!el) return

      const target = e.target as Node

      // клик внутри элемента — не трогаем
      if (el.contains(target)) return

      // клик по игнорируемому селектору (например, кнопка тулбара) — не трогаем
      if (ignoreSelector && (target as HTMLElement).closest?.(ignoreSelector)) {
        return
      }

      handler(e)
    }

    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [ref, handler, enabled, ignoreSelector])
}