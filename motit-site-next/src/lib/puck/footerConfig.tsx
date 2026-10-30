import type { Config, CustomField } from "@puckeditor/core";
import {
  FooterBlock,
  type FooterBlockProps,
} from "@/components/puck/FooterBlock";
import { imageUploadField } from "@/components/puck/ImageUploadField";
import { createSocialField } from "@/components/puck/SocialField";
import type { SocialOption } from "@/lib/social-options";

type FooterConfig = { Footer: FooterBlockProps };
type LogoImage = FooterBlockProps["logoImageUrl"];

const getEmptySupport = () => ({
  enabled: false,
  text: "",
  button_label: "",
  button_href: "",
  button_icon: true,
});

/**
 * Собирает конфиг Puck для футера. Принимает текущий список соцсетей,
 * чтобы select в редакторе показывал актуальные варианты (включая кастомные).
 */
export function createFooterConfig(
  socialOptions: SocialOption[],
): Config<FooterConfig> {
  return {
    components: {
      Footer: {
        fields: {
          logoText: { type: "text", label: "Лого: текст" },
          logoHref: { type: "text", label: "Лого: ссылка" },
          logoImageUrl: {
            ...imageUploadField,
            label: "Лого: изображение",
          } as CustomField<LogoImage>,
          description: { type: "textarea", label: "Описание под лого" },
          social: createSocialField(socialOptions),
          columns: {
            type: "array",
            label: "Колонки со ссылками",
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
              support: getEmptySupport(),
            },
            getItemSummary: (item) => item.title || "Колонка",
          },
          copyright: { type: "text", label: "Копирайт" },
          credit: { type: "text", label: "Подпись справа" },
        },
        defaultProps: {
          logoText: "МОТИТ",
          logoHref: "/",
          logoImageUrl: "",
          description:
            "Ваш надежный IT-партнер. Полный спектр IT-услуг для бизнеса любого масштаба.",
          columns: [
            {
              title: "Навигация",
              type: "links",
              links: [
                { label: "Направления", href: "/#directions", external: false },
                { label: "О нас", href: "/#about", external: false },
                { label: "Контакты", href: "/#contact", external: false },
                { label: "FAQ", href: "/#faq", external: false },
              ],
              contacts: [],
              support: getEmptySupport(),
            },
            {
              title: "Контакты",
              type: "contacts",
              links: [],
              contacts: [
                {
                  icon: "phone",
                  text: "+375 (29) 118-50-82",
                  href: "tel:+375291185082",
                },
                {
                  icon: "mail",
                  text: "info@motit.by",
                  href: "mailto:info@motit.by",
                },
                {
                  icon: "map-pin",
                  text: "г. Минск, ул. Сухаревская, д. 16, п. 71",
                  href: "",
                },
                { icon: "user", text: "Личный кабинет", href: "/login" },
              ],
              support: getEmptySupport(),
            },
            {
              title: "Поддержка",
              type: "support",
              links: [],
              contacts: [],
              support: {
                enabled: true,
                text: "Нужна помощь? Оставьте заявку в нашей системе техподдержки.",
                button_label: "ТЕХПОДДЕРЖКА",
                button_href: "https://help.motit.by",
                button_icon: true,
              },
            },
          ],
          social: [],
          copyright: "© 2026 МОТИТ. Все права защищены.",
          credit: "Разработано в МОТИТ",
        },
        render: (props) => <FooterBlock {...props} />,
      },
    },
  };
}