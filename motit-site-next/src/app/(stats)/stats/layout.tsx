// src/app/(stats)/stats/layout.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { StatsSidebar } from "@/components/stats/Sidebar";
import { ThemeForce } from "@/components/ui/ThemeForce";

export default async function StatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?from=/stats");
  }

  const allowed = user.isStatistics || user.isAdmin;
  if (!allowed) {
    redirect("/");
  }

  return (
    <>
      <ThemeForce theme="dark" />
      <div className="min-h-screen bg-(--bg-primary) flex">
        <StatsSidebar user={user} />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </>
  );
}
