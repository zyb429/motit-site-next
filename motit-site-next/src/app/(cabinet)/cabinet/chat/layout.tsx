// src/app/(cabinet)/cabinet/chat/layout.tsx
import { getCurrentUser } from "@/lib/auth";
import { listChatsForUser } from "@/lib/db/chat";
import { ChatListSidebar } from "@/components/chat/ChatListSidebar";
import { ChatLayoutShell } from "@/components/chat/ChatLayoutShell";

export const dynamic = "force-dynamic";

export default async function CabinetChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const chats = await listChatsForUser(user.uuid);

  return (
    <ChatLayoutShell
      basePath="/cabinet/chat"
      sidebar={
        <ChatListSidebar
          key={user.uuid}
          initialChats={chats}
          currentUserUuid={user.uuid}
          basePath="/cabinet/chat"
        />
      }
    >
      {children}
    </ChatLayoutShell>
  );
}
