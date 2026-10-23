"use client"

import { useEffect, useState } from "react"
import { useCurrentEditor } from "@tiptap/react"

type Lang = { code: string; label: string }

export function CodeBlockLanguageSelector() {
  const { editor } = useCurrentEditor()
  const [isActive, setIsActive] = useState(false)
  const [currentLang, setCurrentLang] = useState("plaintext")
  const [languages, setLanguages] = useState<Lang[]>([])

  // Список включённых языков — из БД
  useEffect(() => {
    let cancelled = false
    fetch("/api/languages", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Lang[]) => {
        if (!cancelled) setLanguages(data)
      })
      .catch(() => {
        if (!cancelled) setLanguages([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!editor) return

    const update = () => {
      const active = editor.isActive("codeBlock")
      setIsActive(active)
      if (active) {
        setCurrentLang(editor.getAttributes("codeBlock").language || "plaintext")
      }
    }

    update()
    editor.on("selectionUpdate", update)
    editor.on("transaction", update)

    return () => {
      editor.off("selectionUpdate", update)
      editor.off("transaction", update)
    }
  }, [editor])

  if (!editor || !isActive) return null

  return (
    <select
      value={currentLang}
      onChange={(e) =>
        editor.chain().focus().setCodeBlock({ language: e.target.value }).run()
      }
      className="h-8 rounded border border-[var(--border)] bg-[var(--bg-primary)] px-2 text-xs text-[var(--text-primary)] outline-none"
      title="Язык кода"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.label}
        </option>
      ))}
    </select>
  )
}