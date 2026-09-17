// src/app/(admin)/admin/settings/backups/page.tsx
import { Database } from "lucide-react";
import { SettingsSectionPlaceholder } from "@/components/admin/SettingsSectionPlaceholder";

export default function BackupsSettingsPage() {
  return (
    <SettingsSectionPlaceholder
      icon={Database}
      title="Резервные копии"
      subtitle="Экспорт, импорт и сброс настроек"
      hint="Здесь будет экспорт и импорт конфигурации сайта"
    />
  );
}
