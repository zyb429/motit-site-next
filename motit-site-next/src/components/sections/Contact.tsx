// src/components/sections/Contact.tsx
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@generated/prisma";
import {
  getSiteSettings,
  getContactPhones,
  getContactEmails,
} from "@/lib/db/site-settings";
import ContactView, {
  type ContactViewProps,
  type ContactItem,
} from "./ContactView";

export type ContactProps = Omit<ContactViewProps, "fields">;

type Option = { label: string; value: string };

function parseOptions(raw: Prisma.JsonValue | null | undefined): Option[] | null {
  if (!Array.isArray(raw)) return null;
  const out: Option[] = [];
  for (const o of raw) {
    if (
      o && typeof o === "object" && !Array.isArray(o) &&
      typeof (o as any).label === "string" &&
      typeof (o as any).value === "string"
    ) {
      out.push({ label: (o as any).label, value: (o as any).value });
    }
  }
  return out;
}

/**
 * Подмешивает телефоны и email из SiteSettings в Puck-пропс `contacts`.
 *
 * Логика:
 *  - телефон: берём первый item с icon="phone"; если из настроек пришло
 *    несколько — подменяем value на массив values, оставляем label.
 *    Остальные phone-элементы из Puck отбрасываем (чтобы не дублировать).
 *  - email: аналогично для icon="mail".
 *  - если в настройках пусто — оставляем Puck-значение как есть (fallback).
 */
function mergeContacts(
  contacts: ContactItem[],
  phones: { phone: string; comment?: string }[],
  emails: { email: string; comment?: string }[],
): ContactItem[] {
  const result: ContactItem[] = [];
  let phoneInserted = false;
  let mailInserted = false;

  for (const c of contacts) {
    if (c.icon === "phone" && phones.length > 0) {
      if (phoneInserted) continue;
      phoneInserted = true;
      result.push({
        ...c,
        value: phones[0].phone,
        href: `tel:${phones[0].phone.replace(/[^\d+]/g, "")}`,
        values: phones.map((p) => ({
          value: p.phone,
          comment: p.comment,
        })),
      });
      continue;
    }

    if (c.icon === "mail" && emails.length > 0) {
      if (mailInserted) continue;
      mailInserted = true;
      result.push({
        ...c,
        value: emails[0].email,
        href: `mailto:${emails[0].email}`,
        values: emails.map((e) => ({
          value: e.email,
          comment: e.comment,
        })),
      });
      continue;
    }

    result.push(c);
  }

  // Если в Puck-контактах не было phone/mail, но в настройках непусто —
  // добавим их в начало, чтобы данные не потерялись.
  const prepend: ContactItem[] = [];
  if (!phoneInserted && phones.length > 0) {
    prepend.push({
      icon: "phone",
      label: "Телефон",
      value: phones[0].phone,
      href: `tel:${phones[0].phone.replace(/[^\d+]/g, "")}`,
      values: phones.map((p) => ({ value: p.phone, comment: p.comment })),
    });
  }
  if (!mailInserted && emails.length > 0) {
    prepend.push({
      icon: "mail",
      label: "Email",
      value: emails[0].email,
      href: `mailto:${emails[0].email}`,
      values: emails.map((e) => ({ value: e.email, comment: e.comment })),
    });
  }

  return [...prepend, ...result];
}

export default async function Contact(props: ContactProps) {
  const [rows, settings] = await Promise.all([
    prisma.contactFormField.findMany({
      where: { enabled: true },
      orderBy: { sortOrder: "asc" },
    }),
    getSiteSettings(),
  ]);

  const fields = rows.map((f) => ({
    name: f.name,
    label: f.label,
    type: f.type,
    required: f.required,
    placeholder: f.placeholder,
    options: parseOptions(f.options),
  }));

  const phones = getContactPhones(settings);
  const emails = getContactEmails(settings);
  const contacts = mergeContacts(props.contacts ?? [], phones, emails);

  return <ContactView {...props} contacts={contacts} fields={fields} />;
}