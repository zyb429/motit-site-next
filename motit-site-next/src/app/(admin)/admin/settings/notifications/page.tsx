// src/app/(admin)/admin/settings/notifications/page.tsx
import { Bell } from "lucide-react";
import { SettingsSectionPlaceholder } from "@/components/admin/SettingsSectionPlaceholder";

export default function NotificationsSettingsPage() {
  return (
    <SettingsSectionPlaceholder
      icon={Bell}
      title="Уведомления"
      subtitle="Куда присылать заявки и события"
      hint="Здесь будут адреса для уведомлений и параметры писем"
    />
  );
}
