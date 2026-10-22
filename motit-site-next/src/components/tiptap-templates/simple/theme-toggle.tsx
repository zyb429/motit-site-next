"use client"

import { Button } from "@/components/tiptap-ui-primitive/button"
import { MoonStarIcon } from "@/components/tiptap-icons/moon-star-icon"
import { SunIcon } from "@/components/tiptap-icons/sun-icon"

interface ThemeToggleProps {
  isDark: boolean
  onToggle: () => void
  disabled?: boolean
}

export function ThemeToggle({ isDark, onToggle, disabled }: ThemeToggleProps) {
  return (
    <Button
      type="button"
      onClick={onToggle}
      variant="ghost"
      disabled={disabled}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? (
        <MoonStarIcon className="tiptap-button-icon" />
      ) : (
        <SunIcon className="tiptap-button-icon" />
      )}
    </Button>
  )
}