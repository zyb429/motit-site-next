import { draftMode } from "next/headers";
import Link from "next/link";

export default async function DraftModeIndicator() {
  const { isEnabled } = await draftMode();
  
  if (!isEnabled) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-yellow-500 text-black p-3 z-50 flex justify-between items-center shadow-lg">
      <div className="flex items-center gap-3">
        <span className="text-xl">🔧</span>
        <div>
          <span className="font-semibold">Режим превью</span>
          <span className="ml-2 text-sm opacity-75">Вы видите черновики</span>
        </div>
      </div>
      <Link 
        href="/api/disable-draft" 
        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors text-sm font-medium"
      >
        Выйти из режима
      </Link>
    </div>
  );
}