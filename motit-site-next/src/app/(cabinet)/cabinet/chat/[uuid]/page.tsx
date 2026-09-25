// src/app/(cabinet)/cabinet/chat/[uuid]/page.tsx
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getChatByUuid, getMessages } from "@/lib/db/chat";
import { ChatView } from "@/components/chat/ChatView";

export const dynamic = "force-dynamic";

export default async function CabinetChatPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { uuid } = await params;

  const chat = await getChatByUuid(uuid, user.uuid);
  if (!chat) notFound();

  const messages = await getMessages(uuid, user.uuid, { limit: 50 });

  return (
    <ChatView
      key={chat.uuid}
      chat={{
        uuid: chat.uuid,
        kind: chat.kind,
        name: chat.name,
        members: chat.members.map((m) => ({
          uuid: m.uuid,
          user: m.user,
        })),
      }}
      currentUserUuid={user.uuid}
      initialMessages={[...messages].reverse()}
    />
  );
}
