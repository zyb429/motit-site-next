// src/app/(support)/support/layout.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SupportSidebar } from "@/components/helpdesk/Sidebar";
import { ThemedProviders } from "@/components/ThemedProviders";

export const dynamic = "force-dynamic";

export default async function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?from=/support");
  }

  const allowed = user.isWorker || user.isAdmin;
  if (!allowed) {
    redirect("/");
  }

  return (
    <ThemedProviders>
      <div className="min-h-screen bg-(--bg-primary) flex">
        <SupportSidebar user={user} />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </ThemedProviders>
  );
}
