// src/app/actions/auth.ts
"use server";

import { signOut } from "@/lib/auth";

/**
 * Server Action для выхода.
 * signOut на сервере:
 *  - очищает cookie через Set-Cookie (без fetch на клиенте)
 *  - бросает NEXT_REDIRECT → браузер уходит на /login
 * Ошибка JSON.parse (ClientFetchError) исчезает полностью.
 */
export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
