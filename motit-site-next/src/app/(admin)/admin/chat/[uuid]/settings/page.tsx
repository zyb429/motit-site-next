// src/app/(admin)/admin/chat/[uuid]/settings/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getChatByUuid } from "@/lib/db/chat";
import { ChatSettingsForm } from "@/components/chat/ChatSettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminChatSettingsPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { uuid } = await params;

  const chat = await getChatByUuid(uuid, user.uuid);
  if (!chat) notFound();

  const isDirect = chat.kind === "direct";
  const isSaved = chat.kind === "saved";
  const canEdit =
    (chat.role === "owner" || chat.role === "admin") && !isDirect && !isSaved;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <Link
        href={`/admin/chat/${chat.uuid}`}
        className="inline-flex items-center gap-1 text-sm text-(--text-muted) hover:text-(--accent) transition-colors"
      >
        <ArrowLeft size={14} />
        К чату
      </Link>

      <h1 className="text-xl font-bold text-(--text-primary) mt-6">
        Настройки чата
      </h1>
      <p className="text-sm text-(--text-secondary) mt-1">
        {isDirect
          ? "Управление личным чатом"
          : isSaved
            ? "Избранное — только вы"
            : "Управление групповым чатом"}
      </p>

      <div className="mt-8">
        <ChatSettingsForm
          chat={{
            uuid: chat.uuid,
            kind: chat.kind,
            name: chat.name,
            description: chat.description,
            avatar_url: chat.avatar_url,
          }}
          canEdit={canEdit}
          canDelete={chat.role === "owner" && !isDirect && !isSaved}
          isMuted={chat.is_muted}
          isPinned={chat.is_pinned}
          isDirect={isDirect}
          isSaved={isSaved}
          basePath="/admin/chat"
          myRole={chat.role}
          members={chat.members.map((m) => ({
            uuid: m.uuid,
            user: m.user,
            role: m.role,
          }))}
          currentUserUuid={user.uuid}
        />
      </div>
    </div>
  );
}
