// src/app/(cabinet)/cabinet/layout.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AccountSidebar } from "@/components/account/Sidebar";
import { ThemeForce } from "@/components/ui/ThemeForce";

export const dynamic = "force-dynamic";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?from=/account");

  const allowed = user.isClient || user.isAdmin;
  if (!allowed) redirect("/");

  return (
    <>
      <ThemeForce theme="dark" />
      <div className="min-h-screen bg-(--bg-primary) flex">
        <AccountSidebar user={user} />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </>
  );
}
