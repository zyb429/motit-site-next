// src/components/mobile-menu/MobileMenuButton.tsx
"use client";

import { Menu } from "lucide-react";

export function MobileMenuButton() {
  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(new CustomEvent("open-mobile-sidebar"));
      }}
      className="p-2 rounded-lg text-(--text-muted) hover:text-(--accent) hover:bg-(--accent-dim) transition-colors"
      aria-label="Открыть меню"
    >
      <Menu size={20} />
    </button>
  );
}
