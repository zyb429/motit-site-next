// src/app/(cabinet)/cabinet/profile/page.tsx
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/account/ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const dbUser = await prisma.users.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      username: true,
      email: true,
      full_name: true,
      phone: true,
      bio: true,
      avatar_url: true,
    },
  });

  if (!dbUser) return null;

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-(--text-primary)">Профиль</h1>
      <p className="text-(--text-secondary) text-sm mt-1">
        Обновите свои данные. Логин и email изменить нельзя.
      </p>

      <ProfileForm user={dbUser} />
    </div>
  );
}
