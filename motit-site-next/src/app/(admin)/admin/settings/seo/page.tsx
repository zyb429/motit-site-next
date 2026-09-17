// src/app/(admin)/admin/settings/seo/page.tsx
import { Search } from "lucide-react";
import { SettingsSectionPlaceholder } from "@/components/admin/SettingsSectionPlaceholder";

export default function SeoSettingsPage() {
  return (
    <SettingsSectionPlaceholder
      icon={Search}
      title="SEO"
      subtitle="Meta-теги, OG-картинка, robots.txt"
      hint="Здесь будут настройки индексации и мета-теги по умолчанию"
    />
  );
}
