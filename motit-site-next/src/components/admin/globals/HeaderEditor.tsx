"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Save, Trash2, Loader2 } from "lucide-react"
import type { HeaderContent } from "@/lib/globals-types"

const inputClass =
  "w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded-md text-[var(--text-primary)] text-sm focus:border-[var(--accent)] outline-none"

export function HeaderEditor() {
  const [data, setData] = useState<HeaderContent | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/admin/globals/header")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setError("Не удалось загрузить"))
  }, [])

  const save = async () => {
    if (!data) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/globals/header", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      alert("Сохранено")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка")
    } finally {
      setSaving(false)
    }
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
        Загрузка…
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[var(--bg-primary)]">
      <header className="shrink-0 h-20 px-4 sm:px-6 flex items-center gap-3 border-b border-[var(--border)] bg-[var(--bg-card)]">
        <Link
          href="/admin/settings"
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-[var(--text-primary)]">Хедер</h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Логотип, меню, кнопка
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="ml-auto px-4 py-2 bg-[var(--accent)] text-white rounded-md text-sm flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Сохранить
        </button>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-500/10 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Логотип */}
          <section className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Логотип
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-[var(--text-secondary)]">
                  Текст
                </label>
                <input
                  value={data.logo.text}
                  onChange={(e) =>
                    setData({
                      ...data,
                      logo: { ...data.logo, text: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-[var(--text-secondary)]">
                  Ссылка
                </label>
                <input
                  value={data.logo.href}
                  onChange={(e) =>
                    setData({
                      ...data,
                      logo: { ...data.logo, href: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* Меню */}
          <section className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Меню
              </h2>
              <button
                type="button"
                onClick={() =>
                  setData({
                    ...data,
                    nav: [
                      ...data.nav,
                      { label: "", href: "", external: false },
                    ],
                  })
                }
                className="text-xs text-[var(--accent)] flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Добавить пункт
              </button>
            </div>
            {data.nav.length === 0 && (
              <p className="text-xs text-[var(--text-muted)]">Пунктов нет</p>
            )}
            {data.nav.map((item, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center"
              >
                <input
                  placeholder="Название"
                  value={item.label}
                  onChange={(e) => {
                    const nav = [...data.nav]
                    nav[i] = { ...nav[i], label: e.target.value }
                    setData({ ...data, nav })
                  }}
                  className={inputClass}
                />
                <input
                  placeholder="/ссылка"
                  value={item.href}
                  onChange={(e) => {
                    const nav = [...data.nav]
                    nav[i] = { ...nav[i], href: e.target.value }
                    setData({ ...data, nav })
                  }}
                  className={inputClass}
                />
                <label className="text-xs text-[var(--text-secondary)] flex items-center gap-1 shrink-0">
                  <input
                    type="checkbox"
                    checked={item.external}
                    onChange={(e) => {
                      const nav = [...data.nav]
                      nav[i] = { ...nav[i], external: e.target.checked }
                      setData({ ...data, nav })
                    }}
                  />
                  Внешняя
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setData({
                      ...data,
                      nav: data.nav.filter((_, idx) => idx !== i),
                    })
                  }
                  className="text-red-400 p-2 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </section>

          {/* CTA */}
          <section className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Кнопка CTA
            </h2>
            <label className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
              <input
                type="checkbox"
                checked={data.cta.enabled}
                onChange={(e) =>
                  setData({
                    ...data,
                    cta: { ...data.cta, enabled: e.target.checked },
                  })
                }
              />
              Показывать
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-[var(--text-secondary)]">
                  Текст
                </label>
                <input
                  value={data.cta.label}
                  onChange={(e) =>
                    setData({
                      ...data,
                      cta: { ...data.cta, label: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-[var(--text-secondary)]">
                  Ссылка
                </label>
                <input
                  value={data.cta.href}
                  onChange={(e) =>
                    setData({
                      ...data,
                      cta: { ...data.cta, href: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}