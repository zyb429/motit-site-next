"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bell, BellRing, CheckCheck, MessageCircle, X } from "lucide-react";

type Announcement = {
  id: number;
  title: string;
  message: string;
  audience: string;
  created_at: string;
  created_by?: {
    username?: string | null;
    full_name?: string | null;
  } | null;
};

type ChatMessage = {
  id: string;
  content: string;
  created_at: string;
  chat: {
    uuid: string;
    name: string | null;
    kind: string;
  };
  user?: {
    uuid: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

const READ_KEY = "motit:readAnnouncementIds";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [readIds, setReadIds] = useState<number[]>([]);
  const [position, setPosition] = useState({ left: 16, top: 72 });
  const [mounted, setMounted] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const notifiedIdsRef = useRef<Set<string>>(new Set());
  const previousMessageIdsRef = useRef<Set<string>>(new Set());
  const isFirstMessagesLoadRef = useRef(true);
  const soundQueueRef = useRef<number[]>([]);
  const isPlayingSoundRef = useRef(false);
  const lastPayloadRef = useRef<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const playNotificationSound = useCallback(() => {
    if (isPlayingSoundRef.current) {
      soundQueueRef.current.push(Date.now());
      return;
    }

    isPlayingSoundRef.current = true;

    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;

      if (!AudioContextClass) {
        isPlayingSoundRef.current = false;
        return;
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
      }

      const context = audioContextRef.current;

      if (context.state === "suspended") {
        void context.resume();
      }

      const now = context.currentTime;

      const playTone = (startTime: number, frequency: number) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, startTime);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.16, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.28);

        oscillator.connect(gain);
        gain.connect(context.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.3);
      };

      playTone(now, 880);
      playTone(now + 0.16, 1174.66);
    } catch {
      // Звук не критичен
    } finally {
      window.setTimeout(() => {
        isPlayingSoundRef.current = false;

        if (soundQueueRef.current.length > 0) {
          soundQueueRef.current = [];
          playNotificationSound();
        }
      }, 450);
    }
  }, []);

  const notifyNewItems = useCallback(
    (keys: string[]) => {
      const freshKeys = keys.filter((key) => {
        if (notifiedIdsRef.current.has(key)) {
          return false;
        }

        notifiedIdsRef.current.add(key);
        return true;
      });

      if (freshKeys.length === 0) {
        return;
      }

      freshKeys.forEach((_, index) => {
        window.setTimeout(() => {
          playNotificationSound();
        }, index * 500);
      });
    },
    [playNotificationSound],
  );

  const loadReadIds = useCallback(() => {
    try {
      const raw = localStorage.getItem(READ_KEY);
      const parsed = raw ? JSON.parse(raw) : [];

      setReadIds(Array.isArray(parsed) ? parsed : []);
    } catch {
      setReadIds([]);
    }
  }, []);

  useEffect(() => {
    loadReadIds();
  }, [loadReadIds]);

  useEffect(() => {
    let source: EventSource | null = null;
    let reconnectTimeout: number | undefined;

    const connect = () => {
      source = new EventSource("/api/notifications/stream");

      source.addEventListener("notifications", (event) => {
        try {
          const data = JSON.parse(event.data) as {
            announcements: Announcement[];
            messages: ChatMessage[];
            newAnnouncements: Announcement[];
            newMessages: ChatMessage[];
          };

          const incomingMessages = data.messages ?? [];

          const incomingMessageIds = new Set(
            incomingMessages.map((message) => String(message.id)),
          );

          let newMessageKeys: string[] = [];

          if (!isFirstMessagesLoadRef.current) {
            newMessageKeys = incomingMessages
              .filter((message) => {
                const id = String(message.id);

                return (
                  !previousMessageIdsRef.current.has(id) &&
                  !notifiedIdsRef.current.has(`message:${id}`)
                );
              })
              .map((message) => `message:${String(message.id)}`);
          }

          previousMessageIdsRef.current = incomingMessageIds;
          isFirstMessagesLoadRef.current = false;

          const announcementsPayload = JSON.stringify(data.announcements ?? []);
          const messagesPayload = JSON.stringify(incomingMessages);
          const nextPayload = `${announcementsPayload}|${messagesPayload}`;

          if (lastPayloadRef.current !== nextPayload) {
            lastPayloadRef.current = nextPayload;

            setAnnouncements(data.announcements ?? []);
            setMessages(incomingMessages);
          }

          const announcementKeys = (data.newAnnouncements ?? []).map(
            (item) => `announcement:${item.id}`,
          );

          notifyNewItems([...announcementKeys, ...newMessageKeys]);
        } catch {
          // Игнорируем некорректный payload
        }
      });

      source.onerror = () => {
        source?.close();

        reconnectTimeout = window.setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      source?.close();

      if (reconnectTimeout) {
        window.clearTimeout(reconnectTimeout);
      }
    };
  }, [notifyNewItems]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current?.contains(event.target as Node) ||
        panelRef.current?.contains(event.target as Node)
      ) {
        return;
      }

      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !buttonRef.current) return;

    const updatePosition = () => {
      const rect = buttonRef.current?.getBoundingClientRect();

      if (!rect) return;

      const panelWidth = 380;
      const margin = 12;

      let left = rect.right + 10;

      if (left + panelWidth > window.innerWidth - margin) {
        left = Math.max(margin, window.innerWidth - panelWidth - margin);
      }

      const top = Math.min(
        rect.bottom + 10,
        Math.max(margin, window.innerHeight - 160),
      );

      setPosition({ left, top });
    };

    updatePosition();

    const resizeObserver = new ResizeObserver(updatePosition);

    if (panelRef.current) {
      resizeObserver.observe(panelRef.current);
    }

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  const unreadAnnouncements = useMemo(
    () => announcements.filter((item) => !readIds.includes(item.id)),
    [announcements, readIds],
  );

  const unreadCount = unreadAnnouncements.length + messages.length;

  const saveReadIds = (next: number[]) => {
    setReadIds(next);

    try {
      localStorage.setItem(READ_KEY, JSON.stringify(next));
    } catch {
      // localStorage может быть недоступен
    }
  };

  const markAllRead = () => {
    saveReadIds(
      Array.from(
        new Set([...readIds, ...announcements.map((item) => item.id)]),
      ),
    );
  };

  const markRead = (id: number) => {
    if (readIds.includes(id)) return;

    saveReadIds([...readIds, id]);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Оповещения"
        title="Оповещения"
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-(--text-muted) transition-colors hover:bg-(--accent-dim) hover:text-(--accent)"
      >
        {unreadCount > 0 ? <BellRing size={18} /> : <Bell size={18} />}

        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open &&
        mounted &&
        createPortal(
          <div
            ref={panelRef}
            style={{
              left: `${position.left}px`,
              top: `${position.top}px`,
              width: "380px",
            }}
            className="fixed z-[9999] max-h-[min(70vh,560px)] overflow-hidden rounded-xl border border-(--border) bg-(--bg-card) shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-(--border) px-4 py-3">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-(--accent)" />
                <span className="text-sm font-semibold text-(--text-primary)">
                  Оповещения
                </span>

                {unreadCount > 0 && (
                  <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-medium text-red-500">
                    {unreadCount} новых
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {unreadAnnouncements.length > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-(--text-secondary) hover:bg-(--accent-dim) hover:text-(--accent)"
                  >
                    <CheckCheck size={14} />
                    Прочитать всё
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Закрыть"
                  className="rounded-md p-1 text-(--text-muted) hover:bg-(--accent-dim) hover:text-(--accent)"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="max-h-[calc(min(70vh,560px)-56px)] overflow-y-auto">
              {announcements.length === 0 && messages.length === 0 && (
                <div className="px-4 py-10 text-center">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-(--accent-dim)">
                    <Bell size={18} className="text-(--accent)" />
                  </div>

                  <p className="text-sm font-medium text-(--text-primary)">
                    Оповещений пока нет
                  </p>

                  <p className="mt-1 text-xs text-(--text-muted)">
                    Новые объявления и сообщения появятся здесь автоматически.
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className="border-b border-(--border) bg-blue-500/5 px-4 py-3 transition-colors last:border-b-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />

                        <h3 className="truncate text-sm font-semibold text-(--text-primary)">
                          {message.user?.full_name ||
                            message.user?.username ||
                            "Новое сообщение"}
                        </h3>
                      </div>

                      <p className="mt-1 line-clamp-3 text-sm text-(--text-secondary)">
                        {message.content}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-(--text-muted)">
                        <span>
                          {new Date(message.created_at).toLocaleString(
                            "ru-RU",
                            {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>

                        <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-blue-500">
                          {message.chat.kind === "direct"
                            ? "Личное сообщение"
                            : message.chat.name || "Чат"}
                        </span>
                      </div>
                    </div>

                    <a
                      href="/cabinet/chat"
                      className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs text-(--text-secondary) hover:bg-(--accent-dim) hover:text-(--accent)"
                    >
                      <MessageCircle size={14} />
                      Открыть
                    </a>
                  </div>
                </div>
              ))}

              {announcements.map((item) => {
                const isUnread = !readIds.includes(item.id);
                const createdAt = new Date(item.created_at);

                return (
                  <div
                    key={item.id}
                    className={`border-b border-(--border) px-4 py-3 transition-colors last:border-b-0 ${
                      isUnread ? "bg-(--accent-dim)/50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {isUnread && (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-(--accent)" />
                          )}

                          <h3 className="truncate text-sm font-semibold text-(--text-primary)">
                            {item.title}
                          </h3>
                        </div>

                        <p className="mt-1 line-clamp-3 text-sm text-(--text-secondary)">
                          {item.message}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-(--text-muted)">
                          <span>
                            {createdAt.toLocaleString("ru-RU", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>

                          <span className="rounded-full bg-(--accent-dim) px-2 py-0.5 text-(--accent)">
                            {item.audience === "all"
                              ? "Для всех"
                              : item.audience === "admin"
                                ? "Админам"
                                : item.audience === "worker"
                                  ? "Сотрудникам"
                                  : item.audience === "client"
                                    ? "Клиентам"
                                    : "Статистика"}
                          </span>
                        </div>
                      </div>

                      {isUnread && (
                        <button
                          type="button"
                          onClick={() => markRead(item.id)}
                          title="Отметить прочитанным"
                          className="shrink-0 rounded-md p-1.5 text-(--text-muted) hover:bg-(--accent-dim) hover:text-(--accent)"
                        >
                          <CheckCheck size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-(--border) px-4 py-2 text-center text-[11px] text-(--text-muted)">
              Обновляется в реальном времени
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
