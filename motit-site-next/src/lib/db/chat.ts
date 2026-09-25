// src/lib/db/chat.ts
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

// --------------------------------------------
// Типы
// --------------------------------------------
export type ChatKind = "direct" | "group" | "channel" | "private_channel" | "ticket";
export type ChatMemberRole = "owner" | "admin" | "member";
export type MessageKind = "text" | "file" | "system" | "status_change";

export type ChatListItem = {
  uuid: string;
  kind: ChatKind;
  name: string | null;
  description: string | null;
  avatar_url: string | null;
  is_archived: boolean;
  last_message_at: Date | null;
  unread_count: number;
  is_pinned: boolean;
  is_muted: boolean;
  // последнее сообщение
  last_message: {
    content: string;
    kind: MessageKind;
    created_at: Date | null;
    user: { uuid: string; full_name: string | null; username: string | null } | null;
  } | null;
  // участники (для direct — собеседник)
  members: Array<{
    uuid: string;
    user: {
      uuid: string;
      full_name: string | null;
      username: string | null;
      avatar_url: string | null;
    };
  }>;
};

export type ChatMessageItem = {
  uuid: string;
  chat_uuid: string;
  kind: MessageKind;
  content: string;
  reply_to_uuid: string | null;
  edited_at: Date | null;
  deleted_at: Date | null;
  created_at: Date | null;
  user: {
    uuid: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
  attachments: Array<{
    uuid: string;
    file: {
      id: number;
      uuid: string;
      name: string;
      url: string;
      mime: string | null;
      size: number | null;
    };
  }>;
  reactions: Array<{ emoji: string; user_uuid: string }>;
  read_receipts: Array<{ user_uuid: string; read_at: Date | null }>;

  forwarded_from_message_uuid: string | null;
  forwarded_from_chat_uuid: string | null;
  forwarded_from_user_uuid: string | null;
};

// --------------------------------------------
// Проверка доступа
// --------------------------------------------
async function assertChatMember(chatUuid: string, userUuid: string) {
  const member = await prisma.chat_members.findUnique({
    where: { chat_uuid_user_uuid: { chat_uuid: chatUuid, user_uuid: userUuid } },
  });
  if (!member) throw new Error("Нет доступа к этому чату");
  return member;
};

// --------------------------------------------
// Список чатов пользователя
// --------------------------------------------
export async function listChatsForUser(userUuid: string): Promise<ChatListItem[]> {
  const memberships = await prisma.chat_members.findMany({
    where: { user_uuid: userUuid, chat: { is_archived: false } },
    include: {
      chat: {
        include: {
          members: {
            include: {
              user: {
                select: { uuid: true, full_name: true, username: true, avatar_url: true },
              },
            },
          },
          messages: {
            orderBy: { created_at: "desc" },
            take: 1,
            include: {
              user: { select: { uuid: true, full_name: true, username: true } },
            },
          },
        },
      },
    },
    orderBy: [
      { is_pinned: "desc" },
      { chat: { last_message_at: "desc" } },
    ],
  });

  return memberships.map((m) => {
    const last = m.chat.messages[0];
    return {
      uuid: m.chat.uuid,
      kind: m.chat.kind as ChatKind,
      name: m.chat.name,
      description: m.chat.description,
      avatar_url: m.chat.avatar_url,
      is_archived: m.chat.is_archived,
      last_message_at: m.chat.last_message_at,
      unread_count: m.unread_count,
      is_pinned: m.is_pinned,
      is_muted: m.is_muted,
      last_message: last
        ? {
            content: last.content,
            kind: last.kind as MessageKind,
            created_at: last.created_at,
            user: last.user,
          }
        : null,
      members: m.chat.members.map((cm) => ({
        uuid: cm.uuid,
        user: cm.user,
      })),
    };
  });
};

// --------------------------------------------
// Детали чата
// --------------------------------------------
export async function getChatByUuid(uuid: string, userUuid: string) {
  const membership = await prisma.chat_members.findUnique({
    where: { chat_uuid_user_uuid: { chat_uuid: uuid, user_uuid: userUuid } },
  });
  if (!membership) return null;

  return prisma.chats.findUnique({
    where: { uuid },
    include: {
      members: {
        include: {
          user: {
            select: { uuid: true, full_name: true, username: true, avatar_url: true },
          },
        },
      },
      created_by: {
        select: { uuid: true, full_name: true, username: true },
      },
    },
  });
};

// --------------------------------------------
// ЛС: создать или получить существующий
// --------------------------------------------
export async function getOrCreateDirectChat(userA: string, userB: string) {
  if (userA === userB) throw new Error("Нельзя создать чат с самим собой");
  if (!userA || !userB) throw new Error("Не указаны участники");

  // Детерминированный ключ: оба uuid отсортированы
  const [a, b] = [userA, userB].sort();
  const directKey = `${a}:${b}`;

  const existing = await prisma.chats.findUnique({
    where: { direct_key: directKey },
  });
  if (existing) return existing;

  return prisma.$transaction(async (tx) => {
    const chat = await tx.chats.create({
      data: {
        uuid: randomUUID(),
        kind: "direct",
        direct_key: directKey,
        created_by_uuid: userA,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    await tx.chat_members.createMany({
      data: [
        { uuid: randomUUID(), chat_uuid: chat.uuid, user_uuid: userA, role: "member" },
        { uuid: randomUUID(), chat_uuid: chat.uuid, user_uuid: userB, role: "member" },
      ],
    });

    return chat;
  });
};

// --------------------------------------------
// Группа
// --------------------------------------------
export async function createGroupChat(params: {
  name: string;
  creatorUuid: string;
  memberUuids: string[];
  description?: string;
}) {
  const { name, creatorUuid, memberUuids, description } = params;

  if (!name.trim()) throw new Error("Укажите название группы");

  // Убираем дубликаты + самого создателя
  const uniqueMembers = [...new Set(memberUuids.filter((u) => u !== creatorUuid))];
  if (uniqueMembers.length === 0) throw new Error("Добавьте хотя бы одного участника");

  return prisma.$transaction(async (tx) => {
    const chat = await tx.chats.create({
      data: {
        uuid: randomUUID(),
        kind: "group",
        name: name.trim(),
        description: description?.trim() || null,
        created_by_uuid: creatorUuid,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    await tx.chat_members.createMany({
      data: [
        { uuid: randomUUID(), chat_uuid: chat.uuid, user_uuid: creatorUuid, role: "owner" },
        ...uniqueMembers.map((uuid) => ({
          uuid: randomUUID(),
          chat_uuid: chat.uuid,
          user_uuid: uuid,
          role: "member" as const,
        })),
      ],
    });

    return chat;
  });
};

// --------------------------------------------
// Канал (публичный или приватный)
// --------------------------------------------
export async function createChannel(params: {
  name: string;
  creatorUuid: string;
  isPrivate: boolean;
  description?: string;
}) {
  const { name, creatorUuid, isPrivate, description } = params;

  if (!name.trim()) throw new Error("Укажите название канала");

  return prisma.$transaction(async (tx) => {
    const chat = await tx.chats.create({
      data: {
        uuid: randomUUID(),
        kind: isPrivate ? "private_channel" : "channel",
        name: name.trim(),
        description: description?.trim() || null,
        created_by_uuid: creatorUuid,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    await tx.chat_members.create({
      data: {
        uuid: randomUUID(),
        chat_uuid: chat.uuid,
        user_uuid: creatorUuid,
        role: "owner",
      },
    });

    return chat;
  });
};

// --------------------------------------------
// Сообщения: чтение с пагинацией
// --------------------------------------------
export async function getMessages(
  chatUuid: string,
  userUuid: string,
  opts: { before?: string; limit?: number } = {},
): Promise<ChatMessageItem[]> {
  await assertChatMember(chatUuid, userUuid);

  const { before, limit = 50 } = opts;

  const rows = await prisma.chat_messages.findMany({
    where: {
      chat_uuid: chatUuid,
      deleted_at: null,
      deletions: { none: { user_uuid: userUuid } },
      ...(before ? { created_at: { lt: new Date(before) } } : {}),
    },
    orderBy: { created_at: "desc" },
    take: limit,
    include: {
      user: {
        select: { uuid: true, full_name: true, username: true, avatar_url: true },
      },
      attachments: {
        include: {
          file: {
            select: { id: true, uuid: true, name: true, url: true, mime: true, size: true },
          },
        },
      },
      reactions: {
        select: { emoji: true, user_uuid: true },
      },
      read_receipts: {
        select: { user_uuid: true, read_at: true },
      },
    },
  });

  return rows.map((m) => ({
    uuid: m.uuid,
    chat_uuid: m.chat_uuid,
    kind: m.kind as MessageKind,
    content: m.content,
    reply_to_uuid: m.reply_to_uuid,
    edited_at: m.edited_at,
    deleted_at: m.deleted_at,
    created_at: m.created_at,
    user: m.user,
    attachments: m.attachments.map((a) => ({
      uuid: a.uuid,
      file: a.file,
    })),
    reactions: m.reactions,
    read_receipts: m.read_receipts,
    forwarded_from_message_uuid: m.forwarded_from_message_uuid,
    forwarded_from_chat_uuid: m.forwarded_from_chat_uuid,
    forwarded_from_user_uuid: m.forwarded_from_user_uuid,
  }));
};

// --------------------------------------------
// Отправить сообщение
// --------------------------------------------
export async function sendMessage(params: {
  chatUuid: string;
  userUuid: string;
  content: string;
  kind?: MessageKind;
  replyToUuid?: string;
  attachmentFileIds?: number[];
}): Promise<ChatMessageItem> {
  const { chatUuid, userUuid, content, kind = "text", replyToUuid, attachmentFileIds } = params;

  if (!content.trim() && !attachmentFileIds?.length) {
    throw new Error("Пустое сообщение");
  }

  return prisma.$transaction(async (tx) => {
    // Проверка членства
    const member = await tx.chat_members.findUnique({
      where: { chat_uuid_user_uuid: { chat_uuid: chatUuid, user_uuid: userUuid } },
    });
    if (!member) throw new Error("Нет доступа к этому чату");

    const now = new Date();

    // Создаём сообщение
    const message = await tx.chat_messages.create({
      data: {
        uuid: randomUUID(),
        chat_uuid: chatUuid,
        user_uuid: userUuid,
        kind,
        content: content.trim(),
        reply_to_uuid: replyToUuid ?? null,
        created_at: now,
        ...(attachmentFileIds?.length
          ? {
              attachments: {
                create: attachmentFileIds.map((fileId) => ({
                  uuid: randomUUID(),
                  file_id: fileId,
                  created_at: now,
                })),
              },
            }
          : {}),
      },
      include: {
        user: {
          select: { uuid: true, full_name: true, username: true, avatar_url: true },
        },
        attachments: {
          include: {
            file: {
              select: { id: true, uuid: true, name: true, url: true, mime: true, size: true },
            },
          },
        },
        reactions: { select: { emoji: true, user_uuid: true } },
        read_receipts: { select: { user_uuid: true, read_at: true } },
      },
    });

    // Обновляем last_message_at в чате
    await tx.chats.update({
      where: { uuid: chatUuid },
      data: { last_message_at: now, updated_at: now },
    });

    // Инкрементим unread_count у всех остальных участников
    await tx.chat_members.updateMany({
      where: { chat_uuid: chatUuid, user_uuid: { not: userUuid } },
      data: { unread_count: { increment: 1 } },
    });

    // У автора unread_count = 0
    await tx.chat_members.update({
      where: { chat_uuid_user_uuid: { chat_uuid: chatUuid, user_uuid: userUuid } },
      data: { last_read_at: now, unread_count: 0 },
    });

    return {
      uuid: message.uuid,
      chat_uuid: message.chat_uuid,
      kind: message.kind as MessageKind,
      content: message.content,
      reply_to_uuid: message.reply_to_uuid,
      edited_at: message.edited_at,
      deleted_at: message.deleted_at,
      created_at: message.created_at,
      user: message.user,
      attachments: message.attachments.map((a) => ({ uuid: a.uuid, file: a.file })),
      reactions: message.reactions,
      read_receipts: message.read_receipts,
      forwarded_from_message_uuid: message.forwarded_from_message_uuid,
      forwarded_from_chat_uuid: message.forwarded_from_chat_uuid,
      forwarded_from_user_uuid: message.forwarded_from_user_uuid,
    };
  });
};

// --------------------------------------------
// Удаление сообщения
// --------------------------------------------
export async function deleteMessageForUser(
  messageUuid: string,
  userUuid: string,
  scope: "self" | "everyone",
) {
  const message = await prisma.chat_messages.findUnique({
    where: { uuid: messageUuid },
    select: { user_uuid: true, chat_uuid: true },
  });
  if (!message) throw new Error("Сообщение не найдено");

  if (scope === "everyone") {
    if (message.user_uuid !== userUuid) {
      throw new Error("Только автор может удалить для всех");
    }

    await prisma.chat_messages.update({
      where: { uuid: messageUuid },
      data: { deleted_at: new Date(), content: "" },
    });

    return { scope: "everyone" as const, chatUuid: message.chat_uuid };
  }

  await prisma.chat_message_deletions.upsert({
    where: {
      message_uuid_user_uuid: {
        message_uuid: messageUuid,
        user_uuid: userUuid,
      },
    },
    create: {
      message_uuid: messageUuid,
      user_uuid: userUuid,
      created_at: new Date(),
    },
    update: {},
  });

  return { scope: "self" as const, chatUuid: message.chat_uuid };
}

// --------------------------------------------
// Форвардинг сообщения
// --------------------------------------------
export async function forwardMessage(params: {
  messageUuid: string;
  targetChatUuids: string[];
  userUuid: string;
}) {
  const { messageUuid, targetChatUuids, userUuid } = params;

  if (targetChatUuids.length === 0) {
    throw new Error("Не выбрано ни одного чата");
  }

  const original = await prisma.chat_messages.findUnique({
    where: { uuid: messageUuid },
    include: { attachments: true },
  });
  if (!original) throw new Error("Сообщение не найдено");

  const created: string[] = [];

  for (const chatUuid of targetChatUuids) {
    const member = await prisma.chat_members.findUnique({
      where: { chat_uuid_user_uuid: { chat_uuid: chatUuid, user_uuid: userUuid } },
    });
    if (!member) continue;

    const now = new Date();

    const msg = await prisma.chat_messages.create({
      data: {
        uuid: randomUUID(),
        chat_uuid: chatUuid,
        user_uuid: userUuid,
        kind: "text",
        content: original.content,
        forwarded_from_message_uuid: original.uuid,
        forwarded_from_chat_uuid: original.chat_uuid,
        forwarded_from_user_uuid: original.user_uuid,
        created_at: now,
        attachments: original.attachments.length
          ? {
              create: original.attachments.map((a) => ({
                uuid: randomUUID(),
                file_id: a.file_id,
                created_at: now,
              })),
            }
          : undefined,
      },
      include: {
        user: {
          select: { uuid: true, full_name: true, username: true, avatar_url: true },
        },
        attachments: {
          include: {
            file: {
              select: { id: true, uuid: true, name: true, url: true, mime: true, size: true },
            },
          },
        },
        reactions: { select: { emoji: true, user_uuid: true } },
        read_receipts: { select: { user_uuid: true, read_at: true } },
      },
    });

    await prisma.chats.update({
      where: { uuid: chatUuid },
      data: { last_message_at: now, updated_at: now },
    });

    await prisma.chat_members.updateMany({
      where: { chat_uuid: chatUuid, user_uuid: { not: userUuid } },
      data: { unread_count: { increment: 1 } },
    });

    created.push(msg.uuid);
  }

  return { forwarded: created.length, messageUuids: created };
}

// --------------------------------------------
// Отметить чат прочитанным
// --------------------------------------------
export async function markChatAsRead(chatUuid: string, userUuid: string) {
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    // 1. Обновляем last_read_at + unread_count
    await tx.chat_members.update({
      where: { chat_uuid_user_uuid: { chat_uuid: chatUuid, user_uuid: userUuid } },
      data: { last_read_at: now, unread_count: 0 },
    });

    // 2. Находим все сообщения, которые пользователь ещё не читал
    //    (не свои, не удалённые, без его read_receipt)
    const unread = await tx.chat_messages.findMany({
      where: {
        chat_uuid: chatUuid,
        user_uuid: { not: userUuid },
        deleted_at: null,
        read_receipts: { none: { user_uuid: userUuid } },
      },
      select: { uuid: true },
    });

    // 3. Создаём read_receipts для каждого
    if (unread.length > 0) {
      await tx.chat_read_receipts.createMany({
        data: unread.map((m) => ({
          message_uuid: m.uuid,
          user_uuid: userUuid,
          read_at: now,
        })),
        skipDuplicates: true,
      });
    }

    return { markedCount: unread.length };
  });
}

// --------------------------------------------
// Участники
// --------------------------------------------
export async function addChatMember(chatUuid: string, userUuid: string, byUuid: string) {
  // Проверка, что добавляющий — админ или owner
  const by = await prisma.chat_members.findUnique({
    where: { chat_uuid_user_uuid: { chat_uuid: chatUuid, user_uuid: byUuid } },
  });
  if (!by || (by.role !== "owner" && by.role !== "admin")) {
    throw new Error("Только owner или admin может добавлять участников");
  }

  return prisma.chat_members.create({
    data: {
      uuid: randomUUID(),
      chat_uuid: chatUuid,
      user_uuid: userUuid,
      role: "member",
      joined_at: new Date(),
    },
  });
}

export async function removeChatMember(chatUuid: string, userUuid: string, byUuid: string) {
  const by = await prisma.chat_members.findUnique({
    where: { chat_uuid_user_uuid: { chat_uuid: chatUuid, user_uuid: byUuid } },
  });
  if (!by || (by.role !== "owner" && by.role !== "admin")) {
    throw new Error("Только owner или admin может удалять участников");
  }

  return prisma.chat_members.delete({
    where: { chat_uuid_user_uuid: { chat_uuid: chatUuid, user_uuid: userUuid } },
  });
};

// --------------------------------------------
// Реакции
// --------------------------------------------
export async function toggleReaction(messageUuid: string, userUuid: string, emoji: string) {
  const existing = await prisma.chat_reactions.findUnique({
    where: {
      message_uuid_user_uuid_emoji: {
        message_uuid: messageUuid,
        user_uuid: userUuid,
        emoji,
      },
    },
  });

  if (existing) {
    await prisma.chat_reactions.delete({ where: { id: existing.id } });
    return { action: "removed" as const };
  }

  await prisma.chat_reactions.create({
    data: {
      message_uuid: messageUuid,
      user_uuid: userUuid,
      emoji,
      created_at: new Date(),
    },
  });
  return { action: "added" as const };
};

// --------------------------------------------
// Поиск пользователей для добавления в чат
// --------------------------------------------
export async function searchUsersForChat(
  query: string,
  excludeUuids: string[] = [],
  limit = 20,
) {
  const q = query.trim();
  if (q.length < 2) return [];

  return prisma.users.findMany({
    where: {
      AND: [
        { blocked: false },
        { is_active: true },
        { uuid: { notIn: excludeUuids } },
        {
          OR: [
            { username: { contains: q } },
            { full_name: { contains: q } },
            { email: { contains: q } },
          ],
        },
      ],
    },
    select: {
      uuid: true,
      username: true,
      full_name: true,
      email: true,
      avatar_url: true,
    },
    take: limit,
    orderBy: { full_name: "asc" },
  });
};

// --------------------------------------------
// Saved Messages — чат с самим собой
// --------------------------------------------
export async function getOrCreateSavedChat(userUuid: string) {
  const directKey = `saved:${userUuid}`;

  const existing = await prisma.chats.findUnique({
    where: { direct_key: directKey },
  });
  if (existing) return existing;

  return prisma.$transaction(async (tx) => {
    const chat = await tx.chats.create({
      data: {
        uuid: randomUUID(),
        kind: "saved",
        direct_key: directKey,
        name: "Saved Messages",
        created_by_uuid: userUuid,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    await tx.chat_members.create({
      data: {
        uuid: randomUUID(),
        chat_uuid: chat.uuid,
        user_uuid: userUuid,
        role: "owner",
      },
    });

    return chat;
  });
}
