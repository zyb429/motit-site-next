// src/app/api/admin/privacy-policy/versions/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type PrivacyMode = "page" | "document" | "file";

function isPrivacyMode(v: unknown): v is PrivacyMode {
  return v === "page" || v === "document" || v === "file";
}

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user?.isAdmin && user?.role !== "worker") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const rawMode = url.searchParams.get("displayMode");
  const displayMode = rawMode && isPrivacyMode(rawMode) ? rawMode : undefined;

  const rows = await prisma.privacyPolicyVersion.findMany({
    where: displayMode ? { displayMode } : undefined,
    orderBy: { created_at: "desc" },
    take: 50,
    include: {
      created_by: {
        select: { id: true, username: true, full_name: true },
      },
    },
  });

  // Проверяем, какие файлы из версий ещё живы
  const fileIds = rows
    .filter((v) => v.displayMode === "file" && v.fileId)
    .map((v) => v.fileId!) as number[];

  const aliveFiles =
    fileIds.length > 0
      ? await prisma.files.findMany({
          where: { id: { in: fileIds } },
          select: { id: true },
        })
      : [];
  const aliveSet = new Set(aliveFiles.map((f) => f.id));

  return NextResponse.json({
    versions: rows.map((v) => ({
      id: v.id,
      content: v.content,
      displayMode: v.displayMode as PrivacyMode,
      fileId: v.fileId ?? null,
      fileName: v.fileName ?? null,
      // для file-режима сообщаем, доступен ли ещё файл
      fileExists:
        v.displayMode === "file" && v.fileId
          ? aliveSet.has(v.fileId)
          : undefined,
      created_at: v.created_at.toISOString(),
      created_by: v.created_by
        ? {
            id: v.created_by.id,
            username: v.created_by.username,
            full_name: v.created_by.full_name,
          }
        : null,
    })),
  });
}