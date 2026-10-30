"use client";

import type { CustomField } from "@puckeditor/core";
import { AutoField } from "@puckeditor/core";
import { CUSTOM_SOCIAL_VALUE, type SocialOption } from "@/lib/social-options";
import { imageUploadField } from "@/components/puck/ImageUploadField";

export type FooterSocialItem = {
  name: string;
  href: string;
  customName?: string;
  customIcon?: string;
  icon?: string;
};

/**
 * Фабрика кастомного поля «Соцсети».
 * Принимает актуальный список опций (из БД через mergeSocialOptions),
 * поэтому select внутри всегда синхронизирован с настройками.
 */
export function createSocialField(
  options: SocialOption[],
): CustomField<FooterSocialItem[]> {
  const baseOptions = options
    .filter((o) => o.value !== CUSTOM_SOCIAL_VALUE)
    .map((o) => ({ label: o.label, value: o.value }));

  const selectOptions = [
    ...baseOptions,
    { label: "Другая сеть…", value: CUSTOM_SOCIAL_VALUE },
  ];

  return {
    type: "custom",
    label: "Соцсети",
    render: ({ value, onChange, field }) => {
      const items: FooterSocialItem[] = Array.isArray(value) ? value : [];

      const update = (index: number, patch: Partial<FooterSocialItem>) => {
        const next = items.map((it, i) =>
          i === index ? { ...it, ...patch } : it,
        );
        onChange(next);
      };

      const remove = (index: number) => {
        onChange(items.filter((_, i) => i !== index));
      };

      const add = () => {
        onChange([
          ...items,
          {
            name: selectOptions[0]?.value ?? "telegram",
            href: "",
          },
        ]);
      };

      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{field.label}</span>
            <button
              type="button"
              onClick={add}
              className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
            >
              + Добавить
            </button>
          </div>

          {items.length === 0 && (
            <p className="text-xs text-gray-500">
              Пока нет соцсетей. Нажмите «Добавить».
            </p>
          )}

          {items.map((item, index) => {
            const isCustom = item.name === CUSTOM_SOCIAL_VALUE;
            return (
              <div
                key={index}
                className="rounded-lg border border-gray-200 p-3 space-y-2 bg-white"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-2">
                    <AutoField
                      field={{
                        type: "select",
                        label: "Сеть",
                        options: selectOptions,
                      }}
                      value={item.name}
                      onChange={(next) =>
                        update(index, {
                          name: String(next),
                          customName:
                            next === CUSTOM_SOCIAL_VALUE
                              ? (item.customName ?? "")
                              : undefined,
                          customIcon:
                            next === CUSTOM_SOCIAL_VALUE
                              ? item.customIcon
                              : undefined,
                        })
                      }
                    />

                    {isCustom && (
                      <AutoField
                        field={{
                          type: "text",
                          label: "Название сети",
                        }}
                        value={item.customName ?? ""}
                        onChange={(next) =>
                          update(index, { customName: String(next) })
                        }
                      />
                    )}

                    {isCustom && (
                      <AutoField
                        field={{
                          ...imageUploadField,
                          label: "Иконка (SVG/PNG)",
                        }}
                        value={item.customIcon ?? ""}
                        onChange={(next) =>
                          update(index, {
                            customIcon:
                              typeof next === "string"
                                ? next
                                : ((next as { url?: string })?.url ?? ""),
                          })
                        }
                      />
                    )}

                    <AutoField
                      field={{ type: "text", label: "Ссылка (https://…)" }}
                      value={item.href}
                      onChange={(next) => update(index, { href: String(next) })}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50"
                    title="Удалить"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      );
    },
  };
}
