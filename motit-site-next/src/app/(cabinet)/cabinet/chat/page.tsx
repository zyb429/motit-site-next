// src/app/(cabinet)/cabinet/chat/page.tsx
import { MessageSquare } from "lucide-react";

export default function CabinetChatIndexPage() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center max-w-sm">
        <MessageSquare
          size={48}
          className="mx-auto text-(--text-muted) mb-4"
        />
        <h2 className="text-lg font-medium text-(--text-primary) mb-1">
          Выберите чат
        </h2>
        <p className="text-sm text-(--text-muted)">
          Или начните новый диалог с сотрудником
        </p>
      </div>
    </div>
  );
}
