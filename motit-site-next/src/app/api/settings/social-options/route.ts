import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mergeSocialOptions } from "@/lib/social-options";

export async function GET() {
  const row = await prisma.globalSettings.findUnique({
    where: { key: "social_options" },
  });
  return NextResponse.json(mergeSocialOptions(row?.value), {
    headers: { "Cache-Control": "no-store" },
  });
}
