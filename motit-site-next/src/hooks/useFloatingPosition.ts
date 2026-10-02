// src/hooks/useFloatingPosition.ts
"use client";

import { useLayoutEffect, useRef, useState } from "react";

type Coords = { x: number; y: number };

export function useFloatingPosition(
  initial: Coords,
  opts: { padding?: number } = {},
) {
  const { padding = 8 } = opts;
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<Coords>(initial);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const recalc = () => {
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const winW = window.innerWidth;
      const winH = window.innerHeight;

      let nx = initial.x;
      let ny = initial.y;

      if (nx + rect.width > winW - padding) {
        nx = Math.max(padding, winW - rect.width - padding);
      }
      if (ny + rect.height > winH - padding) {
        ny = Math.max(padding, winH - rect.height - padding);
      }
      if (nx < padding) nx = padding;
      if (ny < padding) ny = padding;

      setPos({ x: nx, y: ny });
    };

    recalc();

    const ro = new ResizeObserver(recalc);
    ro.observe(el);
    window.addEventListener("resize", recalc);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recalc);
    };
  }, [initial.x, initial.y, padding]);

  return { ref, pos };
}
