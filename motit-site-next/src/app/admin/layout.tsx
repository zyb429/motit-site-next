// app/admin/layout.tsx
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("strapi_jwt")?.value;

  if (!token) {
    redirect("/login");
  }

  return <div className="admin-wrapper">{children}</div>;
}
