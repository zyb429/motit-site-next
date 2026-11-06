// src/app/api/admin/privacy-policy/route.ts
import { NextResponse } from "next/server";
import { Prisma } from "@generated/prisma";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type PrivacyMode = "page" | "document" | "file";

function isPrivacyMode(v: unknown): v is PrivacyMode {
  return v === "page" || v === "document" || v === "file";
}

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

  const { content, displayMode, fileId, fileName } = body as {
    content?: unknown;
    displayMode?: unknown;
    fileId?: unknown;
    fileName?: unknown;
  };

  if (!isPrivacyMode(displayMode)) {
    return NextResponse.json({ error: "Invalid displayMode" }, { status: 400 });
  }

  if (content !== null && content !== undefined) {
    if (
      typeof content !== "object" ||
      Array.isArray(content) ||
      (content as { type?: unknown }).type !== "doc"
    ) {
      return NextResponse.json({ error: "Invalid content" }, { status: 400 });
    }
  }

  let nextFileId: number | null = null;
  let nextFileName: string | null = null;

  if (displayMode === "file") {
    if (typeof fileId !== "number" || !Number.isInteger(fileId) || fileId <= 0) {
      return NextResponse.json({ error: "fileId is required for mode=file" }, { status: 400 });
    }
    if (typeof fileName !== "string" || fileName.trim() === "") {
      return NextResponse.json({ error: "fileName is required for mode=file" }, { status: 400 });
    }
    const fileExists = await prisma.files.findUnique({ where: { id: fileId } });
    if (!fileExists) {
      return NextResponse.json({ error: "File not found" }, { status: 400 });
    }
    nextFileId = fileId;
    nextFileName = fileName;
  }

  const contentValue: Prisma.InputJsonValue | typeof Prisma.DbNull =
    content === null || content === undefined
      ? Prisma.DbNull
      : (content as Prisma.InputJsonValue);

  try {
    const existing = await prisma.privacyPolicy.findUnique({ where: { id: 1 } });

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

      await tx.privacyPolicy.upsert({
        where: { id: 1 },
        update: {
          content: contentValue,
          displayMode,
          fileId: displayMode === "file" ? nextFileId : null,
          fileName: displayMode === "file" ? nextFileName : null,
        },
        create: {
          id: 1,
          content: contentValue,
          displayMode,
          fileId: displayMode === "file" ? nextFileId : null,
          fileName: displayMode === "file" ? nextFileName : null,
        },
      });
    });
  } catch (e) {
    console.error("[privacy POST] db error:", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}