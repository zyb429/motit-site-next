import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getSiteSettings = cache(async () => {
  const s = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  if (!s) {
    throw new Error(
      "SiteSettings не создан. Выполните: npx prisma db seed",
    );
  }
  return s;
});

export type ContactPhone = { phone: string; comment?: string };

export function getContactPhones(s: {
  contactPhone?: string | null;
  contactPhones?: unknown;
}): ContactPhone[] {
  if (Array.isArray(s.contactPhones) && s.contactPhones.length) {
    return s.contactPhones
      .filter(
        (o): o is ContactPhone =>
          !!o &&
          typeof o === "object" &&
          typeof (o as { phone?: unknown }).phone === "string" &&
          !!(o as { phone: string }).phone.trim(),
      )
      .map((o) => ({
        phone: o.phone.trim(),
        ...(o.comment ? { comment: o.comment } : {}),
      }));
  }
  return s.contactPhone ? [{ phone: s.contactPhone }] : [];
}

export type ContactEmail = { email: string; comment?: string };

export function getContactEmails(s: {
  contactEmail?: string | null;
  contactEmails?: unknown;
}): ContactEmail[] {
  if (Array.isArray(s.contactEmails) && s.contactEmails.length) {
    return s.contactEmails
      .filter(
        (o): o is ContactEmail =>
          !!o &&
          typeof o === "object" &&
          typeof (o as { email?: unknown }).email === "string" &&
          !!(o as { email: string }).email.trim(),
      )
      .map((o) => ({
        email: o.email.trim(),
        ...(o.comment ? { comment: o.comment } : {}),
      }));
  }
  return s.contactEmail ? [{ email: s.contactEmail }] : [];
}

export type ContactAddress = { address: string; comment?: string };

export function getContactAddresses(s: {
  address?: string | null;
  addresses?: unknown;
}): ContactAddress[] {
  if (Array.isArray(s.addresses) && s.addresses.length) {
    return s.addresses
      .filter(
        (o): o is ContactAddress =>
          !!o &&
          typeof o === "object" &&
          typeof (o as { address?: unknown }).address === "string" &&
          !!(o as { address: string }).address.trim(),
      )
      .map((o) => ({
        address: o.address.trim(),
        ...(o.comment ? { comment: o.comment } : {}),
      }));
  }
  return s.address ? [{ address: s.address }] : [];
}