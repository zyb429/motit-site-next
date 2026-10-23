// src/app/(admin)/admin/settings/languages/page.tsx
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Code2 } from "lucide-react"

type Lang = {
  id: number
  code: string
  label: string
  enabled: boolean
  sortOrder: number
}

export default function LanguagesSettingsPage() {
  const [langs, setLangs] = useState<Lang[]>([])
  const [loading, setLoading] = useState(true)
  const [newCode, setNewCode] = useState("")
  const [newLabel, setNewLabel] = useState("")
  const [busy, setBusy] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState("")

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/languages", { cache: "no-store" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setLangs(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const toggle = async (lang: Lang) => {
    setBusy(lang.id)
    setError(null)
    try {
      const res = await fetch(`/api/admin/languages/${lang.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !lang.enabled }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const updated = (await res.json()) as Lang
      setLangs((prev) => prev.map((l) => (l.id === updated.id ? updated : l)))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка обновления")
    } finally {
      setBusy(null)
    }
  }

  const remove = async (lang: Lang) => {
    if (!confirm(`Удалить язык "${lang.code}"?`)) return
    setBusy(lang.id)
    setError(null)
    try {
      const res = await fetch(`/api/admin/languages/${lang.id}`, {
        method: "DELETE",
      })
      if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`)
      setLangs((prev) => prev.filter((l) => l.id !== lang.id))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка удаления")
    } finally {
      setBusy(null)
    }
  }

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = newCode.trim().toLowerCase()
    if (!code) return
    setError(null)
    try {
      const res = await fetch("/api/admin/languages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, label: newLabel.trim() || code }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || `HTTP ${res.status}`)
        return
      }
      setLangs((prev) => [...prev, data as Lang])
      setNewCode("")
      setNewLabel("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка добавления")
    }
  }

  const filtered = filter.trim()
    ? langs.filter(
        (l) =>
          l.code.toLowerCase().includes(filter.toLowerCase()) ||
          l.label.toLowerCase().includes(filter.toLowerCase()),
      )
    : langs

  const enabledCount = langs.filter((l) => l.enabled).length

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-(--bg-primary)">
      {/* Хедер — фиксированный */}
      <header className="shrink-0 bg-(--bg-card) border-b border-(--border)">
        <div className="h-20 flex items-center gap-3 px-4 sm:px-6 max-w-6xl mx-auto w-full">
          <Link
            href="/admin/settings"
            className="text-(--text-muted) hover:text-(--text-primary) transition-colors shrink-0"
            aria-label="Назад"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-(--accent-dim) rounded-lg flex items-center justify-center shrink-0">
            <Code2 className="w-5 h-5 sm:w-6 sm:h-6 text-(--accent)" />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-xl font-bold text-(--text-primary) truncate">
              Языки программирования
            </h1>
            <p className="text-xs sm:text-sm text-(--text-secondary) truncate">
              {langs.length > 0
                ? `${enabledCount} из ${langs.length} включены`
                : "Управление подсветкой кода"}
            </p>
          </div>
        </div>
      </header>

      {/* Контент — скроллится */}
      <main className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto w-full space-y-6">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-500/10 text-red-400 text-sm border border-red-500/20">
              {error}
            </div>
          )}

          {/* Добавление */}
          <div className="bg-(--bg-card) border border-(--border) rounded-xl p-4 sm:p-6">
            <h2 className="text-sm font-semibold text-(--text-primary) mb-3">
              Добавить язык
            </h2>
            <form onSubmit={add} className="flex flex-wrap gap-2">
              <input
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="rust, go, python, ..."
                className="px-3 py-2 rounded-lg border border-(--border) bg-(--bg-secondary) text-sm text-(--text-primary) w-48 outline-none focus:border-(--accent)"
              />
              <input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Rust (опционально)"
                className="px-3 py-2 rounded-lg border border-(--border) bg-(--bg-secondary) text-sm text-(--text-primary) w-48 outline-none focus:border-(--accent)"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-(--accent) hover:opacity-90 text-white text-sm font-medium transition-opacity"
              >
                Добавить
              </button>
            </form>
            <p className="text-xs text-(--text-muted) mt-3">
              Имя должно совпадать с{" "}
              <a
                href="https://github.com/highlightjs/highlight.js/tree/main/src/languages"
                target="_blank"
                rel="noreferrer"
                className="text-(--accent) hover:underline"
              >
                именем языка в highlight.js
              </a>
              . Подсветка поддерживается для всех ~190 языков.
            </p>
          </div>

          {/* Список */}
          <div className="bg-(--bg-card) border border-(--border) rounded-xl">
            <div className="flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-(--border)">
              <h2 className="text-sm font-semibold text-(--text-primary)">
                Список языков
              </h2>
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Фильтр…"
                className="ml-auto px-3 py-1.5 rounded-lg border border-(--border) bg-(--bg-secondary) text-xs text-(--text-primary) w-40 outline-none focus:border-(--accent)"
              />
            </div>

            {loading ? (
              <div className="px-6 py-12 text-center text-sm text-(--text-muted)">
                Загрузка…
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-(--text-muted)">
                {langs.length === 0 ? (
                  <>
                    Список пуст. Запустите{" "}
                    <code className="px-1.5 py-0.5 rounded bg-(--bg-secondary) text-xs">
                      npm run seed:languages
                    </code>{" "}
                    или добавьте вручную выше.
                  </>
                ) : (
                  "Ничего не найдено"
                )}
              </div>
            ) : (
              <ul className="divide-y divide-(--border)">
                {filtered.map((lang) => (
                  <li
                    key={lang.id}
                    className="flex items-center gap-3 px-4 sm:px-6 py-2.5"
                  >
                    <input
                      type="checkbox"
                      checked={lang.enabled}
                      disabled={busy === lang.id}
                      onChange={() => toggle(lang)}
                      className="w-4 h-4 accent-(--accent) cursor-pointer"
                    />
                    <span className="font-mono text-sm text-(--text-primary) w-40 shrink-0">
                      {lang.code}
                    </span>
                    <span className="text-xs text-(--text-secondary) flex-1 truncate">
                      {lang.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(lang)}
                      disabled={busy === lang.id}
                      className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors"
                    >
                      Удалить
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}