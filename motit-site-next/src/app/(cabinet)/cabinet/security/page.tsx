// src/app/(cabinet)/cabinet/security/page.tsx
import { getCurrentUser } from "@/lib/auth";
import { PasswordForm } from "@/components/account/PasswordForm";

export const dynamic = "force-dynamic";

export default async function SecurityPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-[#e0f7fa]">Безопасность</h1>
      <p className="text-gray-400 text-sm mt-1">
        Смена пароля. После смены потребуется войти заново.
      </p>
      <PasswordForm />
    </div>
  );
}
