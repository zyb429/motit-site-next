"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function clearStaleSessionAction(from = "/admin") {
  const cookieStore = await cookies();

  // NextAuth v5 использует разные имена в зависимости от http/https.
  cookieStore.delete("authjs.session-token");
  cookieStore.delete("__Secure-authjs.session-token");
  cookieStore.delete("authjs.csrf-token");
  cookieStore.delete("__Host-authjs.csrf-token");
  cookieStore.delete("authjs.callback-url");
  cookieStore.delete("__Secure-authjs.callback-url");

  redirect(`/login?from=${encodeURIComponent(from)}`);
}
