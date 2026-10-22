"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  EditorContent,
  EditorContext,
  useEditor,
  ReactNodeViewRenderer,
  useCurrentEditor,
} from "@tiptap/react"
import type { JSONContent } from "@tiptap/core"
import "@/styles/_variables.scss"

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { FindAndReplace } from "@tiptap/extension-find-and-replace"
import { Selection } from "@tiptap/extensions"
import { TableKit } from "@tiptap/extension-table"

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Spacer } from "@/components/tiptap-ui-primitive/spacer"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar"

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension"
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import { TaskItemNode } from "@/components/tiptap-node/task-item/task-item-node"
import { ImageNode } from "@/components/tiptap-node/image-node/image-node"
import { CustomBlockquote } from "@/components/tiptap-node/blockquote-node/blockquote-extension"
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/heading-node/heading-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu"
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button"
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu"
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button"
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button"
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "@/components/tiptap-ui/color-highlight-popover"
import { LinkContent, LinkButton } from "@/components/tiptap-ui/link-popover"
import { MarkButton } from "@/components/tiptap-ui/mark-button"
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button"
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button"
import {
  SearchAndReplace,
  SearchAndReplaceButton,
} from "@/components/tiptap-ui/search-and-replace"
import { TableControls } from "@/components/tiptap-ui/table-controls"

// --- Icons ---
import { ArrowLeftIcon } from "@/components/tiptap-icons/arrow-left-icon"
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon"
import { Table, Quote } from "lucide-react"

// --- Hooks ---
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint"
import { useLinkPopoverFloating } from "@/hooks/use-link-popover-floating"

// --- Components ---
import { ThemeToggle } from "@/components/tiptap-templates/simple/theme-toggle"

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils"

// --- Styles ---
import "@/components/tiptap-templates/simple/simple-editor.scss"
import "@/components/tiptap-node/list-node/list-node.scss"

const SEARCH_AND_REPLACE_SCROLL_OPTIONS: ScrollIntoViewOptions = {
  block: "center",
}

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  onSearchAndReplaceClick,
  isSearchAndReplaceOpen,
  searchAndReplaceButtonRef,
  isMobile,
}: {
  onHighlighterClick: () => void
  onLinkClick: () => void
  onSearchAndReplaceClick: () => void
  isSearchAndReplaceOpen: boolean
  searchAndReplaceButtonRef: React.RefObject<HTMLButtonElement | null>
  isMobile: boolean
}) => {
  const { editor } = useCurrentEditor()

  return (
    <>
      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu modal={false} levels={[1, 2, 3, 4]} />
        <ListDropdownMenu
          modal={false}
          types={["bulletList", "orderedList", "taskList"]}
        />
        <BlockquoteButton />
        <CodeBlockButton />
        <Button
          type="button"
          variant="ghost"
          onClick={() =>
            editor
              ?.chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
          title="Вставить таблицу"
        >
          <Table className="tiptap-button-icon" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            if (!editor) return
            if (!editor.isActive("blockquote")) {
              alert("Поставьте курсор в цитату, чтобы добавить автора")
              return
            }
            const current = editor.getAttributes("blockquote").author || ""
            const author = window.prompt("Автор цитаты:", current)
            if (author === null) return
            editor
              .chain()
              .focus()
              .updateAttributes("blockquote", {
                author: author.trim() || null,
              })
              .run()
          }}
          title="Автор цитаты"
        >
          <Quote className="tiptap-button-icon" />
        </Button>
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        <LinkButton onClick={onLinkClick} />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageUploadButton text="Add" />
      </ToolbarGroup>

      <Spacer />

      {isMobile && <ToolbarSeparator />}

      <ToolbarGroup>
        <SearchAndReplaceButton
          ref={searchAndReplaceButtonRef}
          aria-expanded={isSearchAndReplaceOpen}
          data-active-state={isSearchAndReplaceOpen ? "on" : "off"}
          onClick={onSearchAndReplaceClick}
        />
        <ThemeToggle />
      </ToolbarGroup>
    </>
  )
}

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter"
  onBack: () => void
}) => (
  <>
    <ToolbarGroup>
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        <HighlighterIcon className="tiptap-button-icon" />
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    <ColorHighlightPopoverContent />
  </>
)

export type SimpleEditorProps = {
  initialContent?: JSONContent | null
  onChange?: (json: JSONContent) => void
  editable?: boolean
  placeholder?: string
}

function isValidTiptapDoc(input: unknown): input is JSONContent {
  return (
    !!input &&
    typeof input === "object" &&
    !Array.isArray(input) &&
    (input as JSONContent).type === "doc" &&
    Array.isArray((input as JSONContent).content)
  )
}

export function SimpleEditor({
  initialContent,
  onChange,
  editable = true,
}: SimpleEditorProps) {
  const isMobile = useIsBreakpoint()
  const [mobileView, setMobileView] = useState<"main" | "highlighter">("main")
  const [isSearchAndReplaceOpen, setIsSearchAndReplaceOpen] = useState(false)
  const searchAndReplaceButtonRef = useRef<HTMLButtonElement>(null)

  // Ссылки на editor и linkPopover для handleClick
  const editorRef = useRef<ReturnType<typeof useEditor>>(null)
  const linkPopoverRef = useRef<ReturnType<typeof useLinkPopoverFloating> | null>(null)

  const editor = useEditor({
    immediatelyRender: false,
    editable,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
      handleClick: (view, pos, event) => {
        const target = event.target as HTMLElement
        const linkElement = target.closest("a")

        if (linkElement && view.dom.contains(linkElement)) {
          // Откладываем, чтобы Tiptap успел обновить selection
          setTimeout(() => {
            const ed = editorRef.current
            const lp = linkPopoverRef.current
            if (ed && lp) {
              ed.chain().focus().extendMarkRange("link").run()
              lp.open()
            }
          }, 0)
          return false
        }

        return false
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        blockquote: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      CustomBlockquote,
      TableKit.configure({
        table: { resizable: true },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.extend({
        addNodeView() {
          return ReactNodeViewRenderer(TaskItemNode)
        },
      }).configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image.extend({
        addNodeView() {
          return ReactNodeViewRenderer(ImageNode)
        },
      }),
      Typography,
      Superscript,
      Subscript,
      Selection,
      FindAndReplace.configure({
        searchDebounceMs: 500,
        injectCSS: false,
      }),
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
    ],
    content: isValidTiptapDoc(initialContent) ? initialContent : undefined,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON())
    },
  })

  const linkPopover = useLinkPopoverFloating({ editor })

  // Сохраняем актуальные ссылки
  useEffect(() => {
    editorRef.current = editor
  }, [editor])

  useEffect(() => {
    linkPopoverRef.current = linkPopover
  }, [linkPopover])

  useEffect(() => {
    if (editor && !initialContent) {
      onChange?.(editor.getJSON())
    }
  }, [editor, initialContent, onChange])

  useEffect(() => {
    if (editor) editor.setEditable(editable)
  }, [editor, editable])

  useEffect(() => {
    if (!editor) return
    if (isValidTiptapDoc(initialContent)) {
      editor.commands.setContent(initialContent, { emitUpdate: false })
    }
  }, [editor, initialContent])

  useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main")
    }
  }, [isMobile, mobileView])

  const openSearchAndReplace = useCallback(() => {
    setMobileView("main")
    setIsSearchAndReplaceOpen(true)
  }, [])

  const closeSearchAndReplace = useCallback(() => {
    setIsSearchAndReplaceOpen(false)
    searchAndReplaceButtonRef.current?.focus()
  }, [])

  const toggleSearchAndReplace = useCallback(() => {
    if (isSearchAndReplaceOpen) {
      closeSearchAndReplace()
      return
    }
    openSearchAndReplace()
  }, [closeSearchAndReplace, isSearchAndReplaceOpen, openSearchAndReplace])

  const handleLinkClick = useCallback(() => {
    setMobileView("main")
    linkPopover.open()
  }, [linkPopover])

  return (
    <div className="simple-editor-wrapper">
      <EditorContext.Provider value={{ editor }}>
        <Toolbar variant="fixed" className="simple-editor-toolbar">
          {mobileView === "main" ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView("highlighter")}
              onLinkClick={handleLinkClick}
              onSearchAndReplaceClick={toggleSearchAndReplace}
              isSearchAndReplaceOpen={isSearchAndReplaceOpen}
              searchAndReplaceButtonRef={searchAndReplaceButtonRef}
              isMobile={isMobile}
            />
          ) : (
            <MobileToolbarContent
              type="highlighter"
              onBack={() => setMobileView("main")}
            />
          )}
        </Toolbar>

        {/* Панель управления таблицей */}
        <TableControls />

        <SearchAndReplace
          className="simple-editor-search-and-replace"
          open={isSearchAndReplaceOpen}
          onOpen={openSearchAndReplace}
          onClose={closeSearchAndReplace}
          scrollIntoViewOptions={SEARCH_AND_REPLACE_SCROLL_OPTIONS}
        />

        {linkPopover.isOpen && (
          <div
            ref={linkPopover.setFloatingRef}
            style={{ ...linkPopover.floatingStyles, zIndex: 50 }}
          >
            <LinkContent editor={editor} />
          </div>
        )}

        <EditorContent
          editor={editor}
          role="presentation"
          className="simple-editor-content"
        />
      </EditorContext.Provider>
    </div>
  )
}