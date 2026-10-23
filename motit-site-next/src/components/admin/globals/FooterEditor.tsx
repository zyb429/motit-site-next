"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Plus,
  Save,
  Trash2,
  Loader2,
  Phone,
  Mail,
  MapPin,
  User,
  Upload,
  Image as ImageIcon,
} from "lucide-react"
import type { FooterContent } from "@/lib/globals-types"

const inputClass =
  "w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded-md text-[var(--text-primary)] text-sm focus:border-[var(--accent)] outline-none"

const ICONS = [
  { value: "phone", label: "Телефон", Icon: Phone },
  { value: "mail", label: "Email", Icon: Mail },
  { value: "map-pin", label: "Адрес", Icon: MapPin },
  { value: "user", label: "Пользователь", Icon: User },
] as const

const SOCIAL_NAMES = [
  "telegram", "vk", "youtube", "instagram",
  "whatsapp", "github", "twitter", "facebook", "linkedin", "support",
]

export function FooterEditor() {
  const [data, setData] = useState<FooterContent | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [logoError, setLogoError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/admin/globals/footer")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setError("Не удалось загрузить"))
  }, [])

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !data) return
    if (!file.type.startsWith("image/")) { setLogoError("Нужно изображение"); return }
    if (file.size > 1 * 1024 * 1024) { setLogoError("Максимум 1MB"); return }
    setIsUploadingLogo(true); setLogoError(null)
    try {
      const formData = new FormData()
      formData.append("files", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      const uploaded = Array.isArray(json) ? json[0] : json?.data?.[0]
      if (!uploaded?.url) throw new Error("Нет URL")
      setData({ ...data, logo: { ...data.logo, image_url: uploaded.url } })
    } catch (e) {
      setLogoError(e instanceof Error ? e.message : "Ошибка")
    } finally {
      setIsUploadingLogo(false)
      e.target.value = ""
    }
  }

  const save = async () => {
    if (!data) return
    setSaving(true); setError(null)
    try {
      const res = await fetch("/api/admin/globals/footer", {
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
    return <div className="flex items-center justify-center h-full text-[var(--text-muted)]">Загрузка…</div>
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[var(--bg-primary)]">
      <header className="shrink-0 h-20 px-4 sm:px-6 flex items-center gap-3 border-b border-[var(--border)] bg-[var(--bg-card)]">
        <Link href="/admin/settings" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-[var(--text-primary)] truncate">Футер</h1>
          <p className="text-xs text-[var(--text-secondary)] truncate">Лого, колонки, контакты, поддержка</p>
        </div>
        <button onClick={save} disabled={saving} className="ml-auto px-4 py-2 bg-[var(--accent)] text-white rounded-md text-sm flex items-center gap-2 disabled:opacity-50 shrink-0">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span className="hidden sm:inline">Сохранить</span>
        </button>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {error && <div className="px-4 py-3 rounded-lg bg-red-500/10 text-red-400 text-sm">{error}</div>}

          {/* ЛОГО */}
          <section className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Логотип и описание</h2>

            <div className="space-y-2">
              <label className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                <ImageIcon className="w-3 h-3" /> Логотип (SVG, PNG)
              </label>
              {data.logo.image_url ? (
                <div className="relative group inline-block">
                  <img src={data.logo.image_url} alt="Logo" className="h-12 w-auto rounded border border-[var(--border)] bg-white/5 p-2" />
                  <button type="button" onClick={() => setData({ ...data, logo: { ...data.logo, image_url: null } })} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2 px-3 py-2 border-2 border-dashed border-[var(--border)] rounded-lg cursor-pointer hover:border-[var(--accent)] hover:bg-[var(--accent-dim)] transition-colors">
                  {isUploadingLogo ? <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" /> : <Upload className="w-4 h-4 text-[var(--text-muted)]" />}
                  <span className="text-xs text-[var(--text-secondary)]">{isUploadingLogo ? "Загрузка…" : "Загрузить SVG или PNG"}</span>
                  <input type="file" accept="image/svg+xml,image/png,image/jpeg,image/webp" onChange={handleLogoUpload} disabled={isUploadingLogo} className="hidden" />
                </label>
              )}
              {logoError && <p className="text-xs text-red-400">{logoError}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-[var(--text-secondary)]">Текст лого (если нет картинки)</label>
                <input value={data.logo.text} onChange={(e) => setData({ ...data, logo: { ...data.logo, text: e.target.value } })} className={inputClass} />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-[var(--text-secondary)]">Ссылка лого</label>
                <input value={data.logo.href} onChange={(e) => setData({ ...data, logo: { ...data.logo, href: e.target.value } })} className={inputClass} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-[var(--text-secondary)]">Описание под лого</label>
              <textarea value={data.logo.description} onChange={(e) => setData({ ...data, logo: { ...data.logo, description: e.target.value } })} rows={3} className={inputClass} />
            </div>

            {/* СОЦСЕТИ */}
            <div className="space-y-2 pt-2 border-t border-[var(--border)]">
              <div className="flex items-center justify-between">
                <label className="text-xs text-[var(--text-secondary)]">Соцсети</label>
                <button type="button" onClick={() => setData({ ...data, social: [...data.social, { name: "telegram", href: "" }] })} className="text-xs text-[var(--accent)] flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Добавить
                </button>
              </div>
              {data.social.map((s, i) => (
                <div key={i} className="grid grid-cols-[100px_1fr_auto] sm:grid-cols-[140px_1fr_auto] gap-2 items-center">
                  <select value={s.name} onChange={(e) => {
                    const social = [...data.social]; social[i] = { ...social[i], name: e.target.value }; setData({ ...data, social })
                  }} className={inputClass}>
                    {SOCIAL_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <input placeholder="https://..." value={s.href} onChange={(e) => {
                    const social = [...data.social]; social[i] = { ...social[i], href: e.target.value }; setData({ ...data, social })
                  }} className={inputClass} />
                  <button type="button" onClick={() => setData({ ...data, social: data.social.filter((_, idx) => idx !== i) })} className="text-red-400 p-2 flex justify-center">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* КОЛОНКИ */}
          <section className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Колонки</h2>
              <button type="button" onClick={() => setData({ ...data, columns: [...data.columns, { title: "", type: "links", links: [], contacts: [] }] })} className="text-xs text-[var(--accent)] flex items-center gap-1">
                <Plus className="w-3 h-3" /> Добавить колонку
              </button>
            </div>

            {data.columns.length === 0 && <p className="text-xs text-[var(--text-muted)]">Колонок нет</p>}

            {data.columns.map((col, ci) => (
              <div key={ci} className="border border-[var(--border)] rounded-lg p-4 space-y-3 bg-[var(--bg-secondary)]/30">
                
                {/* Строка заголовка и типа */}
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px_auto] gap-2 items-center">
                  <input
                    placeholder="Заголовок колонки"
                    value={col.title}
                    onChange={(e) => { const columns = [...data.columns]; columns[ci] = { ...columns[ci], title: e.target.value }; setData({ ...data, columns }) }}
                    className={inputClass}
                  />
                  <select
                    value={col.type}
                    onChange={(e) => { const columns = [...data.columns]; columns[ci] = { ...columns[ci], type: e.target.value as typeof col.type }; setData({ ...data, columns }) }}
                    className={inputClass}
                  >
                    <option value="links">Ссылки</option>
                    <option value="contacts">Контакты</option>
                    <option value="support">Поддержка</option>
                  </select>
                  <button type="button" onClick={() => setData({ ...data, columns: data.columns.filter((_, i) => i !== ci) })} className="text-red-400 p-2 flex justify-center shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* ССЫЛКИ */}
                {col.type === "links" && (
                  <div className="space-y-2 pt-2">
                    {col.links.map((link, li) => (
                      <div key={li} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
                        <input placeholder="Название" value={link.label} onChange={(e) => {
                          const columns = [...data.columns]; const links = [...columns[ci].links]; links[li] = { ...links[li], label: e.target.value }; columns[ci] = { ...columns[ci], links }; setData({ ...data, columns })
                        }} className={inputClass} />
                        <input placeholder="/ссылка" value={link.href} onChange={(e) => {
                          const columns = [...data.columns]; const links = [...columns[ci].links]; links[li] = { ...links[li], href: e.target.value }; columns[ci] = { ...columns[ci], links }; setData({ ...data, columns })
                        }} className={inputClass} />
                        <button type="button" onClick={() => {
                          const columns = [...data.columns]; columns[ci] = { ...columns[ci], links: columns[ci].links.filter((_, i) => i !== li) }; setData({ ...data, columns })
                        }} className="text-red-400 p-2 flex justify-center shrink-0"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => {
                      const columns = [...data.columns]; columns[ci] = { ...columns[ci], links: [...columns[ci].links, { label: "", href: "", external: false }] }; setData({ ...data, columns })
                    }} className="text-xs text-[var(--accent)] flex items-center gap-1"><Plus className="w-3 h-3" /> Добавить ссылку</button>
                  </div>
                )}

                {/* КОНТАКТЫ */}
                {col.type === "contacts" && (
                  <div className="space-y-2 pt-2">
                    {col.contacts.map((c, ci2) => (
                      <div key={ci2} className="grid grid-cols-1 sm:grid-cols-[130px_1fr_1fr_auto] gap-2">
                        <select value={c.icon} onChange={(e) => {
                          const columns = [...data.columns]; const contacts = [...columns[ci].contacts]; contacts[ci2] = { ...contacts[ci2], icon: e.target.value as typeof c.icon }; columns[ci] = { ...columns[ci], contacts }; setData({ ...data, columns })
                        }} className={inputClass}>
                          {ICONS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                        </select>
                        <input placeholder="Текст" value={c.text} onChange={(e) => {
                          const columns = [...data.columns]; const contacts = [...columns[ci].contacts]; contacts[ci2] = { ...contacts[ci2], text: e.target.value }; columns[ci] = { ...columns[ci], contacts }; setData({ ...data, columns })
                        }} className={inputClass} />
                        <input placeholder="tel: / mailto: / https://" value={c.href} onChange={(e) => {
                          const columns = [...data.columns]; const contacts = [...columns[ci].contacts]; contacts[ci2] = { ...contacts[ci2], href: e.target.value }; columns[ci] = { ...columns[ci], contacts }; setData({ ...data, columns })
                        }} className={inputClass} />
                        <button type="button" onClick={() => {
                          const columns = [...data.columns]; columns[ci] = { ...columns[ci], contacts: columns[ci].contacts.filter((_, i) => i !== ci2) }; setData({ ...data, columns })
                        }} className="text-red-400 p-2 flex justify-center shrink-0"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => {
                      const columns = [...data.columns]; columns[ci] = { ...columns[ci], contacts: [...columns[ci].contacts, { icon: "phone", text: "", href: "" }] }; setData({ ...data, columns })
                    }} className="text-xs text-[var(--accent)] flex items-center gap-1"><Plus className="w-3 h-3" /> Добавить контакт</button>
                  </div>
                )}

                {/* ПОДДЕРЖКА */}
                {col.type === "support" && (
                  <div className="space-y-2 pt-2">
                    <label className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                      <input type="checkbox" checked={col.support?.enabled ?? true} onChange={(e) => {
                        const columns = [...data.columns]; columns[ci] = { ...columns[ci], support: { ...(columns[ci].support ?? { text: "", button_label: "", button_href: "", button_icon: true }), enabled: e.target.checked } }; setData({ ...data, columns })
                      }} />
                      Показывать блок
                    </label>
                    <textarea placeholder="Текст описания" value={col.support?.text ?? ""} onChange={(e) => {
                      const columns = [...data.columns]; columns[ci] = { ...columns[ci], support: { ...(columns[ci].support ?? { enabled: true, button_label: "", button_href: "", button_icon: true }), text: e.target.value } }; setData({ ...data, columns })
                    }} rows={2} className={inputClass} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input placeholder="Текст кнопки" value={col.support?.button_label ?? ""} onChange={(e) => {
                        const columns = [...data.columns]; columns[ci] = { ...columns[ci], support: { ...(columns[ci].support ?? { enabled: true, text: "", button_href: "", button_icon: true }), button_label: e.target.value } }; setData({ ...data, columns })
                      }} className={inputClass} />
                      <input placeholder="/ссылка" value={col.support?.button_href ?? ""} onChange={(e) => {
                        const columns = [...data.columns]; columns[ci] = { ...columns[ci], support: { ...(columns[ci].support ?? { enabled: true, text: "", button_label: "", button_icon: true }), button_href: e.target.value } }; setData({ ...data, columns })
                      }} className={inputClass} />
                    </div>
                    <label className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                      <input type="checkbox" checked={col.support?.button_icon ?? true} onChange={(e) => {
                        const columns = [...data.columns]; columns[ci] = { ...columns[ci], support: { ...(columns[ci].support ?? { enabled: true, text: "", button_label: "", button_href: "" }), button_icon: e.target.checked } }; setData({ ...data, columns })
                      }} />
                      Иконка наушников
                    </label>
                  </div>
                )}

              </div>
            ))}
          </section>

          {/* КОПИРАЙТ */}
          <section className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Копирайт</h2>
            <input value={data.copyright} onChange={(e) => setData({ ...data, copyright: e.target.value })} className={inputClass} />
          </section>
        </div>
      </main>
    </div>
  )
}