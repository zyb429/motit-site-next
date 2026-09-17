// src/app/(admin)/admin/settings/contacts/page.tsx
import { Phone } from "lucide-react";
import { SettingsSectionPlaceholder } from "@/components/admin/SettingsSectionPlaceholder";

export default function ContactsSettingsPage() {
  return (
    <SettingsSectionPlaceholder
      icon={Phone}
      title="Контакты"
      subtitle="Email, телефон, адрес, график работы"
      hint="Здесь будут контактные данные, отображаемые на сайте"
    />
  );
}
