"use client"

import { NodeViewWrapper, NodeViewContent, type NodeViewProps } from "@tiptap/react"

export function CodeBlockNode(props: NodeViewProps) {
  const { node } = props
  const language = node.attrs.language || "plaintext"

  return (
    <NodeViewWrapper className="code-block-wrapper" data-language={language}>
      <div className="code-block-header" contentEditable={false}>
        <span className="code-block-lang">{language}</span>
      </div>
      <pre>
        <NodeViewContent as="code" className="code-block-content" />
      </pre>
    </NodeViewWrapper>
  )
}