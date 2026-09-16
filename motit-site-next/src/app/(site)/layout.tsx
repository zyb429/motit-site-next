// src/app/(site)/layout.tsx
import Navigation from "@/components/sections/Navigation";
import Footer from "@/components/sections/Footer";
import DraftModeIndicator from "@/components/DraftModeIndicator";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navigation />
      <main className="min-h-screen">{children}</main>
      <DraftModeIndicator />
      <Footer />
    </>
  );
}
