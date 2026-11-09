// src/components/helpdesk/NewTicketForm.tsx
"use client";

import { useState, type ChangeEvent, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Loader2 } from "lucide-react";

const PRIORITIES = [
  { code: "LOW", label: "Низкий" },
  { code: "NORMAL", label: "Обычный" },
  { code: "HIGH", label: "Высокий" },
  { code: "URGENT", label: "Срочный" },
];

const ACCEPT = [
  "image/*",
  "text/*",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "application/json",
  "application/xml",
].join(",");

interface OrganizationOption {
  uuid: string;
  name: string;
  inn: string | null;
  isPrimary: boolean;
}

interface CategoryOption {
  uuid: string;
  name: string;
  icon?: string | null;
}

interface ClientOption {
  uuid: string;
  name: string;
  email: string;
  phone?: string | null;
  organizationUuid?: string | null;
}

interface UploadedFile {
  id: number;
  uuid: string;
  name: string;
  url: string;
  mime: string | null;
  size: number | null;
}

interface Props {
  mode?: "client" | "admin";
  defaultFullName?: string;
  defaultEmail?: string;
  defaultPhone?: string;
  organizations?: OrganizationOption[];
  categories?: CategoryOption[];
  clients?: ClientOption[];
  categoryUuid?: string;
  clientUuid?: string;
}

export function NewTicketForm({
  mode = "client",
  defaultFullName = "",
  defaultEmail = "",
  defaultPhone = "",
  organizations = [],
  categories = [],
  clients = [],
  categoryUuid,
  clientUuid,
}: Props) {
  const router = useRouter();
  const isAdmin = mode === "admin";

  const [selectedClientUuid, setSelectedClientUuid] = useState<string | null>(
    isAdmin ? (clientUuid ?? clients[0]?.uuid ?? null) : null,
  );
  const [selectedCategoryUuid, setSelectedCategoryUuid] = useState<string | null>(
    categoryUuid ?? categories[0]?.uuid ?? null,
  );

  const [customContactName, setCustomContactName] = useState<string | null>(null);
  const [customContactEmail, setCustomContactEmail] = useState<string | null>(null);
  const [customContactPhone, setCustomContactPhone] = useState<string | null>(null);
  const [customOrganizationUuid, setCustomOrganizationUuid] = useState<string | null>(null);

  const [priorityCode, setPriorityCode] = useState("NORMAL");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedClient = isAdmin
    ? clients.find((c) => c.uuid === selectedClientUuid) ?? null
    : null;

  const contactName =
    customContactName ??
    (isAdmin && selectedClient ? selectedClient.name : null) ??
    defaultFullName;

  const contactEmail =
    customContactEmail ??
    (isAdmin && selectedClient ? selectedClient.email : null) ??
    defaultEmail;

  const contactPhone =
    customContactPhone ??
    (isAdmin && selectedClient ? selectedClient.phone ?? "" : null) ??
    defaultPhone;

  const organizationUuid =
    customOrganizationUuid ??
    (isAdmin && selectedClient
      ? selectedClient.organizationUuid ?? null
      : null) ??
    organizations.find((o) => o.isPrimary)?.uuid ??
    organizations[0]?.uuid ??
    null;

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    setFiles([...files, ...picked].slice(0, 5));
    e.target.value = "";
  }

  function removeFile(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (isAdmin && !selectedClientUuid) return setError("Выберите клиента");
    if (contactName.trim().length < 1) return setError("Укажите ФИО");
    if (!contactEmail.includes("@")) return setError("Некорректный email");
    if (title.trim().length < 3) return setError("Тема — минимум 3 символа");
    if (description.trim().length < 10) return setError("Сообщение — минимум 10 символов");

    setSaving(true);
    try {
      let attachmentFileIds: number[] = [];
      if (files.length > 0) {
        setUploading(true);
        const fd = new FormData();
        files.forEach((f) => fd.append("files", f));
        const upRes = await fetch("/api/upload", { method: "POST", body: fd });
        setUploading(false);
        if (!upRes.ok) {
          const d = await upRes.json().catch(() => ({}));
          throw new Error(d.error ?? "Не удалось загрузить файлы");
        }
        const uploaded: UploadedFile[] = await upRes.json();
        attachmentFileIds = uploaded.map((f) => f.id);
      }

      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          priorityCode,
          contactName,
          contactEmail,
          contactPhone,
          organizationUuid,
          categoryUuid: selectedCategoryUuid,
          attachmentFileIds,
          ...(isAdmin && selectedClientUuid ? { clientUuid: selectedClientUuid } : {}),
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(typeof d.error === "string" ? d.error : "Не удалось создать заявку");
      }

      const data = await res.json();
      const base = isAdmin ? "/admin/tickets" : "/cabinet/tickets";
      router.push(`${base}/${data.data.uuid}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  }

  const inputClass =
    "w-full px-3.5 py-2.5 bg-(--bg-secondary) border border-(--border) rounded-xl text-(--text-primary) placeholder:text-(--text-muted) focus:border-(--accent) focus:ring-2 focus:ring-(--accent-dim) outline-none transition-all text-sm";

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      {isAdmin && (
        <div className="space-y-4 p-4 rounded-xl border border-(--border) bg-(--bg-card)">
          <Field label="Клиент *">
            <select
              value={selectedClientUuid ?? ""}
              onChange={(e) => setSelectedClientUuid(e.target.value || null)}
              className={inputClass}
            >
              {clients.map((c) => (
                <option key={c.uuid} value={c.uuid}>
                  {c.name} {c.email ? `(${c.email})` : ""}
                </option>
              ))}
            </select>
          </Field>

          {categories.length > 0 && (
            <Field label="Категория">
              <select
                value={selectedCategoryUuid ?? ""}
                onChange={(e) => setSelectedCategoryUuid(e.target.value || null)}
                className={inputClass}
              >
                {categories.map((c) => (
                  <option key={c.uuid} value={c.uuid}>
                    {c.icon ? `${c.icon} ` : ""}{c.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="ФИО">
          <input value={contactName} onChange={(e) => setCustomContactName(e.target.value)} className={inputClass} />
        </Field>
        <Field label="E-mail">
          <input type="email" value={contactEmail} onChange={(e) => setCustomContactEmail(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Телефон">
          <input value={contactPhone} onChange={(e) => setCustomContactPhone(e.target.value)} className={inputClass} />
        </Field>
        {!isAdmin && organizations.length > 0 && (
          <Field label="Предприятие">
            <select
              value={organizationUuid ?? ""}
              onChange={(e) => setCustomOrganizationUuid(e.target.value || null)}
              className={inputClass}
            >
              {organizations.map((o) => (
                <option key={o.uuid} value={o.uuid}>
                  {o.inn ? `${o.name} (ИНН ${o.inn})` : o.name}
                </option>
              ))}
            </select>
          </Field>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Приоритет">
          <select value={priorityCode} onChange={(e) => setPriorityCode(e.target.value)} className={inputClass}>
            {PRIORITIES.map((p) => (
              <option key={p.code} value={p.code}>{p.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Тема">
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={255} className={inputClass} />
        </Field>
      </div>

      <Field label="Сообщение">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          maxLength={10_000}
          className={`${inputClass} resize-y`}
        />
      </Field>

      <Field label="Вложения">
        <div className="border-2 border-dashed border-(--border) rounded-xl p-4 hover:border-(--accent)/50 transition-colors">
          {files.length === 0 ? (
            <p className="text-sm text-(--text-muted) text-center">Перетащите файлы или нажмите «Добавить»</p>
          ) : (
            <ul className="space-y-2 mb-3">
              {files.map((f, i) => (
                <li key={i} className="flex items-center justify-between gap-3 text-sm bg-(--bg-secondary) p-2 rounded-lg">
                  <span className="truncate text-(--text-primary)">{f.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-(--text-muted) text-xs">{(f.size / 1024 / 1024).toFixed(2)} МБ</span>
                    <button type="button" onClick={() => removeFile(i)} className="text-red-400 hover:text-red-300 p-1">
                      <X size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <label className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-(--border) text-(--accent) text-sm cursor-pointer hover:bg-(--accent-dim) transition-colors">
            <Upload size={14} />
            Добавить файл
            <input type="file" multiple accept={ACCEPT} onChange={handleFileSelect} className="hidden" disabled={files.length >= 5} />
          </label>
        </div>
      </Field>

      {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

      <button
        type="submit"
        disabled={saving || uploading}
        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-(--accent) text-(--bg-primary) text-sm font-semibold hover:bg-(--accent-hover) disabled:opacity-50 transition-all shadow-sm flex items-center justify-center gap-2"
      >
        {uploading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Загрузка файлов…
          </>
        ) : saving ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Отправка…
          </>
        ) : (
          "Создать обращение"
        )}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-(--text-secondary) mb-1.5">{label}</label>
      {children}
    </div>
  );
}