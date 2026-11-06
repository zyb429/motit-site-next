// src/app/(site)/privacy-policy/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FileText, Download } from "lucide-react";
import { getPrivacyPolicy } from "@/lib/db/privacy";
import { PrivacyRenderer } from "@/components/site/PrivacyRenderer";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const policy = await getPrivacyPolicy();
  const isDocument = policy?.displayMode === "document";
  return {
    title: isDocument
      ? "Политика конфиденциальности (документ)"
      : "Политика конфиденциальности",
    description: "Политика конфиденциальности сайта Motit",
    robots: isDocument
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export default async function PrivacyPolicyPage() {
  const policy = await getPrivacyPolicy();
  if (!policy) notFound();

  // === Режим "file" ===
  if (policy.displayMode === "file") {
    if (!policy.file) notFound();
    return (
      <main className="min-h-screen bg-(--bg-primary) py-8 md:py-12">
        <article className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold text-(--text-primary) mb-6">
            Политика конфиденциальности
          </h1>
          <div className="rounded-xl border border-(--border) bg-(--bg-card) p-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <FileText className="w-8 h-8 text-(--accent) shrink-0" />
              <div className="min-w-0">
                <div className="text-sm text-(--text-primary) truncate">
                  {policy.fileName ?? policy.file.name ?? "Политика конфиденциальности"}
                </div>
                <div className="text-xs text-(--text-muted) truncate">
                  {policy.file.mime ?? "файл"}
                  {policy.file.size
                    ? ` · ${(policy.file.size / 1024 / 1024).toFixed(2)} MB`
                    : ""}
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

  // === Режим "document" ===
  if (policy.displayMode === "document") {
    return (
      <main className="min-h-screen bg-(--bg-primary) py-6">
        <article className="container mx-auto px-4 max-w-3xl">
          <PrivacyRenderer content={policy.content} />
        </article>
      </main>
    );
  }

  // === Режим "page" ===
  return (
    <main className="min-h-screen bg-(--bg-primary) py-8 md:py-12">
      <article className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold text-(--text-primary) mb-6">
          Политика конфиденциальности
        </h1>
        <PrivacyRenderer content={policy.content} />
      </article>
    </main>
  );
}