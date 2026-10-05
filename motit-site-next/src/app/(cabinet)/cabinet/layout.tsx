// src/app/(cabinet)/cabinet/layout.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AccountSidebar } from "@/components/account/Sidebar";
import { MobileMenuButton } from "@/components/mobile-menu/MobileMenuButton";
import { ThemedProviders } from "@/components/ThemedProviders";

export const dynamic = "force-dynamic";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?from=/cabinet");

  return (
    <ThemedProviders>
      <div className="h-dvh bg-(--bg-primary) flex overflow-hidden">
        <AccountSidebar user={user} />

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
