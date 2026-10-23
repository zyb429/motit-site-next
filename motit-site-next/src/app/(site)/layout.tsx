// src/app/(site)/layout.tsx
import { getHeader, getFooter } from "@/lib/globals"
import Navigation from "@/components/sections/Navigation"
import Footer from "@/components/sections/Footer"
import DraftModeIndicator from "@/components/DraftModeIndicator"

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [header, footer] = await Promise.all([getHeader(), getFooter()])

  return (
    <>
      <Navigation data={header} />
      <main className="min-h-screen">{children}</main>
      <DraftModeIndicator />
      <Footer data={footer} />
    </>
  )
}