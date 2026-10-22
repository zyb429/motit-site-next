"use client"

import { useState, useEffect } from "react"
import { NodeViewWrapper, NodeViewContent, type NodeViewProps } from "@tiptap/react"

export function BlockquoteNode(props: NodeViewProps) {
  const { node, updateAttributes } = props
  const [author, setAuthor] = useState(node.attrs.author || "")

  useEffect(() => {
    setAuthor(node.attrs.author || "")
  }, [node.attrs.author])

  return (
    <NodeViewWrapper className="blockquote-wrapper" data-author={author || undefined}>
      <NodeViewContent as="div" className="blockquote-content" />

      <div className="blockquote-author" contentEditable={false}>
        {/* Тире удалено */}
        <input
          type="text"
          className="blockquote-author-input"
          value={author}
          placeholder="Автор (необязательно)"
          onChange={(e) => {
            setAuthor(e.target.value)
            updateAttributes({ author: e.target.value || null })
          }}
        />
      </div>
    </NodeViewWrapper>
  )
}