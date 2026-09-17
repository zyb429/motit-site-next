// src/app/(admin)/admin/settings/email/page.tsx
import { Mail } from "lucide-react";
import { SettingsSectionPlaceholder } from "@/components/admin/SettingsSectionPlaceholder";

export default function EmailSettingsPage() {
  return (
    <SettingsSectionPlaceholder
      icon={Mail}
      title="Почта"
      subtitle="Адрес и имя отправителя писем"
      hint="SMTP-параметры хранятся в .env, здесь — только отображаемые данные"
    />
  );
}
