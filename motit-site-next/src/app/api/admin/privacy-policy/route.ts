// src/app/api/admin/privacy-policy/route.ts
import { NextResponse } from "next/server";
import { Prisma } from "@generated/prisma";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type PrivacyMode = "page" | "document" | "file";

function isPrivacyMode(v: unknown): v is PrivacyMode {
  return v === "page" || v === "document" || v === "file";
}

function isTiptapDoc(v: unknown): v is { type: "doc"; content?: unknown[] } {
  return (
    !!v &&
    typeof v === "object" &&
    !Array.isArray(v) &&
    (v as { type?: unknown }).type === "doc" &&
    (!(v as { content?: unknown }).content ||
      Array.isArray((v as { content?: unknown }).content))
  );
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

  // === Валидация в зависимости от режима ===

  // Для page/document контент ОБЯЗАТЕЛЕН (нельзя затирать существующий null'ом)
  // Для file контент игнорируется полностью (не трогаем поле в БД)
  if (displayMode !== "file") {
    if (content === null || content === undefined) {
      return NextResponse.json(
        { error: "content is required for mode=page/document" },
        { status: 400 },
      );
    }
    if (!isTiptapDoc(content)) {
      return NextResponse.json({ error: "Invalid content" }, { status: 400 });
    }
  }

  let nextFileId: number | null = null;
  let nextFileName: string | null = null;

  if (displayMode === "file") {
    if (typeof fileId !== "number" || !Number.isInteger(fileId) || fileId <= 0) {
      return NextResponse.json(
        { error: "fileId is required for mode=file" },
        { status: 400 },
      );
    }
    if (typeof fileName !== "string" || fileName.trim() === "") {
      return NextResponse.json(
        { error: "fileName is required for mode=file" },
        { status: 400 },
      );
    }
    const fileExists = await prisma.files.findUnique({ where: { id: fileId } });
    if (!fileExists) {
      return NextResponse.json({ error: "File not found" }, { status: 400 });
    }
    nextFileId = fileId;
    nextFileName = fileName.trim();
  }

  try {
    const existing = await prisma.privacyPolicy.findUnique({ where: { id: 1 } });

    await prisma.$transaction(async (tx) => {
      // 1. Сохраняем ПРЕДЫДУЩЕЕ состояние в историю (только если оно было)
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

      // 2. Формируем update: в режиме file НЕ трогаем content
      const updateData: Prisma.PrivacyPolicyUpdateInput = {
        displayMode,
        fileId: displayMode === "file" ? nextFileId : null,
        fileName: displayMode === "file" ? nextFileName : null,
      };
      if (displayMode !== "file") {
        updateData.content = content as Prisma.InputJsonValue;
      }

      // 3. Формируем create: при первом создании в режиме file
      //    content = DbNull (пусто), т.к. политики ещё нет
      const createData: Prisma.PrivacyPolicyCreateInput = {
        id: 1,
        displayMode,
        fileId: displayMode === "file" ? nextFileId : null,
        fileName: displayMode === "file" ? nextFileName : null,
        content:
          displayMode === "file"
            ? Prisma.DbNull
            : (content as Prisma.InputJsonValue),
      };

      await tx.privacyPolicy.upsert({
        where: { id: 1 },
        update: updateData,
        create: createData,
      });
    });
  } catch (e) {
    console.error("[privacy POST] db error:", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}