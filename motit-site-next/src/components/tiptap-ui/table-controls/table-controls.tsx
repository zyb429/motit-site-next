"use client"

import { useState, useEffect } from "react"
import { useCurrentEditor } from "@tiptap/react"
import { Button } from "@/components/tiptap-ui-primitive/button"
import {
  ArrowUpToLine,
  ArrowDownToLine,
  ArrowLeftToLine,
  ArrowRightToLine,
  Trash2,
  Merge,
  Split,
} from "lucide-react"
import "./table-controls.scss"

export function TableControls() {
  const { editor } = useCurrentEditor()
  const [isInTable, setIsInTable] = useState(false)

  useEffect(() => {
    if (!editor) return

    const updateState = () => {
      // Проверяем, находится ли курсор внутри таблицы
      setIsInTable(editor.isActive("table"))
    }

    // Проверяем сразу при монтировании и при каждом обновлении
    updateState()
    editor.on("selectionUpdate", updateState)
    editor.on("transaction", updateState)

    return () => {
      editor.off("selectionUpdate", updateState)
      editor.off("transaction", updateState)
    }
  }, [editor])

  if (!editor || !isInTable) return null

  return (
    <div className="table-controls-wrapper">
      <div className="table-controls">
        <div className="table-controls-group">
          <span className="table-controls-label">Строки</span>
          <Button
            type="button"
            variant="ghost"
            onClick={() => editor.chain().focus().addRowBefore().run()}
            title="Вставить строку выше"
          >
            <ArrowUpToLine className="tiptap-button-icon" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            title="Вставить строку ниже"
          >
            <ArrowDownToLine className="tiptap-button-icon" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => editor.chain().focus().deleteRow().run()}
            title="Удалить строку"
          >
            <Trash2 className="tiptap-button-icon" />
          </Button>
        </div>

        <div className="table-controls-group">
          <span className="table-controls-label">Колонки</span>
          <Button
            type="button"
            variant="ghost"
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            title="Вставить колонку слева"
          >
            <ArrowLeftToLine className="tiptap-button-icon" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            title="Вставить колонку справа"
          >
            <ArrowRightToLine className="tiptap-button-icon" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            title="Удалить колонку"
          >
            <Trash2 className="tiptap-button-icon" />
          </Button>
        </div>

        <div className="table-controls-group">
          <span className="table-controls-label">Ячейки</span>
          <Button
            type="button"
            variant="ghost"
            onClick={() => editor.chain().focus().mergeCells().run()}
            title="Объединить ячейки"
          >
            <Merge className="tiptap-button-icon" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => editor.chain().focus().splitCell().run()}
            title="Разделить ячейку"
          >
            <Split className="tiptap-button-icon" />
          </Button>
        </div>

        <div className="table-controls-group">
          <Button
            type="button"
            variant="ghost"
            onClick={() => editor.chain().focus().deleteTable().run()}
            title="Удалить таблицу"
          >
            <Trash2 className="tiptap-button-icon" />
            <span className="ml-1">Удалить</span>
          </Button>
        </div>
      </div>
    </div>
  )
}