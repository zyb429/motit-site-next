import { ThemeForce } from "@/components/ui/ThemeForce";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ThemeForce theme="dark" />
      {children}
    </>
  );
}
