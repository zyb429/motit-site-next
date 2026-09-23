// src/components/helpdesk/NewTicketForm.tsx
"use client";

import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Upload, X } from "lucide-react";

const PRIORITIES = [
  { code: "LOW",    label: "Низкий" },
  { code: "NORMAL", label: "Обычный" },
  { code: "HIGH",   label: "Высокий" },
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
  const [contactName, setContactName] = useState(defaultFullName);
  const [contactEmail, setContactEmail] = useState(defaultEmail);
  const [contactPhone, setContactPhone] = useState(defaultPhone);
  const [organizationUuid, setOrganizationUuid] = useState<string | null>(
    organizations.find((o) => o.isPrimary)?.uuid ?? organizations[0]?.uuid ?? null,
  );
  const [priorityCode, setPriorityCode] = useState("NORMAL");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // В админском режиме: при выборе клиента — автозаполняем контакты
  useEffect(() => {
    if (!isAdmin || !selectedClientUuid) return;
    const client = clients.find((c) => c.uuid === selectedClientUuid);
    if (!client) return;

    setContactName(client.name ?? "");
    setContactEmail(client.email ?? "");
    if (client.phone) setContactPhone(client.phone);
  }, [isAdmin, selectedClientUuid, clients]);

  // В клиентском режиме: если организации подгрузились позже — выбрать основную
  useEffect(() => {
    if (isAdmin) return;
    if (organizationUuid) return;
    const primary = organizations.find((o) => o.isPrimary) ?? organizations[0];
    if (primary) setOrganizationUuid(primary.uuid);
  }, [isAdmin, organizations, organizationUuid]);

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    setFiles([...files, ...picked].slice(0, 5));
    e.target.value = "";
  }

  function removeFile(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
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
          organizationUuid: isAdmin
            ? (clients.find((c) => c.uuid === selectedClientUuid)?.organizationUuid ?? null)
            : organizationUuid,
          categoryUuid: selectedCategoryUuid,
          attachmentFileIds,
          ...(isAdmin && selectedClientUuid
            ? { clientUuid: selectedClientUuid }
            : {}),
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(
          typeof d.error === "string" ? d.error : "Не удалось создать заявку",
        );
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

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      {isAdmin && (
        <>
          <Field label="Клиент *">
            <select
              value={selectedClientUuid ?? ""}
              onChange={(e) => setSelectedClientUuid(e.target.value || null)}
              className="w-full px-3 py-2 rounded-lg bg-(--bg-primary) border border-(--border) text-(--text-primary) focus:border-(--accent) outline-none"
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
                className="w-full px-3 py-2 rounded-lg bg-(--bg-primary) border border-(--border) text-(--text-primary) focus:border-(--accent) outline-none"
              >
                {categories.map((c) => (
                  <option key={c.uuid} value={c.uuid}>
                    {c.icon ? `${c.icon} ` : ""}{c.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
        </>
      )}

      <Field label="Фамилия, Имя, Отчество">
        <input
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-(--bg-primary) border border-(--border) text-(--text-primary) focus:border-(--accent) outline-none"
        />
      </Field>

      <Field label="E-mail">
        <input
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-(--bg-primary) border border-(--border) text-(--text-primary) focus:border-(--accent) outline-none"
        />
      </Field>

      <Field label="Телефон">
        <input
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-(--bg-primary) border border-(--border) text-(--text-primary) focus:border-(--accent) outline-none"
        />
      </Field>

      {!isAdmin && organizations.length > 0 && (
        <Field label="Предприятие">
          {organizations.length === 1 ? (
            <input
              value={
                organizations[0].inn
                  ? `${organizations[0].name} (ИНН ${organizations[0].inn})`
                  : organizations[0].name
              }
              disabled
              className="w-full px-3 py-2 rounded-lg bg-(--bg-primary) border border-(--border) text-(--text-muted)"
            />
          ) : (
            <select
              value={organizationUuid ?? ""}
              onChange={(e) => setOrganizationUuid(e.target.value || null)}
              className="w-full px-3 py-2 rounded-lg bg-(--bg-primary) border border-(--border) text-(--text-primary) focus:border-(--accent) outline-none"
            >
              {organizations.map((o) => (
                <option key={o.uuid} value={o.uuid}>
                  {o.inn ? `${o.name} (ИНН ${o.inn})` : o.name}
                  {o.isPrimary ? " — основное" : ""}
                </option>
              ))}
            </select>
          )}
        </Field>
      )}

      <Field label="Приоритет">
        <select
          value={priorityCode}
          onChange={(e) => setPriorityCode(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-(--bg-primary) border border-(--border) text-(--text-primary) focus:border-(--accent) outline-none"
        >
          {PRIORITIES.map((p) => (
            <option key={p.code} value={p.code}>
              {p.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Тема">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={255}
          className="w-full px-3 py-2 rounded-lg bg-(--bg-primary) border border-(--border) text-(--text-primary) focus:border-(--accent) outline-none"
        />
      </Field>

      <Field label="Сообщение">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={8}
          maxLength={10_000}
          className="w-full px-3 py-2 rounded-lg bg-(--bg-primary) border border-(--border) text-(--text-primary) focus:border-(--accent) outline-none resize-y"
        />
      </Field>

      <Field label="Вложения">
        <div className="border border-dashed border-(--border) rounded-lg p-4">
          {files.length === 0 ? (
            <p className="text-sm text-(--text-muted) text-center">
              Перетащите файлы или нажмите «Добавить файл». До 5 файлов, до 10 МБ.
            </p>
          ) : (
            <ul className="space-y-2">
              {files.map((f, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="truncate text-(--text-primary)">{f.name}</span>
                  <span className="text-(--text-muted) text-xs">
                    {(f.size / 1024 / 1024).toFixed(2)} МБ
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <label className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-(--border) text-(--accent) text-sm cursor-pointer hover:bg-(--accent-dim)">
            <Upload size={14} />
            Добавить файл
            <input
              type="file"
              multiple
              accept={ACCEPT}
              onChange={handleFileSelect}
              className="hidden"
              disabled={files.length >= 5}
            />
          </label>
        </div>
      </Field>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={saving || uploading}
        className="px-5 py-2 rounded-lg bg-(--accent) text-(--bg-card) text-sm font-medium hover:opacity-90 disabled:opacity-50"
      >
        {uploading ? "Загрузка файлов…" : saving ? "Отправка…" : "Создать обращение"}
      </button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs text-(--text-muted) mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
