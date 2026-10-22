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
    // Меняем "blockquote" на "div", чтобы не наследовать глобальные стили цитат
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: "custom-blockquote",
      }),
      0,
    ]
  },
})