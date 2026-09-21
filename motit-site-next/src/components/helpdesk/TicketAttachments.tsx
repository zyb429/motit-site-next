// src/components/helpdesk/TicketAttachments.tsx
import { Paperclip } from "lucide-react";

interface FileRecord {
  id: number;
  uuid: string;
  name: string | null;
  url: string;
  mime: string | null;
  size: number | null;
}

interface Attachment {
  uuid: string;
  files: FileRecord | null;
}

interface Props {
  attachments: Attachment[];
  title?: string;
}

export function TicketAttachments({
  attachments,
  title = "Вложения",
}: Props) {
  const list = attachments.filter((a) => a.files);
  if (list.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="text-sm font-medium text-(--text-muted) uppercase tracking-wider mb-3 flex items-center gap-2">
        <Paperclip size={14} />
        {title} ({list.length})
      </h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {list.map((a) => {
          const f = a.files!;
          const isImage = f.mime?.startsWith("image/");
          return (
            <li key={a.uuid}>
              <a
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block p-3 rounded-xl bg-(--bg-card) border border-(--border) hover:border-(--accent)/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={f.url}
                      alt={f.name ?? "Вложение"}
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-(--bg-primary) flex items-center justify-center text-(--accent) shrink-0">
                      <Paperclip size={18} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-sm text-(--text-primary) truncate group-hover:text-(--accent) transition-colors">
                      {f.name ?? "Файл"}
                    </div>
                    <div className="text-xs text-(--text-muted)">
                      {f.size
                        ? `${(Number(f.size) / 1024).toFixed(1)} КБ`
                        : ""}
                      {f.mime ? ` · ${f.mime}` : ""}
                    </div>
                  </div>
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
