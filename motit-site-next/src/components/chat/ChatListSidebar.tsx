// src/components/chat/ChatListSidebar.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChatList } from "./ChatList";
import { NewChatDialog } from "./NewChatDialog";
import type { ChatListItem } from "@/lib/db/chat";

export function ChatListSidebar({
  initialChats,
  currentUserUuid,
  basePath,
}: {
  initialChats: ChatListItem[];
  currentUserUuid: string;
  basePath: string;
}) {
  const router = useRouter();
  const [chats, setChats] = useState(initialChats);
  const [showNewDialog, setShowNewDialog] = useState(false);

  async function refreshChats() {
    const res = await fetch("/api/chat/chats");
    if (res.ok) {
      const data = await res.json();
      setChats(data.data ?? []);
    }
  }

  function handleCreated(chatUuid: string) {
    setShowNewDialog(false);
    refreshChats();
    router.push(`${basePath}/${chatUuid}`);
  }

  async function openSaved() {
   const res = await fetch("/api/chat/chats/saved", { method: "POST" });
    if (res.ok) {
     const data = await res.json();
      router.push(`${basePath}/${data.data.uuid}`);
      refreshChats();
    }
  }

  return (
    <>
      <ChatList
        chats={chats}
        currentUserUuid={currentUserUuid}
        basePath={basePath}
        onNewChatAction={() => setShowNewDialog(true)}
        onSavedAction={openSaved}
      />

      {showNewDialog && (
        <NewChatDialog
          currentUserUuid={currentUserUuid}
          onCloseAction={() => setShowNewDialog(false)}
          onCreatedAction={handleCreated}
        />
      )}
    </>
  );
}
