"use client"

import { useCallback, useEffect, useState } from "react"
import type { Editor } from "@tiptap/react"
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
} from "@floating-ui/react"
import { useClickOutside } from "@/hooks/use-click-outside"
import { useEscapeKey } from "@/hooks/use-escape-key"

export interface UseLinkPopoverFloatingOptions {
  editor: Editor | null
  /**
   * Селектор элементов, клик по которым не должен закрывать попап.
   * По умолчанию — кнопка ссылки в тулбаре (aria-label="Link"),
   * чтобы избежать мерцания при повторном нажатии.
   */
  ignoreSelector?: string
}

/**
 * Строит DOMRect текущего выделения в редакторе.
 * Используется как virtual reference для floating-ui.
 */
function getSelectionRect(editor: Editor) {
  try {
    const { from, to } = editor.state.selection
    const start = editor.view.coordsAtPos(from)
    const end = editor.view.coordsAtPos(to)

    return {
      x: Math.min(start.left, end.left),
      y: Math.min(start.top, end.top),
      width: Math.max(Math.abs(end.left - start.left), 1),
      height: Math.max(Math.abs(end.bottom - start.bottom), 1),
      top: Math.min(start.top, end.top),
      left: Math.min(start.left, end.left),
      right: Math.max(start.right, end.right),
      bottom: Math.max(start.bottom, end.bottom),
    }
  } catch {
    return {
      x: 0,
      y: 0,
      width: 1,
      height: 1,
      top: 0,
      left: 0,
      right: 1,
      bottom: 1,
    }
  }
}

/**
 * Управляет попапом ссылки, позиционируя его у текущего выделения.
 * Инкапсулирует useFloating, пересчёт позиции при selectionUpdate,
 * закрытие по Escape и клику вне.
 */
export function useLinkPopoverFloating({
  editor,
  ignoreSelector = '[aria-label="Link"]',
}: UseLinkPopoverFloatingOptions) {
  const [isOpen, setIsOpen] = useState(false)

  const { refs, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "bottom",
    strategy: "fixed",
    middleware: [offset(8), flip(), shift()],
    whileElementsMounted: autoUpdate,
  })

  const setReferenceFromSelection = useCallback(() => {
    if (!editor) return
    refs.setReference({
      getBoundingClientRect: () => getSelectionRect(editor),
    })
  }, [editor, refs])

  const open = useCallback(() => {
    if (!editor) return
    setReferenceFromSelection()
    setIsOpen(true)
  }, [editor, setReferenceFromSelection])

  const close = useCallback(() => setIsOpen(false), [])

  // Пересчитываем позицию при изменении выделения, пока попап открыт.
  useEffect(() => {
    if (!editor || !isOpen) return

    const update = () => setReferenceFromSelection()
    editor.on("selectionUpdate", update)

    return () => {
      editor.off("selectionUpdate", update)
    }
  }, [editor, isOpen, setReferenceFromSelection])

  useEscapeKey(close, isOpen)
  useClickOutside(refs.floating, close, isOpen, ignoreSelector)

  return {
    isOpen,
    open,
    close,
    setFloatingRef: refs.setFloating,
    floatingStyles,
  }
}