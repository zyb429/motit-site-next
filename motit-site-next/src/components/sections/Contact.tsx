// src/components/sections/Contact.tsx
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@generated/prisma";
import ContactView, { type ContactViewProps } from "./ContactView";

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

export default async function Contact(props: ContactProps) {
  const rows = await prisma.contactFormField.findMany({
    where: { enabled: true },
    orderBy: { sortOrder: "asc" },
  });

  const fields = rows.map((f) => ({
    name: f.name,
    label: f.label,
    type: f.type,
    required: f.required,
    placeholder: f.placeholder,
    options: parseOptions(f.options),
  }));

  return <ContactView {...props} fields={fields} />;
}