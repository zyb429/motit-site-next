import type { Editor, NodeWithPos } from "@tiptap/core"
import { Extension } from "@tiptap/core"
import type { EditorState, Transaction } from "@tiptap/pm/state"
import { getSelectedNodesOfType } from "@/lib/tiptap-utils"
import { updateNodesAttr } from "@/lib/tiptap-utils"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    nodeBackground: {
      setNodeBackgroundColor: (backgroundColor: string) => ReturnType
      unsetNodeBackgroundColor: () => ReturnType
      toggleNodeBackgroundColor: (backgroundColor: string) => ReturnType
    }
  }
}

export interface NodeBackgroundOptions {
  /**
   * Node types that should support background colors
   * @default ["paragraph", "heading", "blockquote", "taskList", "bulletList", "orderedList", "tableCell", "tableHeader"]
   */
  types: string[]
  /**
   * Use inline style instead of data attribute
   * @default true
   */
  useStyle?: boolean
  /**
   * The node attribute that stores the color. Set it to an attribute the
   * node types already define, such as ConvertKit's `background` on table
   * cells, so the color lands where those nodes render and export it.
   * @default "backgroundColor"
   */
  attributeName: string
}

const DEFAULT_ATTRIBUTE_NAME = "backgroundColor"

/**
 * The attribute the editor's NodeBackground extension writes, for UI that
 * reads the color back. Returns the default when the extension is missing.
 */
export function getNodeBackgroundAttributeName(editor: Editor | null): string {
  const attributeName: unknown = editor?.extensionManager.extensions.find(
    (extension) => extension.name === "nodeBackground"
  )?.options.attributeName

  return typeof attributeName === "string"
    ? attributeName
    : DEFAULT_ATTRIBUTE_NAME
}

/**
 * Determines the target color for toggle operations
 */
function getToggleColor(
  targets: NodeWithPos[],
  attributeName: string,
  inputColor: string
): string | null {
  if (targets.length === 0) return null

  for (const target of targets) {
    const currentColor = target.node.attrs?.[attributeName] ?? null
    if (currentColor !== inputColor) {
      return inputColor
    }
  }

  return null
}

export const NodeBackground = Extension.create<NodeBackgroundOptions>({
  name: "nodeBackground",

  addOptions() {
    return {
      types: [
        "paragraph",
        "heading",
        "blockquote",
        "taskList",
        "bulletList",
        "orderedList",
        "tableCell",
        "tableHeader",
      ],
      useStyle: true,
      attributeName: DEFAULT_ATTRIBUTE_NAME,
    }
  },

  addGlobalAttributes() {
    const { attributeName } = this.options

    return [
      {
        types: this.options.types,
        attributes: {
          [attributeName]: {
            default: null as string | null,

            parseHTML: (element: HTMLElement) => {
              const styleColor = element.style?.backgroundColor
              if (styleColor) return styleColor

              const dataColor = element.getAttribute("data-background-color")
              return dataColor || null
            },

            renderHTML: (attributes) => {
              const color = attributes[attributeName] as string | null
              if (!color) return {}

              if (this.options.useStyle) {
                return {
                  style: `background-color: ${color}`,
                }
              } else {
                return {
                  "data-background-color": color,
                }
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    /**
     * Generic command executor for background color operations
     */
    const executeBackgroundCommand = (
      getTargetColor: (
        targets: NodeWithPos[],
        inputColor?: string
      ) => string | null
    ) => {
      return (inputColor?: string) =>
        ({ state, tr }: { state: EditorState; tr: Transaction }) => {
          const targets = getSelectedNodesOfType(
            state.selection,
            this.options.types
          )

          if (targets.length === 0) return false

          const targetColor = getTargetColor(targets, inputColor)

          return updateNodesAttr(
            tr,
            targets,
            this.options.attributeName,
            targetColor
          )
        }
    }

    return {
      /**
       * Set background color to specific value
       */
      setNodeBackgroundColor: executeBackgroundCommand(
        (_, inputColor) => inputColor || null
      ),

      /**
       * Remove background color
       */
      unsetNodeBackgroundColor: executeBackgroundCommand(() => null),

      /**
       * Toggle background color (set if different/missing, unset if all have it)
       */
      toggleNodeBackgroundColor: executeBackgroundCommand(
        (targets, inputColor) =>
          getToggleColor(targets, this.options.attributeName, inputColor || "")
      ),
    }
  },
})
