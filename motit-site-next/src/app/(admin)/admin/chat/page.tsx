// src/app/(admin)/admin/chat/page.tsx
import { MessageSquare } from "lucide-react";

export default function ChatIndexPage() {
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
          Или создайте новый — личный или групповой
        </p>
      </div>
    </div>
  );
}
