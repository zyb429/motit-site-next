import { Phone, Mail, MapPin, Clock } from "lucide-react";
import ContactClient from "./ContactClient";

export type ContactItem = {
  icon: "phone" | "mail" | "map-pin" | "clock";
  label: string;
  value: string;
  href?: string;
  values?: { value: string; comment?: string }[];
};

export type ContactViewProps = {
  label: string;
  title: string;
  subtitle: string;
  contacts: ContactItem[];
  privacyLabel: string;
  privacyHref: string;
  fields: Array<{
    name: string;
    label: string;
    type: string;
    required: boolean;
    placeholder?: string | null;
    options?: { label: string; value: string }[] | null;
  }>;
  workHours?: string | null;
};

const ICONS = {
  phone: Phone,
  mail: Mail,
  "map-pin": MapPin,
  clock: Clock,
} as const;

// ============================================
// Парсинг графика работы
// ============================================
type ScheduleLine = {
  days: string;
  isWorking: boolean;
  time: string;
};

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

type DayInfo = {
  day: string;
  isWorking: boolean;
  start: string;
  end: string;
  hasLunch: boolean;
  lunchStart: string;
  lunchEnd: string;
};

function parseToDays(str: string): DayInfo[] {
  const map = new Map<string, DayInfo>();
  DAYS.forEach((d) =>
    map.set(d, {
      day: d,
      isWorking: false,
      start: "09:00",
      end: "18:00",
      hasLunch: false,
      lunchStart: "13:00",
      lunchEnd: "14:00",
    }),
  );

  if (!str) return Array.from(map.values());

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

function groupToLines(days: DayInfo[]): ScheduleLine[] {
  const working = days.filter((d) => d.isWorking);
  const weekends = days.filter((d) => !d.isWorking);

  const lines: ScheduleLine[] = [];

  const groups = new Map<string, DayInfo[]>();
  for (const d of working) {
    const key = `${d.start}|${d.end}|${d.hasLunch ? `${d.lunchStart}|${d.lunchEnd}` : ""}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(d);
  }

  const sortedGroups = Array.from(groups.values()).sort(
    (a, b) => DAYS.indexOf(a[0].day) - DAYS.indexOf(b[0].day),
  );

  const splitRanges = (arr: DayInfo[]): DayInfo[][] => {
    const ranges: DayInfo[][] = [];
    let current: DayInfo[] = [];
    let prevIdx = -2;
    for (const d of arr) {
      const idx = DAYS.indexOf(d.day);
      if (idx === prevIdx + 1) {
        current.push(d);
      } else {
        if (current.length) ranges.push(current);
        current = [d];
      }
      prevIdx = idx;
    }
    if (current.length) ranges.push(current);
    return ranges;
  };

  for (const group of sortedGroups) {
    for (const range of splitRanges(group)) {
      const first = range[0];
      const last = range[range.length - 1];
      const daysLabel =
        range.length === 1 ? first.day : `${first.day}–${last.day}`;
      const lunch = first.hasLunch
        ? ` (обед ${first.lunchStart}–${first.lunchEnd})`
        : "";
      lines.push({
        days: daysLabel,
        isWorking: true,
        time: `${first.start}–${first.end}${lunch}`,
      });
    }
  }

  for (const range of splitRanges(weekends)) {
    const first = range[0];
    const last = range[range.length - 1];
    const daysLabel =
      range.length === 1 ? first.day : `${first.day}–${last.day}`;
    lines.push({ days: daysLabel, isWorking: false, time: "выходной" });
  }

  return lines;
}

// ============================================
// Рендер значений контакта
// ============================================
function ContactValue({ item }: { item: ContactItem }) {
  if (item.values && item.values.length > 0) {
    const isTel = item.icon === "phone";
    const isMail = item.icon === "mail";

    return (
      <div className="flex flex-col gap-1 text-base text-(--text-secondary)">
        {item.values.map((v, idx) => {
          const href = isTel
            ? `tel:${v.value.replace(/[^\d+]/g, "")}`
            : isMail
              ? `mailto:${v.value}`
              : undefined;

          const line = href ? (
            <a href={href} className="hover:underline break-words">
              {v.value}
            </a>
          ) : (
            <span className="break-words">{v.value}</span>
          );

          return (
            <div key={idx} className="leading-snug">
              {line}
              {v.comment && (
                <span className="block text-xs text-(--text-muted)">
                  {v.comment}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return <span className="text-base text-(--text-secondary)">{item.value}</span>;
}

// ============================================
// Компонент
// ============================================
export default function ContactView({
  label,
  title,
  subtitle,
  contacts,
  privacyLabel,
  privacyHref,
  fields,
  workHours,
}: ContactViewProps) {
  const scheduleLines = workHours ? groupToLines(parseToDays(workHours)) : [];

  return (
    <section id="contact" className="section-padding bg-(--bg-primary) transition-colors duration-300">
      <div className="content-container">
        <div className="mb-12 md:mb-16">
          <span className="section-label block mb-3">{label}</span>
          <h2 className="section-title mb-4 text-(--text-primary)">{title}</h2>
          <p className="section-subtitle max-w-150 text-(--text-secondary)">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 lg:gap-16">
          <ContactClient
            privacyLabel={privacyLabel}
            privacyHref={privacyHref}
            fields={fields}
          />

          <div className="flex flex-col gap-4">
            {(contacts ?? []).map((item, i) => {
              const Icon = ICONS[item.icon] ?? Phone;

              // Режим работы — построчно
              if (item.icon === "clock" && scheduleLines.length > 0) {
                return (
                  <div
                    key={i}
                    className="flex items-start gap-4 rounded-xl p-5 transition-all duration-150 bg-(--bg-card) border border-(--border)"
                  >
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-(--accent-dim)">
                      <Icon size={20} className="text-(--accent)" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-base mb-1 text-(--text-primary)">
                        {item.label}
                      </h4>
                      <div className="flex flex-col gap-0.5 text-base text-(--text-secondary)">
                        {scheduleLines.map((line, idx) => (
                          <div key={idx} className="break-words">
                            <span className="text-(--text-muted)">
                              {line.days}:
                            </span>{" "}
                            <span
                              className={
                                line.isWorking
                                  ? "text-(--text-secondary)"
                                  : "text-red-400"
                              }
                            >
                              {line.time}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              // Обычный контакт
              const content = (
                <div className="flex items-start gap-4 rounded-xl p-5 transition-all duration-150 bg-(--bg-card) border border-(--border)">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-(--accent-dim)">
                    <Icon size={20} className="text-(--accent)" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-base mb-1 text-(--text-primary)">
                      {item.label}
                    </h4>
                    <ContactValue item={item} />
                  </div>
                </div>
              );

              const wrapInLink =
                !item.values || item.values.length === 0
                  ? item.href
                  : undefined;

              return wrapInLink ? (
                <a
                  key={i}
                  href={wrapInLink}
                  className="block transition-all duration-150 hover:-translate-y-1"
                >
                  {content}
                </a>
              ) : (
                <div key={i}>{content}</div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}