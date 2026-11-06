// src/app/privacy-policy/document/page.tsx
//
// ВАЖНО: этот файл НЕ в группе (site), поэтому не наследует layout
// с шапкой и футером — именно это и нужно для «минимального документа».
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { FileText, Download } from "lucide-react";
import { getPrivacyPolicy } from "@/lib/db/privacy";
import { PrivacyRenderer } from "@/components/site/PrivacyRenderer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Политика конфиденциальности (документ)",
  description: "Политика конфиденциальности сайта Motit",
  robots: { index: false, follow: false },
};

export default async function PrivacyPolicyDocumentPage() {
  const policy = await getPrivacyPolicy();
  if (!policy) notFound();

  // В этом URL ожидаем document-режим. Если редактор переключил на другой —
  // отправляем на соответствующую страницу, чтобы не было «мёртвого» URL.
  if (policy.displayMode === "page") {
    redirect("/privacy-policy");
  }

  if (policy.displayMode === "file") {
    // В document-URL, но режим file — показываем файл, чтобы не 404
    if (policy.file) {
      return (
        <main className="min-h-screen bg-white dark:bg-(--bg-primary) py-6">
          <article className="container mx-auto px-4 max-w-3xl">
            <div className="rounded-xl border border-(--border) bg-(--bg-card) p-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-8 h-8 text-(--accent) shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm text-(--text-primary) truncate">
                    {policy.fileName ??
                      policy.file.name ??
                      "Политика конфиденциальности"}
                  </div>
                </div>
              </div>
              <a
                href={policy.file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-(--accent) text-(--bg-primary) hover:bg-(--accent-hover) transition-colors font-medium text-sm shrink-0"
              >
                <Download className="w-4 h-4" />
                Скачать
              </a>
            </div>
          </article>
        </main>
      );
    }
    if (policy.content) {
      return (
        <main className="min-h-screen bg-white dark:bg-(--bg-primary) py-6">
          <article className="container mx-auto px-4 max-w-3xl">
            <PrivacyRenderer content={policy.content} />
          </article>
        </main>
      );
    }
    notFound();
  }

  // === Режим "document" ===
  if (!policy.content) {
    return (
      <main className="min-h-screen bg-white dark:bg-(--bg-primary) py-6">
        <article className="container mx-auto px-4 max-w-3xl">
          <p className="text-(--text-muted)">Документ пока не заполнен.</p>
        </article>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-(--bg-primary) py-6">
      <article className="container mx-auto px-4 max-w-3xl">
        <PrivacyRenderer content={policy.content} />
      </article>
    </main>
  );
}