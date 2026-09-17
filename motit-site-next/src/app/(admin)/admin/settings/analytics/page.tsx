// src/app/(admin)/admin/settings/analytics/page.tsx
import { BarChart3 } from "lucide-react";
import { SettingsSectionPlaceholder } from "@/components/admin/SettingsSectionPlaceholder";

export default function AnalyticsSettingsPage() {
  return (
    <SettingsSectionPlaceholder
      icon={BarChart3}
      title="Аналитика"
      subtitle="Google Analytics, Яндекс.Метрика"
      hint="Здесь будут ID счётчиков и скрипты аналитики"
    />
  );
}
