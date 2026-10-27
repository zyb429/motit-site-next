import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const fields = await prisma.contactFormField.findMany({
    where: { enabled: true },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(fields);
}