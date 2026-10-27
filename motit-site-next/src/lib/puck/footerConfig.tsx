import type { Config } from "@puckeditor/core";
import {
  FooterBlock,
  type FooterBlockProps,
} from "@/components/puck/FooterBlock";
import { imageUploadField } from "@/components/puck/ImageUploadField";

type FooterConfig = { Footer: FooterBlockProps };

export const footerConfig: Config<FooterConfig> = {
  components: {
    Footer: {
      fields: {
        logoText: { type: "text", label: "Лого: текст" },
        logoHref: { type: "text", label: "Лого: ссылка" },
        logoImageUrl: { ...imageUploadField, label: "Лого: изображение" },
        description: { type: "textarea", label: "Описание под лого" },
        social: {
          type: "array",
          label: "Соцсети",
          arrayFields: {
            name: {
              type: "select",
              label: "Сеть",
              options: [
                { label: "telegram", value: "telegram" },
                { label: "vk", value: "vk" },
                { label: "youtube", value: "youtube" },
                { label: "instagram", value: "instagram" },
                { label: "whatsapp", value: "whatsapp" },
                { label: "github", value: "github" },
                { label: "twitter", value: "twitter" },
                { label: "facebook", value: "facebook" },
                { label: "linkedin", value: "linkedin" },
                { label: "support", value: "support" },
              ],
            },
            href: { type: "text", label: "Ссылка" },
          },
          defaultItemProps: { name: "telegram", href: "" },
          getItemSummary: (item) => item.name,
        },
        columns: {
          type: "array",
          label: "Колонки",
          arrayFields: {
            title: { type: "text", label: "Заголовок" },
            type: {
              type: "select",
              label: "Тип",
              options: [
                { label: "Ссылки", value: "links" },
                { label: "Контакты", value: "contacts" },
                { label: "Поддержка", value: "support" },
              ],
            },
            links: {
              type: "array",
              label: "Ссылки",
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
              },
              defaultItemProps: { label: "", href: "", external: false },
              getItemSummary: (item) => item.label || "Ссылка",
            },
            contacts: {
              type: "array",
              label: "Контакты",
              arrayFields: {
                icon: {
                  type: "select",
                  label: "Иконка",
                  options: [
                    { label: "Телефон", value: "phone" },
                    { label: "Email", value: "mail" },
                    { label: "Адрес", value: "map-pin" },
                    { label: "Пользователь", value: "user" },
                  ],
                },
                text: { type: "text", label: "Текст" },
                href: { type: "text", label: "Ссылка (tel:/mailto:)" },
              },
              defaultItemProps: { icon: "phone", text: "", href: "" },
              getItemSummary: (item) => item.text || "Контакт",
            },
            support: {
              type: "object",
              label: "Блок поддержки",
              objectFields: {
                enabled: {
                  type: "radio",
                  label: "Показывать",
                  options: [
                    { label: "Да", value: true },
                    { label: "Нет", value: false },
                  ],
                },
                text: { type: "textarea", label: "Текст" },
                button_label: { type: "text", label: "Текст кнопки" },
                button_href: { type: "text", label: "Ссылка кнопки" },
                button_icon: {
                  type: "radio",
                  label: "Иконка наушников",
                  options: [
                    { label: "Да", value: true },
                    { label: "Нет", value: false },
                  ],
                },
              },
            },
          },
          defaultItemProps: {
            title: "",
            type: "links",
            links: [],
            contacts: [],
          },
          getItemSummary: (item) => item.title || "Колонка",
        },
        copyright: { type: "text", label: "Копирайт" },
      },
      defaultProps: {
        logoText: "МОТИТ",
        logoHref: "/",
        logoImageUrl: "",
        description: "IT-решения для бизнеса",
        columns: [
          {
            title: "Услуги",
            type: "links",
            links: [
              { label: "Разработка ПО", href: "/services/dev", external: false },
              { label: "Техподдержка", href: "/services/support", external: false },
            ],
            contacts: [],
          },
          {
            title: "Контакты",
            type: "contacts",
            links: [],
            contacts: [
              { icon: "phone", text: "+375 (29) 118-50-82", href: "tel:+375291185082" },
              { icon: "mail", text: "info@motit.by", href: "mailto:info@motit.by" },
            ],
          },
        ],
        social: [
          { name: "telegram", href: "https://t.me/motit" },
          { name: "vk", href: "https://vk.com/motit" },
        ],
        copyright: "© 2026 МОТИТ. Все права защищены.",
      },
      render: (props) => <FooterBlock {...props} />,
    },
  },
};