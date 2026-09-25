// src/app/(admin)/admin/layout.tsx
import { redirect } from "next/navigation";
import { getCurrentUser, auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/Sidebar";
import { ClearStaleSession } from "./clear-stale-session";

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
    // В RSC cookies менять нельзя — рендерим клиентский компонент,
    // который вызовет Server Action и очистит cookie.
    if (session?.user?.id) {
      return <ClearStaleSession />;
    }

    redirect("/login?from=/admin");
  }

  const allowed = user.isAdmin || user.role === "worker";
  if (!allowed) {
    redirect("/");
  }

  return (
    <div className="h-dvh bg-(--bg-primary) flex overflow-hidden">
      <AdminSidebar user={user} />
      <main className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">{children}</main>
    </div>
  );
}
