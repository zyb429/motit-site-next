// src/app/api/chat/users/search/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { searchUsersForChat } from "@/lib/db/chat";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const url = new URL(req.url);
  const query = url.searchParams.get("q") ?? "";
  const exclude = (url.searchParams.get("exclude") ?? "").split(",").filter(Boolean);

  const users = await searchUsersForChat(query, exclude);
  return NextResponse.json({ data: users });
}
