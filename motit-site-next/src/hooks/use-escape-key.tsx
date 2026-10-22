"use client"

import { useEffect } from "react"

/**
 * Вызывает handler при нажатии Escape, пока enabled === true.
 */
export function useEscapeKey(handler: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handler()
    }

    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [handler, enabled])
}