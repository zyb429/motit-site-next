"use client"

import { useEffect } from "react"

export function CodeBlockCopyHandler() {
  useEffect(() => {
    const handler = async (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const btn = target.closest<HTMLButtonElement>(".code-block-copy")
      if (!btn) return

      const wrapper = btn.closest(".code-block-wrapper")
      if (!wrapper) return

      // Только для публичной страницы поста, не вмешиваемся в редактор
      if (!wrapper.closest(".post-content")) return

      const codeEl =
        wrapper.querySelector<HTMLElement>(".code-block-content") ??
        wrapper.querySelector<HTMLElement>("pre code")

      if (!codeEl) return

      const text = codeEl.textContent ?? ""

      try {
        await navigator.clipboard.writeText(text)
      } catch {
        const ta = document.createElement("textarea")
        ta.value = text
        ta.style.position = "fixed"
        ta.style.opacity = "0"
        document.body.appendChild(ta)
        ta.select()
        try {
          document.execCommand("copy")
        } finally {
          document.body.removeChild(ta)
        }
      }

      const original = btn.innerHTML
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
      btn.setAttribute("aria-label", "Скопировано")
      btn.setAttribute("title", "Скопировано")
      setTimeout(() => {
        btn.innerHTML = original
        btn.setAttribute("aria-label", "Копировать код")
        btn.setAttribute("title", "Копировать код")
      }, 2000)
    }

    document.addEventListener("click", handler)
    return () => document.removeEventListener("click", handler)
  }, [])

  return null
}