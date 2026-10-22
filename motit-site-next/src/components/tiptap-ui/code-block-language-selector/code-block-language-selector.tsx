"use client"

import { useEffect, useState } from "react"
import { useCurrentEditor } from "@tiptap/react"
import { common, createLowlight } from "lowlight"

const lowlight = createLowlight(common)

export function CodeBlockLanguageSelector() {
  const { editor } = useCurrentEditor()
  const [isActive, setIsActive] = useState(false)
  const [currentLang, setCurrentLang] = useState("plaintext")

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
      {lowlight.listLanguages().map((lang) => (
        <option key={lang} value={lang}>
          {lang}
        </option>
      ))}
    </select>
  )
}