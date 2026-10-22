import { Blockquote } from "@tiptap/extension-blockquote"
import { mergeAttributes } from "@tiptap/core"

export const CustomBlockquote = Blockquote.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      author: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-author"),
        renderHTML: (attributes) => {
          if (!attributes.author) return {}
          return { "data-author": attributes.author }
        },
      },
    }
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "blockquote",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ]
  },
})