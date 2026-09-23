// src/app/actions/auth.ts
"use server";

import { signOut } from "@/lib/auth";
import { cookies } from "next/headers";

export async function logoutAction() {
  // 1. Сначала чистим все возможные варианты cookie вручную.
  const cookieStore = await cookies();
  cookieStore.delete("authjs.session-token");
  cookieStore.delete("__Secure-authjs.session-token");
  cookieStore.delete("authjs.csrf-token");
  cookieStore.delete("__Host-authjs.csrf-token");
  cookieStore.delete("authjs.callback-url");
  cookieStore.delete("__Secure-authjs.callback-url");

  // 2. signOut инвалидирует JWT и бросает NEXT_REDIRECT → /login.
  //    redirectTo даёт тот же эффект, что и redirect("/login") вручную.
  await signOut({ redirectTo: "/login" });
}
