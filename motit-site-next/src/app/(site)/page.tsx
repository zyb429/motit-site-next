// src/app/page.tsx
import type { Metadata } from "next";
import type { Data } from "@puckeditor/core";
import { getPuckDoc } from "@/lib/db/puck";
import {
  getSiteSettings,
  getContactPhones,
  getContactEmails,
  getContactAddresses,
} from "@/lib/db/site-settings";
import { prisma } from "@/lib/prisma";
import { mergeSocialOptions } from "@/lib/social-options";
import { SitePuckRenderer } from "@/components/site/SitePuckRenderer";

export const metadata: Metadata = {
  title: "МОТИТ — IT-решения для бизнеса",
  description: "Комплексные IT-услуги: аудит, мониторинг, безопасность",
};

export const dynamic = "force-dynamic";

type ContactItem = {
  icon: "phone" | "mail" | "map-pin" | "clock";
  label: string;
  value: string;
  href?: string;
  values?: { value: string; comment?: string }[];
};

/**
 * Подмешивает в Puck-блок "Contact":
 *  - workHours из настроек (если не задан в самом блоке);
 *  - телефоны из SiteSettings.contactPhones → в первый item icon="phone"
 *    как массив values; если такого item нет — добавляет в начало;
 *  - email-адреса из SiteSettings.contactEmails → в первый item icon="mail"
 *    как массив values; если нет — добавляет в начало;
 *  - адреса из SiteSettings.addresses → в первый item icon="map-pin"
 *    как массив values; если нет — добавляет в начало.
 *
 * Это нужно потому, что SitePuckRenderer — клиентский компонент,
 * и async-компонент Contact внутри него не выполнится.
 */
function injectContactData(
  data: Data,
  settings: Awaited<ReturnType<typeof getSiteSettings>>,
): Data {
  if (!data?.content?.length) return data;

  const phones = getContactPhones(settings);
  const emails = getContactEmails(settings);
  const addresses = getContactAddresses(settings);
  const fallbackWorkHours = settings.workHours?.trim() || "";

  return {
    ...data,
    content: data.content.map((item) => {
      if ((item as { type?: string })?.type !== "Contact") return item;

      const props = {
        ...((item as { props?: Record<string, unknown> }).props ?? {}),
      };

      // 1. График работы
      if (!props.workHours) {
        props.workHours = fallbackWorkHours;
      }

      // 2. Контакты (телефоны + email + адреса)
      const baseContacts: ContactItem[] = Array.isArray(props.contacts)
        ? (props.contacts as ContactItem[])
        : [];

      const merged: ContactItem[] = [];
      let phoneInserted = false;
      let mailInserted = false;
      let addressInserted = false;

      for (const c of baseContacts) {
        if (c.icon === "phone" && phones.length > 0) {
          if (phoneInserted) continue;
          phoneInserted = true;
          merged.push({
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
          merged.push({
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

        if (c.icon === "map-pin" && addresses.length > 0) {
          if (addressInserted) continue;
          addressInserted = true;
          merged.push({
            ...c,
            value: addresses[0].address,
            href: undefined,
            values: addresses.map((a) => ({
              value: a.address,
              comment: a.comment,
            })),
          });
          continue;
        }

        merged.push(c);
      }

      // 3. Если в Puck-документе не было phone/mail/map-pin — добавим в начало,
      //    чтобы настройки не потерялись.
      const prepend: ContactItem[] = [];
      if (!phoneInserted && phones.length > 0) {
        prepend.push({
          icon: "phone",
          label: "Телефон",
          value: phones[0].phone,
          href: `tel:${phones[0].phone.replace(/[^\d+]/g, "")}`,
          values: phones.map((p) => ({
            value: p.phone,
            comment: p.comment,
          })),
        });
      }
      if (!mailInserted && emails.length > 0) {
        prepend.push({
          icon: "mail",
          label: "Email",
          value: emails[0].email,
          href: `mailto:${emails[0].email}`,
          values: emails.map((e) => ({
            value: e.email,
            comment: e.comment,
          })),
        });
      }
      if (!addressInserted && addresses.length > 0) {
        prepend.push({
          icon: "map-pin",
          label: "Адрес",
          value: addresses[0].address,
          values: addresses.map((a) => ({
            value: a.address,
            comment: a.comment,
          })),
        });
      }

      props.contacts = [...prepend, ...merged];

      return { ...item, props } as typeof item;
    }),
  };
}

export default async function Home() {
  const [data, settings, socialRow] = await Promise.all([
    getPuckDoc("puck_home"),
    getSiteSettings(),
    prisma.globalSettings.findUnique({ where: { key: "social_options" } }),
  ]);

  const patched = injectContactData(data as Data, settings);
  const socialOptions = mergeSocialOptions(socialRow?.value);

  return (
    <SitePuckRenderer
      kind="home"
      data={patched}
      socialOptions={socialOptions}
    />
  );
}