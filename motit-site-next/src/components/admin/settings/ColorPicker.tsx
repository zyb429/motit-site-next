"use client";

import { useState, useRef, useEffect } from "react";
import { HexColorPicker } from "react-colorful";

const PRESETS = [
  "#6366f1", "#2dd4bf", "#f59e0b", "#ef4444", "#ec4899",
  "#8b5cf6", "#06b6d4", "#22c55e", "#0a1920", "#111827",
];

// --- Утилиты конвертации ---
function hexToRgba(hex: string): { r: number; g: number; b: number; a: number } | null {
  const clean = hex.replace("#", "");
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return { r, g, b, a: 1 };
  }
  if (clean.length === 8) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    const a = parseInt(clean.slice(6, 8), 16) / 255;
    return { r, g, b, a: Math.round(a * 100) / 100 };
  }
  return null;
}

function rgbaToHex(r: number, g: number, b: number, a: number): string {
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  const alphaHex = Math.round(a * 255);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${alphaHex === 255 ? "" : toHex(alphaHex)}`;
}

function toRgbaString(r: number, g: number, b: number, a: number): string {
  return a < 1 ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`;
}

export function ColorPicker({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: string;
}) {
  const initialHex = defaultValue ?? "#6366f1";
  const initialRgba = hexToRgba(initialHex) ?? { r: 99, g: 102, b: 241, a: 1 };

  const [mode, setMode] = useState<"hex" | "rgba">("hex");
  const [color, setColor] = useState(initialHex);
  const [rgba, setRgba] = useState(initialRgba);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Закрытие при клике вне
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleHexChange = (hex: string) => {
    setColor(hex);
    const parsed = hexToRgba(hex);
    if (parsed) setRgba(parsed);
  };

  const handleRgbaChange = (field: "r" | "g" | "b" | "a", value: number) => {
    const clamped =
      field === "a"
        ? Math.max(0, Math.min(1, value))
        : Math.max(0, Math.min(255, Math.round(value)));
    const next = { ...rgba, [field]: clamped };
    setRgba(next);
    setColor(rgbaToHex(next.r, next.g, next.b, next.a));
  };

  const isValidHex = /^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(color);
  const safeColor = isValidHex ? color : "#6366f1";
  const safeRgba = isValidHex ? rgba : initialRgba;

  // Значение для скрытого поля (HEX, если альфа = 1, иначе RGBA-строка)
  const finalValue = safeRgba.a < 1
    ? toRgbaString(safeRgba.r, safeRgba.g, safeRgba.b, safeRgba.a)
    : safeColor;

  return (
    <div className="space-y-3" ref={ref}>
      {/* Переключатель режимов */}
      <div className="flex gap-2 text-xs">
        <button
          type="button"
          onClick={() => setMode("hex")}
          className={`px-2 py-1 rounded ${
            mode === "hex"
              ? "bg-(--accent) text-white"
              : "bg-(--bg-secondary) text-(--text-muted)"
          }`}
        >
          HEX
        </button>
        <button
          type="button"
          onClick={() => setMode("rgba")}
          className={`px-2 py-1 rounded ${
            mode === "rgba"
              ? "bg-(--accent) text-white"
              : "bg-(--bg-secondary) text-(--text-muted)"
          }`}
        >
          RGBA
        </button>
      </div>

      {/* Основные поля */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Превью */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-10 h-10 rounded-lg border border-(--border) shadow-sm cursor-pointer"
          style={{ backgroundColor: safeColor }}
          aria-label="Выбрать цвет"
        />

        {mode === "hex" ? (
          <>
            <input
              type="text"
              value={color}
              onChange={(e) => handleHexChange(e.target.value)}
              className="w-32 px-3 py-2 rounded-lg text-sm bg-(--bg-primary) text-(--text-primary) border border-(--border) focus:border-(--accent) outline-none font-mono"
              placeholder="#6366f1"
            />
            {!isValidHex && color && (
              <span className="text-xs text-red-400">Неверный HEX</span>
            )}
          </>
        ) : (
          <div className="flex items-center gap-1 flex-wrap">
            {(["r", "g", "b"] as const).map((field) => (
              <div key={field} className="flex items-center gap-1">
                <span className="text-xs text-(--text-muted) uppercase">{field}</span>
                <input
                  type="number"
                  min={0}
                  max={255}
                  value={rgba[field]}
                  onChange={(e) => handleRgbaChange(field, Number(e.target.value))}
                  className="w-14 px-2 py-1 rounded border border-(--border) bg-(--bg-primary) text-(--text-primary) text-xs"
                />
              </div>
            ))}
            <div className="flex items-center gap-1">
              <span className="text-xs text-(--text-muted)">A</span>
              <input
                type="number"
                min={0}
                max={1}
                step={0.1}
                value={rgba.a}
                onChange={(e) => handleRgbaChange("a", Number(e.target.value))}
                className="w-14 px-2 py-1 rounded border border-(--border) bg-(--bg-primary) text-(--text-primary) text-xs"
              />
            </div>
          </div>
        )}

        {color !== (defaultValue ?? "#6366f1") && (
          <button
            type="button"
            onClick={() => {
              handleHexChange(defaultValue ?? "#6366f1");
            }}
            className="text-xs text-(--text-muted) hover:text-(--text-primary)"
          >
            Сбросить
          </button>
        )}
      </div>

      {/* RGBA-слайдеры (всегда видны в RGBA-режиме) */}
      {mode === "rgba" && (
        <div className="space-y-2">
          {(["r", "g", "b", "a"] as const).map((field) => {
            const value = rgba[field];
            const max = field === "a" ? 1 : 255;
            const step = field === "a" ? 0.01 : 1;
            return (
              <input
                key={field}
                type="range"
                min={0}
                max={max}
                step={step}
                value={value}
                onChange={(e) => handleRgbaChange(field, Number(e.target.value))}
                className="w-full cursor-pointer"
              />
            );
          })}
        </div>
      )}

      {/* Пресеты */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => handleHexChange(p)}
            className={`w-7 h-7 rounded border cursor-pointer transition-transform hover:scale-110 ${
              color === p ? "ring-2 ring-(--accent)" : ""
            }`}
            style={{ backgroundColor: p, borderColor: "var(--border)" }}
            title={p}
          />
        ))}
      </div>

      {/* Палитра */}
      {open && (
        <div className="p-3 rounded-lg border border-(--border) bg-(--bg-card) shadow-lg">
          <HexColorPicker color={safeColor} onChange={handleHexChange} />
          <div className="flex justify-end mt-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-1 text-sm rounded bg-(--accent) text-white"
            >
              Готово
            </button>
          </div>
        </div>
      )}

      {/* Скрытое поле для формы */}
      <input type="hidden" name={name} value={finalValue} />
    </div>
  );
}