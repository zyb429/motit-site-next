// src/app/actions/auth.ts
"use server";

import { signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function logoutAction() {
  // signOut сам очистит куки сессии и CSRF
  await signOut({ redirect: false });
  redirect("/login");
}