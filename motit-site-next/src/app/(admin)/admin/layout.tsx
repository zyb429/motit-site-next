// src/app/(admin)/admin/layout.tsx
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getCurrentUser, auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/Sidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    const session = await auth();

    // «Фантомная» сессия: cookie есть, юзера в БД нет.
    // Удаляем cookie прямо здесь — это работает в RSC,
    // в отличие от signOut() внутри Server Action.
    if (session?.user?.id) {
      const cookieStore = await cookies();

      // NextAuth v5 использует разные имена в зависимости от http/https.
      // Удаляем все возможные варианты.
      cookieStore.delete("authjs.session-token");
      cookieStore.delete("__Secure-authjs.session-token");
      cookieStore.delete("authjs.csrf-token");
      cookieStore.delete("__Host-authjs.csrf-token");
      cookieStore.delete("authjs.callback-url");
      cookieStore.delete("__Secure-authjs.callback-url");
    }

    redirect("/login?from=/admin");
  }

  const allowed = user.isAdmin || user.role === "worker";
  if (!allowed) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-(--bg-primary) flex">
      <AdminSidebar user={user} />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
