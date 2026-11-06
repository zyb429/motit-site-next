// src/components/site/Header.tsx
import { getSiteSettings } from "@/lib/db/site-settings";
import { Navigation } from "./Navigation";

export async function Header() {
  const settings = await getSiteSettings();

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-20 items-center justify-between gap-4">
          <Navigation
            logoUrl={settings?.logoLightUrl || settings?.logoDarkUrl}
            siteName={settings?.siteName}
          />
        </div>
      </div>
    </header>
  );
}