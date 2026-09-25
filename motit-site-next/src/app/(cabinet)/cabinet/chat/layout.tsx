// src/app/(cabinet)/cabinet/chat/layout.tsx
import { getCurrentUser } from "@/lib/auth";
import { listChatsForUser } from "@/lib/db/chat";
import { ChatListSidebar } from "@/components/chat/ChatListSidebar";

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
    <div className="h-[calc(100vh-64px)] flex">
      <aside className="w-80 border-r border-(--border) shrink-0 overflow-hidden">
        <ChatListSidebar
          initialChats={chats}
          currentUserUuid={user.uuid}
          basePath="/cabinet/chat"
        />
      </aside>
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
