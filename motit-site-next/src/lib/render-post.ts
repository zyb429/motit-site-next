// src/lib/render-post.ts
import { TaskList, TaskItem } from "@tiptap/extension-list"
import { generateHTML } from "@tiptap/html"
import StarterKit from "@tiptap/starter-kit"
import ImageExtension from "@tiptap/extension-image"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { TableKit } from "@tiptap/extension-table"
import type { JSONContent } from "@tiptap/core"
import * as cheerio from "cheerio"
import { lowlight } from "@/lib/lowlight"
import { toHtml } from "hast-util-to-html"
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight"
import { CustomBlockquote } from "@/components/tiptap-node/blockquote-node/blockquote-extension"

const TIPTAP_EXTENSIONS = [
  StarterKit.configure({
    blockquote: false,
    codeBlock: false,
    link: {
      openOnClick: false,
      HTMLAttributes: { class: "text-[#2dd4bf] hover:text-[#14b8a6]" },
    },
  }),
  CodeBlockLowlight.configure({
    lowlight,
    defaultLanguage: "plaintext",
  }),
  CustomBlockquote,
  TableKit.configure({ table: { resizable: true } }),
  ImageExtension,
  TaskList,
  TaskItem.configure({ nested: true }),
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Typography,
  Highlight.configure({ multicolor: true }),
  Superscript,
  Subscript,
]

function highlightCodeBlocks(html: string): string {
  if (!html) return html
  const $ = cheerio.load(html)

  $("pre").each((_, pre) => {
    const $pre = $(pre)
    const $code = $pre.find("code")
    if (!$code.length) return

    const className = $code.attr("class") || ""
    const lang = className.replace("language-", "").split(" ")[0] || "plaintext"

    const code = $code
      .text()
      .replace(/\u200B/g, "")
      .replace(/\u2018/g, "'")
      .replace(/\u2019/g, "'")
      .replace(/\u201C/g, '"')
      .replace(/\u201D/g, '"')

    try {
      const result = lowlight.highlight(lang, code)
      $code.html(toHtml(result))
      $code.addClass("hljs")
    } catch {
      $code.text(code)
      $code.addClass("hljs")
    }

    $code.addClass("code-block-content")

    const $wrapper = $('<div class="code-block-wrapper"></div>')
    const $header = $(
      `<div class="code-block-header">
        <span class="code-block-lang">${lang}</span>
      </div>`,
    )
    $pre.wrap($wrapper)
    $pre.before($header)
  })

  return $.html()
}

export function renderPostContent(raw: unknown): string {
  if (!raw) return ""

  try {
    let json: JSONContent | null = null

    if (typeof raw === "string") {
      const trimmed = raw.trim()
      if (!trimmed) return ""
      if (trimmed.startsWith("<")) return trimmed
      try {
        json = JSON.parse(trimmed)
      } catch {
        return ""
      }
    } else if (typeof raw === "object") {
      json = raw as JSONContent
    }

    if (!json) return ""
    if (Array.isArray(json)) return ""
    if (json.type !== "doc" && !json.content) return ""

    return highlightCodeBlocks(generateHTML(json, TIPTAP_EXTENSIONS))
  } catch (err) {
    console.error("[render-post] failed:", err)
    return ""
  }
}