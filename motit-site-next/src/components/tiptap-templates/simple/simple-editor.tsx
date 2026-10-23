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
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { FindAndReplace } from "@tiptap/extension-find-and-replace"
import { Selection } from "@tiptap/extensions"
import { TableKit } from "@tiptap/extension-table"
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight"
import { lowlight } from "@/lib/lowlight"

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
import { CodeBlockNode } from "@/components/tiptap-node/code-block-node/code-block-node"
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
import { CodeBlockLanguageSelector } from "@/components/tiptap-ui/code-block-language-selector"
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

const THEME_STORAGE_KEY = "simple-editor-theme"

type EditorTheme = "light" | "dark"

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  onSearchAndReplaceClick,
  isSearchAndReplaceOpen,
  searchAndReplaceButtonRef,
  isMobile,
  isEditorDark,
  onToggleEditorTheme,
  editorReady,
}: {
  onHighlighterClick: () => void
  onLinkClick: () => void
  onSearchAndReplaceClick: () => void
  isSearchAndReplaceOpen: boolean
  searchAndReplaceButtonRef: React.RefObject<HTMLButtonElement | null>
  isMobile: boolean
  isEditorDark: boolean
  onToggleEditorTheme: () => void
  editorReady: boolean
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
        <CodeBlockLanguageSelector />
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
        <ThemeToggle
          isDark={isEditorDark}
          onToggle={onToggleEditorTheme}
          disabled={!editorReady}
        />
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

  // ✅ Всегда стартуем с "dark" (как на сервере, так и на клиенте)
  const [editorTheme, setEditorTheme] = useState<EditorTheme>("dark")
  const [isThemeInitialized, setIsThemeInitialized] = useState(false)
  const [isSwitchingTheme, setIsSwitchingTheme] = useState(false)
  const isEditorDark = editorTheme === "dark"

  // ✅ Читаем сохраненную тему из localStorage после монтирования
  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY)
      if (stored === "light" || stored === "dark") {
        setEditorTheme(stored)
      }
    } catch (e) {}
    setIsThemeInitialized(true)
  }, [])

  const toggleEditorTheme = useCallback(() => {
    setIsSwitchingTheme(true)
    setEditorTheme((prev) => {
      const next: EditorTheme = prev === "dark" ? "light" : "dark"
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next)
      } catch (e) {}
      return next
    })
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsSwitchingTheme(false))
    })
  }, [])

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
        spellcheck: "false",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
      handleClick: (view, pos, event) => {
        const target = event.target as HTMLElement
        const linkElement = target.closest("a")

        if (linkElement && view.dom.contains(linkElement)) {
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
      handleTextInput: (view, from, to, text) => {
        const { $from } = view.state.selection
        if ($from.parent.type.name === "codeBlock") {
          const fixed = text
            .replace(/[“”]/g, '"')
            .replace(/[‘’]/g, "'")
            .replace(/[–—]/g, "-")
            .replace(/…/g, "...")
          if (fixed !== text) {
            view.dispatch(view.state.tr.insertText(fixed, from, to))
            return true
          }
        }
        return false
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        blockquote: false,
        codeBlock: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      CodeBlockLowlight.extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockNode)
        },
      }).configure({
        lowlight,
        defaultLanguage: "plaintext",
        enableTabIndentation: true,
        tabSize: 2,
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

  useEffect(() => {
    if (!editor) return

    const cleanCodeBlocks = () => {
      let needsUpdate = false
      const { tr } = editor.state

      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === "codeBlock" && node.textContent) {
          const original = node.textContent
          const cleaned = original
            .replace(/\u200B/g, "")
            .replace(/\u2018/g, "'")
            .replace(/\u2019/g, "'")
            .replace(/\u201C/g, '"')
            .replace(/\u201D/g, '"')

          if (cleaned !== original) {
            const start = pos + 1
            const end = pos + node.nodeSize - 1
            tr.insertText(cleaned, start, end)
            needsUpdate = true
          }
        }
      })

      if (needsUpdate) {
        editor.view.dispatch(tr)
      }
    }

    editor.on("update", cleanCodeBlocks)
    cleanCodeBlocks()

    return () => {
      editor.off("update", cleanCodeBlocks)
    }
  }, [editor])

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

  const wrapperClassName = [
    "simple-editor-wrapper",
    isEditorDark ? "dark" : "light",
    isSwitchingTheme ? "is-switching-theme" : "",
  ]
    .filter(Boolean)
    .join(" ")

  // ✅ Пока тема не инициализирована, рендерим заглушку с жестко заданным фоном
  if (!isThemeInitialized) {
    return (
      <div
        className="simple-editor-wrapper dark"
        style={{ minHeight: "400px", backgroundColor: "#0b1f26" }}
      />
    )
  }

  return (
    <div className={wrapperClassName}>
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
              isEditorDark={isEditorDark}
              onToggleEditorTheme={toggleEditorTheme}
              editorReady={!!editor}
            />
          ) : (
            <MobileToolbarContent
              type="highlighter"
              onBack={() => setMobileView("main")}
            />
          )}
        </Toolbar>

        <TableControls />

        {/* Оборачиваем floating-компоненты в .dark/.light, чтобы их стили
            тоже реагировали на локальную тему редактора */}
        <div className={isEditorDark ? "dark" : "light"}>
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
              className={isEditorDark ? "dark" : "light"}
              style={{ ...linkPopover.floatingStyles, zIndex: 50 }}
            >
              <LinkContent editor={editor} />
            </div>
          )}
        </div>

        <EditorContent
          editor={editor}
          role="presentation"
          className="simple-editor-content"
        />
      </EditorContext.Provider>
    </div>
  )
}