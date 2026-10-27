"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";

type FieldType = "text" | "email" | "tel" | "textarea" | "number" | "select";

type Option = { label: string; value: string };

type FormField = {
  id?: number;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string | null;
  options?: Option[] | null;
  sortOrder: number;
  enabled: boolean;
};

type FormValues = { fields: FormField[] };

const NAME_RE = /^[a-z_][a-z0-9_]*$/;

const inputCls =
  "w-full rounded-lg px-3 py-2 text-sm bg-(--bg-primary) text-(--text-primary) border border-(--border) focus:border-(--accent) outline-none";

export default function ContactFieldsEditor() {
  const [status, setStatus] = useState<"idle" | "loading" | "saving" | "error" | "success">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  const { control, register, handleSubmit, reset, watch, formState } = useForm<FormValues>({
    defaultValues: { fields: [] },
  });
  const { fields, append, remove, move } = useFieldArray({ control, name: "fields" });

  // начальная загрузка
  useEffect(() => {
    fetch("/api/admin/contact-fields")
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        if (!Array.isArray(data)) throw new Error("Неверный ответ API");
        reset({
          fields: data.map((f: any, i: number) => ({
            name: f.name ?? "",
            label: f.label ?? "",
            type: (f.type ?? "text") as FieldType,
            required: !!f.required,
            placeholder: f.placeholder ?? "",
            options: Array.isArray(f.options) ? f.options : [],
            sortOrder: i,
            enabled: f.enabled !== false,
          })),
        });
        setStatus("idle");
      })
      .catch((e) => {
        setStatus("error");
        setErrorMsg(e instanceof Error ? e.message : "Ошибка загрузки");
      });
  }, [reset]);

  const onSubmit = async (data: FormValues) => {
    setStatus("saving");
    setErrorMsg("");

    // клиентская валидация имён
    for (const f of data.fields) {
      if (!NAME_RE.test(f.name)) {
        setStatus("error");
        setErrorMsg(`Некорректное имя поля: «${f.name}». Разрешены a-z, 0-9, _ и первый символ — буква или _`);
        return;
      }
    }

    const payload = data.fields.map((f, i) => ({
      name: f.name,
      label: f.label,
      type: f.type,
      required: !!f.required,
      placeholder: f.placeholder || null,
      options: f.type === "select" ? f.options ?? [] : null,
      sortOrder: i,
      enabled: f.enabled !== false,
    }));

    try {
      const res = await fetch("/api/admin/contact-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      setStatus("success");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (e) {
      setStatus("error");
      setErrorMsg(e instanceof Error ? e.message : "Ошибка сохранения");
    }
  };

  const watchedFields = watch("fields");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-(--text-primary)">Поля формы контактов</h1>
        <button
          type="button"
          onClick={() =>
            append({
              name: "",
              label: "",
              type: "text",
              required: false,
              placeholder: "",
              options: [],
              sortOrder: fields.length,
              enabled: true,
            })
          }
          className="text-sm px-3 py-2 rounded-lg bg-(--accent-dim) text-(--accent) hover:opacity-80"
        >
          + Добавить поле
        </button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-(--text-muted)">Полей нет. Добавьте первое.</p>
      )}

      {fields.map((field, i) => {
        const type = watchedFields?.[i]?.type ?? "text";
        return (
          <div key={field.id} className="rounded-xl border border-(--border) p-4 space-y-3 bg-(--bg-card)">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_180px_auto] gap-3">
              <div>
                <label className="block text-xs text-(--text-muted) mb-1">Имя (name)</label>
                <input
                  {...register(`fields.${i}.name` as const)}
                  placeholder="contact_name"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs text-(--text-muted) mb-1">Подпись (label)</label>
                <input
                  {...register(`fields.${i}.label` as const)}
                  placeholder="Имя и фамилия"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs text-(--text-muted) mb-1">Тип</label>
                <select {...register(`fields.${i}.type` as const)} className={inputCls}>
                  <option value="text">text</option>
                  <option value="email">email</option>
                  <option value="tel">tel</option>
                  <option value="textarea">textarea</option>
                  <option value="number">number</option>
                  <option value="select">select</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={() => i > 0 && move(i, i - 1)}
                  disabled={i === 0}
                  className="px-2 py-2 rounded-lg border border-(--border) text-(--text-secondary) disabled:opacity-30"
                  aria-label="Выше"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => i < fields.length - 1 && move(i, i + 1)}
                  disabled={i === fields.length - 1}
                  className="px-2 py-2 rounded-lg border border-(--border) text-(--text-secondary) disabled:opacity-30"
                  aria-label="Ниже"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="px-2 py-2 rounded-lg text-red-400 border border-red-400/30"
                >
                  Удалить
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
              <div>
                <label className="block text-xs text-(--text-muted) mb-1">Placeholder</label>
                <input
                  {...register(`fields.${i}.placeholder` as const)}
                  placeholder="Введите имя..."
                  className={inputCls}
                />
              </div>
              <div className="flex items-end gap-4">
                <label className="flex items-center gap-2 text-sm text-(--text-primary)">
                  <input type="checkbox" {...register(`fields.${i}.required` as const)} />
                  required
                </label>
                <label className="flex items-center gap-2 text-sm text-(--text-primary)">
                  <input type="checkbox" {...register(`fields.${i}.enabled` as const)} />
                  enabled
                </label>
              </div>
            </div>

            {type === "select" && (
              <Controller
                control={control}
                name={`fields.${i}.options` as const}
                render={({ field: optsField }) => {
                  const opts: Option[] = optsField.value ?? [];
                  return (
                    <div className="space-y-2">
                      <label className="block text-xs text-(--text-muted)">Опции (label — value)</label>
                      {opts.map((o, j) => (
                        <div key={j} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                          <input
                            value={o.label}
                            onChange={(e) => {
                              const next = [...opts];
                              next[j] = { ...next[j], label: e.target.value };
                              optsField.onChange(next);
                            }}
                            placeholder="Подпись"
                            className={inputCls}
                          />
                          <input
                            value={o.value}
                            onChange={(e) => {
                              const next = [...opts];
                              next[j] = { ...next[j], value: e.target.value };
                              optsField.onChange(next);
                            }}
                            placeholder="value"
                            className={inputCls}
                          />
                          <button
                            type="button"
                            onClick={() => optsField.onChange(opts.filter((_, k) => k !== j))}
                            className="px-2 py-2 rounded-lg text-red-400 border border-red-400/30"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => optsField.onChange([...opts, { label: "", value: "" }])}
                        className="text-sm text-(--accent)"
                      >
                        + Добавить опцию
                      </button>
                    </div>
                  );
                }}
              />
            )}
          </div>
        );
      })}

      {status === "error" && errorMsg && (
        <div className="rounded-lg p-3 text-sm bg-red-500/10 border border-red-500/30 text-red-400">
          {errorMsg}
        </div>
      )}
      {status === "success" && (
        <div className="rounded-lg p-3 text-sm bg-green-500/10 border border-green-500/30 text-green-400">
          Сохранено
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={status === "saving" || status === "loading"}
          className="px-4 py-2 rounded-lg bg-(--accent) text-white font-medium disabled:opacity-50"
        >
          {status === "saving" ? "Сохранение..." : "Сохранить"}
        </button>
        <button
          type="button"
          onClick={() => reset({ fields: [] })}
          className="px-4 py-2 rounded-lg border border-(--border) text-(--text-secondary)"
        >
          Очистить
        </button>
      </div>
    </form>
  );
}