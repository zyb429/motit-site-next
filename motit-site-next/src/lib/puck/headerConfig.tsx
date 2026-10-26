import type { Config } from "@puckeditor/core";
import { HeaderBlock, type HeaderBlockProps } from "@/components/puck/HeaderBlock";
import { imageUploadField } from "@/components/puck/ImageUploadField";

type HeaderConfig = { Header: HeaderBlockProps };

export const headerConfig: Config<HeaderConfig> = {
  components: {
    Header: {
      fields: {
        logoText: { type: "text", label: "Логотип: текст" },
        logoHref: { type: "text", label: "Логотип: ссылка" },
        logoImageUrl: { ...imageUploadField, label: "Логотип: изображение" },
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
          },
          defaultItemProps: { label: "", href: "", external: false },
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
        logoText: "Motit",
        logoHref: "/",
        logoImageUrl: "",
        nav: [],
        ctaLabel: "Связаться",
        ctaHref: "/contacts",
        ctaEnabled: true,
      },
      render: (props) => <HeaderBlock {...props} />,
    },
  },
};