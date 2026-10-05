// src/app/(admin)/admin/layout.tsx
import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser, auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/Sidebar";
import { ClearStaleSession } from "./clear-stale-session";
import { MobileMenuButton } from "@/components/mobile-menu/MobileMenuButton";
import { ThemedProviders } from "@/components/ThemedProviders";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    const session = await auth();
    if (session?.user?.id) {
      return <ClearStaleSession />;
    }
    redirect("/login?from=/admin");
  }

  const allowed = user.isAdmin || user.role === "worker";
  if (!allowed) {
    redirect("/");
  }

  const cookieStore = await cookies();
  const initialCollapsed =
    cookieStore.get("admin-sidebar-collapsed")?.value === "1";

  return (
    <ThemedProviders>
      <div className="h-dvh bg-(--bg-primary) flex overflow-hidden">
        <Suspense
          fallback={
            <aside
              className={`${
                initialCollapsed ? "w-16" : "w-64"
              } shrink-0 border-r border-(--border) bg-(--bg-card)`}
            />
          }
        >
          <AdminSidebar user={user} initialCollapsed={initialCollapsed} />
        </Suspense>

        <main className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
          {/* Верхняя панель — только на мобилке */}
          <div className="shrink-0 h-14 flex items-center px-3 border-b border-(--border) lg:hidden">
            <MobileMenuButton />
          </div>

          {/* Контент страницы */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {children}
          </div>
        </main>
      </div>
    </ThemedProviders>
  );
}
