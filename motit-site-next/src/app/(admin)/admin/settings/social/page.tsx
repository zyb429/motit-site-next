// src/app/(admin)/admin/settings/social/page.tsx
import { Share2 } from "lucide-react";
import { SettingsSectionPlaceholder } from "@/components/admin/SettingsSectionPlaceholder";

export default function SocialSettingsPage() {
  return (
    <SettingsSectionPlaceholder
      icon={Share2}
      title="Соцсети"
      subtitle="Telegram, Instagram, VK, YouTube, LinkedIn"
      hint="Здесь будут ссылки на соцсети и мессенджеры"
    />
  );
}
