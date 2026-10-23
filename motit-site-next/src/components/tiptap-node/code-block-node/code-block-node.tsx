"use client"

import { useState } from "react"
import { NodeViewWrapper, NodeViewContent, type NodeViewProps } from "@tiptap/react"
import { Check, Copy } from "lucide-react"

export function CodeBlockNode(props: NodeViewProps) {
  const { node } = props
  const language = node.attrs.language || "plaintext"
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const text = node.textContent
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback для браузеров без clipboard API
      const ta = document.createElement("textarea")
      ta.value = text
      ta.style.position = "fixed"
      ta.style.opacity = "0"
      document.body.appendChild(ta)
      ta.select()
      try {
        document.execCommand("copy")
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } finally {
        document.body.removeChild(ta)
      }
    }
  }

  return (
    <NodeViewWrapper className="code-block-wrapper" data-language={language}>
      <div className="code-block-header" contentEditable={false}>
        <span className="code-block-lang">{language}</span>
        <button
          type="button"
          className="code-block-copy"
          onClick={handleCopy}
          aria-label={copied ? "Скопировано" : "Копировать код"}
          title={copied ? "Скопировано" : "Копировать код"}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <pre>
        <NodeViewContent as="code" className="code-block-content" />
      </pre>
    </NodeViewWrapper>
  )
}