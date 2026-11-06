// src/components/site/PrivacyRenderer.tsx
import { generateHTML } from "@tiptap/html";
import type { JSONContent } from "@tiptap/core";
import { StarterKit } from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { TaskList, TaskItem } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { TableKit } from "@tiptap/extension-table";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { lowlight } from "@/lib/lowlight";

// Кастомные ноды из редактора — чтобы цитаты и <hr> не терялись
import { CustomBlockquote } from "@/components/tiptap-node/blockquote-node/blockquote-extension";
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";

const EXTENSIONS = [
  StarterKit.configure({
    horizontalRule: false,
    blockquote: false,
    codeBlock: false,
    link: { openOnClick: false, enableClickSelection: true },
  }),
  // Те же кастомные ноды, что и в SimpleEditor
  CustomBlockquote,
  HorizontalRule,
  CodeBlockLowlight.configure({
    lowlight,
    defaultLanguage: "plaintext",
    enableTabIndentation: true,
    tabSize: 2,
  }),
  TableKit.configure({ table: { resizable: false } }),
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  TaskList,
  TaskItem.configure({ nested: true }),
  Highlight.configure({ multicolor: true }),
  Image,
  Superscript,
  Subscript,
  Typography,
];

export function PrivacyRenderer({ content }: { content: unknown }) {
  if (!content) return null;

  let json: JSONContent | null = null;

  if (typeof content === "string") {
    try {
      json = JSON.parse(content) as JSONContent;
    } catch {
      return null;
    }
  } else if (typeof content === "object") {
    json = content as JSONContent;
  }

  if (!json || Array.isArray(json) || json.type !== "doc") return null;

  const html = generateHTML(json, EXTENSIONS);

  return (
    <div
      className="post-content prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}