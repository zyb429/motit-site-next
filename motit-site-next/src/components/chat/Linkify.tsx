// src/components/chat/Linkify.tsx
"use client";

import type { ReactNode } from "react";

// Регэксп для URL: http(s)://..., www...., и «голых» домены (motit.by)
const URL_REGEX =
  /\b(?:https?:\/\/|www\.)[^\s<>"']+|\b(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s<>"']*)?/gi;

function trimTrailingPunctuation(url: string): {
  clean: string;
  trailing: string;
} {
  // Отрезаем знаки препинания в конце, которые не часть URL
  const match = url.match(/[.,!?;:)\]}]+$/);
  if (!match) return { clean: url, trailing: "" };
  return {
    clean: url.slice(0, -match[0].length),
    trailing: match[0],
  };
}

function hrefFor(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  if (/^www\./i.test(url)) return `https://${url}`;
  return `https://${url}`;
}

export function Linkify({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  for (const match of text.matchAll(URL_REGEX)) {
    const raw = match[0];
    const index = match.index ?? 0;

    // Текст перед ссылкой
    if (index > lastIndex) {
      nodes.push(text.slice(lastIndex, index));
    }

    const { clean, trailing } = trimTrailingPunctuation(raw);

    // Не линкуем "1.5" и похожее
    if (clean.length < 4 || /^\d+\.\d+$/.test(clean)) {
      nodes.push(raw);
    } else {
      nodes.push(
        <a
          key={`link-${key++}`}
          href={hrefFor(clean)}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:opacity-80 break-all"
          onClick={(e) => e.stopPropagation()}
        >
          {clean}
        </a>,
      );
      if (trailing) nodes.push(trailing);
    }

    lastIndex = index + raw.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return <>{nodes}</>;
}