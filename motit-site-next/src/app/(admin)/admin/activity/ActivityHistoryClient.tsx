"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ActivityItem = {
  uuid: string;
  action: string;
  target_type: string;
  target_id: string | number | null;
  created_at: string;
  meta: unknown;
  actor?: {
    full_name?: string | null;
    username?: string | null;
  } | null;
};

export function ActivityHistoryClient() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [targetType, setTargetType] = useState("");
  const [action, setAction] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);

      const params = new URLSearchParams({
        page: String(page),
        pageSize: "20",
      });

      if (targetType) params.set("targetType", targetType);
      if (action) params.set("action", action);

      const response = await fetch(`/api/activity?${params.toString()}`);
      const result = await response.json();

      setItems(result.data ?? []);
      setTotalPages(result.meta?.totalPages ?? 1);
      setIsLoading(false);
    };

    load();
  }, [page, targetType, action]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">История активности</h1>

      <div className="flex gap-3 mb-4">
        <select
          value={targetType}
          onChange={(event) => {
            setTargetType(event.target.value);
            setPage(1);
          }}
          className="border rounded-md px-3 py-2"
        >
          <option value="">Все объекты</option>
          <option value="ticket">Заявки</option>
          <option value="post">Посты</option>
          <option value="announcement">Оповещения</option>
        </select>

        <select
          value={action}
          onChange={(event) => {
            setAction(event.target.value);
            setPage(1);
          }}
          className="border rounded-md px-3 py-2"
        >
          <option value="">Все действия</option>
          <option value="create">Создание</option>
          <option value="update">Обновление</option>
          <option value="delete">Удаление</option>
          <option value="status_change">Смена статуса</option>
          <option value="assign">Назначение</option>
          <option value="comment">Комментарий</option>
        </select>
      </div>

      {isLoading ? (
        <p>Загрузка…</p>
      ) : (
        <ul className="divide-y">
          {items.map((item) => (
            <li key={item.uuid} className="py-3">
              <p className="text-sm">
                <span className="font-medium">
                  {item.actor?.full_name || item.actor?.username || "Система"}
                </span>{" "}
                {item.action} {item.target_type}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(item.created_at).toLocaleString("ru-RU")}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-3 mt-4">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((value) => value - 1)}
          className="border rounded-md px-3 py-1 disabled:opacity-50"
        >
          Назад
        </button>

        <span className="text-sm">
          Страница {page} из {totalPages}
        </span>

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => setPage((value) => value + 1)}
          className="border rounded-md px-3 py-1 disabled:opacity-50"
        >
          Вперёд
        </button>
      </div>

      <Link href="/admin" className="inline-block mt-6 underline">
        Вернуться в админ-панель
      </Link>
    </div>
  );
}
