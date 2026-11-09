// src/app/api/admin/privacy-policy/rollback/route.ts
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { Prisma } from "@generated/prisma";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type PrivacyMode = "page" | "document" | "file";

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
  if (
    typeof versionId !== "number" ||
    !Number.isInteger(versionId) ||
    versionId <= 0
  ) {
    return NextResponse.json({ error: "Invalid versionId" }, { status: 400 });
  }

  const version = await prisma.privacyPolicyVersion.findUnique({
    where: { id: versionId },
  });
  if (!version) {
    return NextResponse.json({ error: "Version not found" }, { status: 404 });
  }

  const versionMode = version.displayMode as PrivacyMode;

  // === Проверка существования файла для file-режима ===
  let restoredFile: { id: number; url: string; name: string } | null = null;

  if (versionMode === "file") {
    if (!version.fileId) {
      return NextResponse.json(
        { error: "Версия в режиме файла не содержит fileId" },
        { status: 409 },
      );
    }
    const f = await prisma.files.findUnique({ where: { id: version.fileId } });
    if (!f) {
      return NextResponse.json(
        {
          error:
            "Файл из этой версии был удалён. Откат к ней невозможен — восстановите файл или выберите другую версию.",
        },
        { status: 409 },
      );
    }
    restoredFile = {
      id: f.id,
      url: f.url,
      name: version.fileName ?? f.name,
    };
  }

  const existing = await prisma.privacyPolicy.findUnique({ where: { id: 1 } });

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Сохраняем ТЕКУЩЕЕ состояние в историю
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

      // 2. Восстанавливаем состояние версии
      const restoredContent: Prisma.InputJsonValue | typeof Prisma.DbNull =
        version.content === null
          ? Prisma.DbNull
          : (version.content as Prisma.InputJsonValue);

      // ВАЖНО: при откате на file НЕ трогаем content —
      // иначе затрём ранее сохранённый текст с прошлой page/document-версии
    const isFileMode = versionMode === "file";

    const updateData: Prisma.PrivacyPolicyUpdateInput = {
    displayMode: versionMode,
    fileName: isFileMode ? version.fileName ?? null : null,
    ...(isFileMode && version.fileId
        ? { file: { connect: { id: version.fileId } } }
        : { file: { disconnect: true } }),
    };
    if (!isFileMode) {
    updateData.content = restoredContent;
    }

    const createData: Prisma.PrivacyPolicyCreateInput = {
    id: 1,
    displayMode: versionMode,
    fileName: isFileMode ? version.fileName ?? null : null,
    content: isFileMode ? Prisma.DbNull : restoredContent,
    ...(isFileMode && version.fileId
        ? { file: { connect: { id: version.fileId } } }
        : {}),
    };

      await tx.privacyPolicy.upsert({
        where: { id: 1 },
        update: updateData,
        create: createData,
      });
    });
  } catch (e) {
    console.error("[privacy rollback] db error:", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  // Возвращаем актуальный file — клиент восстановит стейт
  return NextResponse.json({ ok: true, file: restoredFile });
}
