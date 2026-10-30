import type { Config, CustomField } from "@puckeditor/core";
import {
  HeaderBlock,
  type HeaderBlockProps,
} from "@/components/puck/HeaderBlock";
import { imageUploadField } from "@/components/puck/ImageUploadField";

type HeaderConfig = { Header: HeaderBlockProps };

export function createHeaderConfig(): Config<HeaderConfig> {
  return {
    components: {
      Header: {
        fields: {
          logoText: { type: "text", label: "Логотип: текст" },
          logoHref: { type: "text", label: "Логотип: ссылка" },
          logoImageUrl: {
            ...imageUploadField,
            label: "Логотип: изображение",
          } as CustomField<string | null | undefined>,
          nav: {
            type: "array",
            label: "Меню",
            arrayFields: {
              label: { type: "text", label: "Название" },
              href: { type: "text", label: "Ссылка" },
              external: {
                type: "radio",
                label: "Внешняя",
                options: [
                  { label: "Да", value: true },
                  { label: "Нет", value: false },
                ],
              },
              icon: {
                type: "select",
                label: "Иконка",
                options: [
                  { label: "Нет", value: "" },
                  { label: "Наушники (Поддержка)", value: "headphones" },
                ],
              },
            },
            defaultItemProps: {
              label: "",
              href: "",
              external: false,
              icon: "",
            },
            getItemSummary: (item) => item.label || "Пункт",
          },
          ctaLabel: { type: "text", label: "CTA: текст" },
          ctaHref: { type: "text", label: "CTA: ссылка" },
          ctaEnabled: {
            type: "radio",
            label: "CTA: показывать",
            options: [
              { label: "Да", value: true },
              { label: "Нет", value: false },
            ],
          },
        },
        defaultProps: {
          logoText: "МОТИТ",
          logoHref: "/",
          logoImageUrl: "",
          nav: [
            { label: "Направления", href: "/#directions", external: false },
            { label: "О нас", href: "/about", external: false },
            { label: "Контакты", href: "/#contact", external: false },
            { label: "Блог", href: "/blog", external: false },
            {
              label: "Поддержка",
              href: "/support",
              external: false,
              icon: "headphones",
            },
          ],
          ctaLabel: "СВЯЗАТЬСЯ",
          ctaHref: "/#contact",
          ctaEnabled: true,
        },
        render: (props) => <HeaderBlock {...props} />,
      },
    },
  };
}