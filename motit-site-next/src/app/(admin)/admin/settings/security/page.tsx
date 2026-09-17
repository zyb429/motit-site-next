// src/app/(admin)/admin/settings/security/page.tsx
import { Shield } from "lucide-react";
import { SettingsSectionPlaceholder } from "@/components/admin/SettingsSectionPlaceholder";

export default function SecuritySettingsPage() {
  return (
    <SettingsSectionPlaceholder
      icon={Shield}
      title="Безопасность"
      subtitle="2FA, срок сессии, IP-ограничения"
      hint="Здесь будут настройки безопасности админки"
    />
  );
}
