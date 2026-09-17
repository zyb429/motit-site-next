// src/app/(site)/layout.tsx
import Navigation from "@/components/sections/Navigation";
import Footer from "@/components/sections/Footer";
import DraftModeIndicator from "@/components/DraftModeIndicator";
import { ThemeForce } from "@/components/ui/ThemeForce";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ThemeForce theme="dark" />
      <Navigation />
      <main className="min-h-screen">{children}</main>
      <DraftModeIndicator />
      <Footer />
    </>
  );
}
