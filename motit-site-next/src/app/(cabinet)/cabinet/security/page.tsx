// src/app/(cabinet)/cabinet/security/page.tsx
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PasswordForm } from "@/components/account/PasswordForm";
import { EmailForm } from "@/components/account/EmailForm";

export const dynamic = "force-dynamic";

export default async function SecurityPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const dbUser = await prisma.users.findUnique({
    where: { id: user.id },
    select: { id: true, email: true },
  });

  if (!dbUser) return null;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-(--text-primary)">
          Безопасность
        </h1>
        <p className="text-(--text-secondary) text-sm mt-1">
          Смена пароля и email.
        </p>

        <section className="mt-8">
          <h2 className="text-base font-medium text-(--text-primary)">
            Смена email
          </h2>
          <p className="text-xs text-(--text-secondary) mt-1">
            На новый адрес придёт письмо со ссылкой для подтверждения.
          </p>
          <EmailForm currentEmail={dbUser.email ?? ""} />
        </section>

        <section className="mt-10 pt-8 border-t border-(--border)">
          <h2 className="text-base font-medium text-(--text-primary)">
            Смена пароля
          </h2>
          <p className="text-xs text-(--text-secondary) mt-1">
            После смены пароля потребуется войти заново.
          </p>
          <PasswordForm />
        </section>
      </div>
    </div>
  );
}