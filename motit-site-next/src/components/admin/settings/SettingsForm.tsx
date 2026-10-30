"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ColorPicker } from "./ColorPicker";
import { ImageField } from "./ImageField";

type Field =
  | {
      kind?: "text";
      name: string;
      label: string;
      textarea?: boolean;
      type?: string;
    }
  | { kind: "json"; name: string; label: string }
  | { kind: "color"; name: string; label: string }
  | { kind: "checkbox"; name: string; label: string }
  | { kind: "schedule"; name: string; label: string }
  | { kind: "social"; name: string; label: string }
  | {
      kind: "image";
      name: string;
      label: string;
      accept?: string;
      uploadEndpoint?: string;
    };

type ActionState = { ok?: boolean; error?: string } | null;

// ============================================
// График работы: типы и утилиты
// ============================================
type DayConfig = {
  day: string;
  isWorking: boolean;
  start: string;
  end: string;
  hasLunch: boolean;
  lunchStart: string;
  lunchEnd: string;
};

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const DEFAULT_DAY = (day: string): DayConfig => ({
  day,
  isWorking: false,
  start: "09:00",
  end: "18:00",
  hasLunch: false,
  lunchStart: "13:00",
  lunchEnd: "14:00",
});

function parseSchedule(str: string): DayConfig[] {
  const map = new Map<string, DayConfig>();
  DAYS.forEach((d) => map.set(d, DEFAULT_DAY(d)));

  if (!str || typeof str !== "string") return Array.from(map.values());

  str.split(";").forEach((part) => {
    const trimmed = part.trim();
    if (!trimmed) return;

    const colonIdx = trimmed.indexOf(":");
    if (colonIdx === -1) return;

    const dayPart = trimmed.slice(0, colonIdx).trim();
    const timePartRaw = trimmed.slice(colonIdx + 1).trim();

    let hasLunch = false;
    let lunchStart = "13:00";
    let lunchEnd = "14:00";
    let timePart = timePartRaw;

    const lunchMatch = timePartRaw.match(
      /\(?\s*обед\s*(\d{2}:\d{2})-(\d{2}:\d{2})\s*\)?/i,
    );
    if (lunchMatch) {
      hasLunch = true;
      lunchStart = lunchMatch[1] || "13:00";
      lunchEnd = lunchMatch[2] || "14:00";
      timePart = timePartRaw.replace(lunchMatch[0], "").trim();
    }

    const dayMatch = dayPart.match(/^([А-Яа-яЁё]{2})(?:-([А-Яа-яЁё]{2}))?$/);
    if (!dayMatch) return;
    const startDay = dayMatch[1];
    const endDay = dayMatch[2];

    const startIdx = DAYS.indexOf(startDay);
    const endIdx = endDay ? DAYS.indexOf(endDay) : startIdx;
    if (startIdx === -1 || endIdx === -1) return;

    const isWorking = timePart !== "выходной";
    let start = "09:00";
    let end = "18:00";
    if (isWorking) {
      const timeMatch = timePart.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);
      if (timeMatch) {
        start = timeMatch[1] || "09:00";
        end = timeMatch[2] || "18:00";
      }
    }

    for (let i = startIdx; i <= endIdx; i++) {
      const day = DAYS[i];
      map.set(day, {
        day,
        isWorking,
        start,
        end,
        hasLunch: isWorking ? hasLunch : false,
        lunchStart,
        lunchEnd,
      });
    }
  });

  return Array.from(map.values());
}

function serializeSchedule(days: DayConfig[]): string {
  type Group = {
    start: string;
    end: string;
    isWorking: boolean;
    startTime: string;
    endTime: string;
    hasLunch: boolean;
    lunchStart: string;
    lunchEnd: string;
  };

  const groups: Group[] = [];
  let current: Group | null = null;

  days.forEach((d) => {
    const isSame =
      current &&
      current.isWorking === d.isWorking &&
      current.startTime === d.start &&
      current.endTime === d.end &&
      current.hasLunch === d.hasLunch &&
      (!d.hasLunch ||
        (current.lunchStart === d.lunchStart &&
          current.lunchEnd === d.lunchEnd));

    if (!current) {
      current = {
        start: d.day,
        end: d.day,
        isWorking: d.isWorking,
        startTime: d.start,
        endTime: d.end,
        hasLunch: d.hasLunch,
        lunchStart: d.lunchStart,
        lunchEnd: d.lunchEnd,
      };
    } else if (isSame) {
      current.end = d.day;
    } else {
      groups.push(current);
      current = {
        start: d.day,
        end: d.day,
        isWorking: d.isWorking,
        startTime: d.start,
        endTime: d.end,
        hasLunch: d.hasLunch,
        lunchStart: d.lunchStart,
        lunchEnd: d.lunchEnd,
      };
    }
  });
  if (current) groups.push(current);

  return groups.map(formatGroup).join("; ");
}

function formatGroup(g: {
  start: string;
  end: string;
  isWorking: boolean;
  startTime: string;
  endTime: string;
  hasLunch: boolean;
  lunchStart: string;
  lunchEnd: string;
}): string {
  const range = g.start === g.end ? g.start : `${g.start}-${g.end}`;
  if (!g.isWorking) return `${range}: выходной`;
  const lunch = g.hasLunch ? ` (обед ${g.lunchStart}-${g.lunchEnd})` : "";
  return `${range}: ${g.startTime}-${g.endTime}${lunch}`;
}

// ============================================
// Виджет графика работы
// ============================================
function ScheduleWidget({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: string;
}) {
  const [days, setDays] = useState<DayConfig[]>(() =>
    parseSchedule(defaultValue || ""),
  );

  useEffect(() => {
    setDays(parseSchedule(defaultValue || ""));
  }, [defaultValue]);

  const toggleDay = (day: string, checked: boolean) => {
    setDays((prev) =>
      prev.map((d) => (d.day === day ? { ...d, isWorking: checked } : d)),
    );
  };

  const toggleLunch = (day: string, checked: boolean) => {
    setDays((prev) =>
      prev.map((d) => (d.day === day ? { ...d, hasLunch: checked } : d)),
    );
  };

  const setTime = (
    day: string,
    field: "start" | "end" | "lunchStart" | "lunchEnd",
    value: string,
  ) => {
    setDays((prev) =>
      prev.map((d) => (d.day === day ? { ...d, [field]: value } : d)),
    );
  };

  const displayValue = serializeSchedule(days);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {days.map((d) => (
          <div
            key={d.day}
            className="rounded-lg border border-(--border) p-3 space-y-2"
          >
            <div className="flex items-center gap-3 flex-wrap">
              <label className="flex items-center gap-2 w-16 text-sm text-(--text-primary) cursor-pointer select-none font-medium">
                <input
                  type="checkbox"
                  checked={!!d.isWorking}
                  onChange={(e) => toggleDay(d.day, e.target.checked)}
                  className="h-4 w-4 rounded border-(--border) text-(--accent) cursor-pointer"
                />
                {d.day}
              </label>

              {d.isWorking ? (
                <div className="flex items-center gap-1">
                  <input
                    type="time"
                    value={d.start ?? "09:00"}
                    onChange={(e) => setTime(d.day, "start", e.target.value)}
                    className="px-2 py-1 rounded border border-(--border) bg-(--bg-primary) text-(--text-primary) text-sm"
                  />
                  <span className="text-(--text-muted)">—</span>
                  <input
                    type="time"
                    value={d.end ?? "18:00"}
                    onChange={(e) => setTime(d.day, "end", e.target.value)}
                    className="px-2 py-1 rounded border border-(--border) bg-(--bg-primary) text-(--text-primary) text-sm"
                  />
                </div>
              ) : (
                <span className="text-sm text-(--text-muted)">выходной</span>
              )}
            </div>

            {d.isWorking && (
              <div className="flex items-center gap-3 flex-wrap pl-6">
                <label className="flex items-center gap-2 text-sm text-(--text-primary) cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!d.hasLunch}
                    onChange={(e) => toggleLunch(d.day, e.target.checked)}
                    className="h-4 w-4 rounded border-(--border) text-(--accent) cursor-pointer"
                  />
                  Обед
                </label>

                {d.hasLunch && (
                  <div className="flex items-center gap-1">
                    <input
                      type="time"
                      value={d.lunchStart ?? "13:00"}
                      onChange={(e) =>
                        setTime(d.day, "lunchStart", e.target.value)
                      }
                      className="px-2 py-1 rounded border border-(--border) bg-(--bg-primary) text-(--text-primary) text-sm"
                    />
                    <span className="text-(--text-muted)">—</span>
                    <input
                      type="time"
                      value={d.lunchEnd ?? "14:00"}
                      onChange={(e) =>
                        setTime(d.day, "lunchEnd", e.target.value)
                      }
                      className="px-2 py-1 rounded border border-(--border) bg-(--bg-primary) text-(--text-primary) text-sm"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="text-xs text-(--text-muted)">
        Итоговое значение: <code className="break-all">{displayValue}</code>
      </div>

      <input type="hidden" name={name} value={displayValue} />
    </div>
  );
}

// ============================================
// Соцсети: парсинг, сериализация, виджет
// ============================================
type SocialItem = { name: string; href: string };

const SOCIAL_OPTIONS = [
  { label: "Telegram", value: "telegram" },
  { label: "VK", value: "vk" },
  { label: "YouTube", value: "youtube" },
  { label: "GitHub", value: "github" },
  { label: "LinkedIn", value: "linkedin" },
  { label: "Поддержка", value: "support" },
] as const;

function parseSocial(raw: unknown): SocialItem[] {
  if (!raw) return [];

  if (typeof raw === "object" && !Array.isArray(raw)) {
    return Object.entries(raw as Record<string, unknown>)
      .filter(([, href]) => typeof href === "string" && href.trim())
      .map(([name, href]) => ({ name, href: (href as string).trim() }));
  }

  if (Array.isArray(raw)) {
    return raw
      .filter(
        (o) =>
          o &&
          typeof o === "object" &&
          typeof (o as any).name === "string" &&
          typeof (o as any).href === "string",
      )
      .map((o) => ({
        name: (o as any).name as string,
        href: (o as any).href as string,
      }));
  }

  return [];
}

function serializeSocial(items: SocialItem[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const item of items) {
    if (!item.name.trim() || !item.href.trim()) continue;
    out[item.name.trim()] = item.href.trim();
  }
  return out;
}

function SocialWidget({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: unknown;
}) {
  const [items, setItems] = useState<SocialItem[]>(() =>
    parseSocial(defaultValue),
  );

  useEffect(() => {
    setItems(parseSocial(defaultValue));
  }, [defaultValue]);

  const datalistId = `social-options-${name}`;

  const addItem = () => {
    setItems((prev) => [...prev, { name: "", href: "" }]);
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: "name" | "href", value: string) => {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)),
    );
  };

  const serialized = JSON.stringify(serializeSocial(items));

  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <p className="text-sm text-(--text-muted)">
          Соцсети не добавлены. Нажмите «Добавить соцсеть», чтобы создать
          первую.
        </p>
      )}

      {items.map((item, idx) => (
        <div
          key={idx}
          className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center rounded-lg border border-(--border) p-2"
        >
          <input
            type="text"
            list={datalistId}
            value={item.name}
            onChange={(e) => updateItem(idx, "name", e.target.value)}
            placeholder="telegram, vk, twitter…"
            className="px-3 py-2 rounded border border-(--border) bg-(--bg-primary) text-(--text-primary) text-sm sm:w-44"
          />

          <input
            type="url"
            value={item.href}
            onChange={(e) => updateItem(idx, "href", e.target.value)}
            placeholder="https://..."
            className="flex-1 px-3 py-2 rounded border border-(--border) bg-(--bg-primary) text-(--text-primary) text-sm"
          />

          <button
            type="button"
            onClick={() => removeItem(idx)}
            className="px-3 py-2 rounded border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-colors"
          >
            Удалить
          </button>
        </div>
      ))}

      <datalist id={datalistId}>
        {SOCIAL_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </datalist>

      <button
        type="button"
        onClick={addItem}
        className="px-3 py-2 rounded-lg border border-(--border) text-sm text-(--text-primary) hover:border-(--accent) transition-colors"
      >
        + Добавить соцсеть
      </button>

      <input type="hidden" name={name} value={serialized} />
    </div>
  );
}

// ============================================
// Универсальная форма настроек
// ============================================
export function SettingsForm({
  settings,
  fields,
  action,
}: {
  settings: any;
  fields: Field[];
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const router = useRouter();

  // После успешного сохранения обновляем данные страницы (server component).
  useEffect(() => {
    if (state?.ok) {
      router.refresh();
    }
  }, [state, router]);

  const inputCls =
    "w-full rounded-lg px-3 py-2 text-sm bg-(--bg-primary) text-(--text-primary) border border-(--border) focus:border-(--accent) outline-none transition-colors";

  const renderField = (f: Field) => {
    const val = settings?.[f.name];

    if (f.kind === "json") {
      return (
        <textarea
          name={f.name}
          rows={6}
          defaultValue={val ? JSON.stringify(val, null, 2) : "{}"}
          className={`${inputCls} font-mono`}
        />
      );
    }

    if (f.kind === "color") {
      return (
        <ColorPicker
          key={`color-${val ?? ""}`}
          name={f.name}
          defaultValue={val ?? "#6366f1"}
        />
      );
    }

    if (f.kind === "image") {
      return (
        <ImageField
          key={`image-${val ?? ""}`}
          name={f.name}
          label={f.label}
          defaultValue={val ?? ""}
          accept={f.accept}
          uploadEndpoint={f.uploadEndpoint}
        />
      );
    }

    if (f.kind === "checkbox") {
      return (
        <label className="flex items-center gap-2 text-sm text-(--text-primary) cursor-pointer">
          <input
            type="checkbox"
            name={f.name}
            defaultChecked={!!val}
            className="h-4 w-4 rounded border-(--border) text-(--accent)"
          />
          {f.label}
        </label>
      );
    }

    if (f.kind === "schedule") {
      return (
        <ScheduleWidget
          key={`schedule-${val ?? ""}`}
          name={f.name}
          defaultValue={val ?? ""}
        />
      );
    }

    if (f.kind === "social") {
      return (
        <SocialWidget
          key={`social-${JSON.stringify(val ?? "")}`}
          name={f.name}
          defaultValue={val}
        />
      );
    }

    if (f.textarea) {
      return (
        <textarea
          name={f.name}
          defaultValue={val ?? ""}
          rows={4}
          className={inputCls}
        />
      );
    }

    return (
      <input
        name={f.name}
        type={f.type ?? "text"}
        defaultValue={val ?? ""}
        className={inputCls}
      />
    );
  };

  return (
    <form action={formAction} className="space-y-4 max-w-2xl">
      <input type="hidden" name="id" value={settings?.id ?? 1} />

      {fields.map((f) => (
        <div key={f.name}>
          {f.kind !== "checkbox" && f.kind !== "image" && (
            <label className="block text-sm font-medium text-(--text-primary) mb-1">
              {f.label}
            </label>
          )}
          {renderField(f)}
        </div>
      ))}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="px-4 py-2 rounded-lg bg-(--accent) text-white font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {pending ? "Сохранение..." : "Сохранить"}
        </button>
        {state?.ok && <span className="text-green-500 text-sm">Сохранено</span>}
        {state?.error && (
          <span className="text-red-500 text-sm">{state.error}</span>
        )}
      </div>
    </form>
  );
}