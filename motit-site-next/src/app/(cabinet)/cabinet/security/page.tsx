// src/app/(cabinet)/cabinet/security/page.tsx
import { getCurrentUser } from "@/lib/auth";
import { PasswordForm } from "@/components/account/PasswordForm";

export const dynamic = "force-dynamic";

export default async function SecurityPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h1 className="text-2xl font-bold text-(--text-primary)">Безопасность</h1>
      <p className="text-(--text-secondary) text-sm mt-1">
        Смена пароля. После смены потребуется войти заново.
      </p>
      <PasswordForm />
    </div>
  );
}
