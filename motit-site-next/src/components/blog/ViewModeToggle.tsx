// src/components/blog/ViewModeToggle.tsx
"use client";

import { LayoutList, LayoutGrid } from "lucide-react";
import type { View } from "@/lib/view";

export type ViewMode = View;

interface ViewModeToggleProps {
  value: View;
  onChange: (mode: View) => void;
}

const MODES: { value: View; label: string; Icon: typeof LayoutList }[] = [
  { value: "list", label: "Список", Icon: LayoutList },
  { value: "tiles", label: "Плитки", Icon: LayoutGrid },
];

export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 bg-[#0d2029] border border-[rgba(45,212,191,0.08)] rounded-full p-1">
      {MODES.map(({ value: mode, label, Icon }) => {
        const isActive = value === mode;
        return (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            title={label}
            aria-label={label}
            aria-pressed={isActive}
            className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
              isActive
                ? "bg-[#2dd4bf] text-[#0a1920]"
                : "text-gray-400 hover:text-[#e0f7fa] hover:bg-[#2dd4bf]/10"
            }`}
          >
            <Icon size={16} />
          </button>
        );
      })}
    </div>
  );
}
