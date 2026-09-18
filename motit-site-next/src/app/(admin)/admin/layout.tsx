// src/app/(admin)/admin/layout.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/Sidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
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
