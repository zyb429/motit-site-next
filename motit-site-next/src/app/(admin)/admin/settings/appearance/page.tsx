// src/app/(admin)/admin/settings/appearance/page.tsx
import { Palette } from "lucide-react";
import { SettingsSectionPlaceholder } from "@/components/admin/SettingsSectionPlaceholder";

export default function AppearanceSettingsPage() {
  return (
    <SettingsSectionPlaceholder
      icon={Palette}
      title="Внешний вид"
      subtitle="Логотип, favicon, акцентный цвет"
      hint="Здесь будут настройки брендинга и оформления"
    />
  );
}
