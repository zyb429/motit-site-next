// src/app/(admin)/admin/layout.tsx
import { Suspense } from "react";
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
      <Suspense
        fallback={
          <aside className="w-64 shrink-0 border-r border-(--border) bg-(--bg-card)" />
        }
      >
        <AdminSidebar user={user} />
      </Suspense>
      <main className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
