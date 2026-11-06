// src/app/api/admin/privacy-policy/rollback/route.ts
import { NextResponse } from "next/server";
import { Prisma } from "@generated/prisma";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user?.isAdmin && user?.role !== "worker") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { versionId } = body as { versionId?: unknown };
  if (typeof versionId !== "number" || !Number.isFinite(versionId)) {
    return NextResponse.json({ error: "Invalid versionId" }, { status: 400 });
  }

  const version = await prisma.privacyPolicyVersion.findUnique({
    where: { id: versionId },
  });
  if (!version) {
    return NextResponse.json({ error: "Version not found" }, { status: 404 });
  }

  const existing = await prisma.privacyPolicy.findUnique({ where: { id: 1 } });

  try {
    await prisma.$transaction(async (tx) => {
      if (existing) {
        await tx.privacyPolicyVersion.create({
          data: {
            content:
              existing.content === null
                ? Prisma.DbNull
                : (existing.content as Prisma.InputJsonValue),
            displayMode: existing.displayMode ?? "page",
            fileId: existing.fileId ?? null,
            fileName: existing.fileName ?? null,
            created_by_id: user.id,
          },
        });
      }

      const restoredContent: Prisma.InputJsonValue | typeof Prisma.DbNull =
        version.content === null
          ? Prisma.DbNull
          : (version.content as Prisma.InputJsonValue);

      await tx.privacyPolicy.upsert({
        where: { id: 1 },
        update: {
          content: restoredContent,
          displayMode: version.displayMode,
          fileId: version.displayMode === "file" ? version.fileId ?? null : null,
          fileName: version.displayMode === "file" ? version.fileName ?? null : null,
        },
        create: {
          id: 1,
          content: restoredContent,
          displayMode: version.displayMode,
          fileId: version.displayMode === "file" ? version.fileId ?? null : null,
          fileName: version.displayMode === "file" ? version.fileName ?? null : null,
        },
      });
    });
  } catch (e) {
    console.error("[privacy rollback] db error:", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}