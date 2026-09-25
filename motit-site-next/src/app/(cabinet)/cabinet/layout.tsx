// src/app/(cabinet)/cabinet/layout.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AccountSidebar } from "@/components/account/Sidebar";

export const dynamic = "force-dynamic";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?from=/cabinet");

  return (
    <div className="fixed inset-0 bg-(--bg-primary) flex overflow-hidden">
      <AccountSidebar user={user} />
      <main className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">{children}</main>
    </div>
  );
}
