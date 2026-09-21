// src/components/account/ProfileForm.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProfileUser {
  id: number;
  username: string | null;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
}

export function ProfileForm({ user }: { user: ProfileUser }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(user.full_name ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [avatar, setAvatar] = useState(user.avatar_url);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: fullName, phone, bio }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error?.toString() ?? "Не удалось сохранить");
      return;
    }

    setMessage("Сохранено");
    router.refresh();
  }

  async function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);

    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/account/avatar", { method: "POST", body: fd });
    setUploading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Не удалось загрузить аватар");
      return;
    }

    const data = await res.json();
    setAvatar(data.data.url);
    router.refresh();
  }

  async function handleAvatarDelete() {
    setUploading(true);
    await fetch("/api/account/avatar", { method: "DELETE" });
    setUploading(false);
    setAvatar(null);
    router.refresh();
  }

  return (
    <div className="mt-8 space-y-8">
      {/* Аватар */}
      <div className="flex items-center gap-6">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt="Аватар"
            className="w-20 h-20 rounded-full object-cover border border-[rgba(45,212,191,0.15)]"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-[#2dd4bf]/10 flex items-center justify-center text-[#2dd4bf] text-2xl font-bold">
            {(user.username ?? "?").charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex flex-col gap-2">
          <label className="px-4 py-2 rounded-lg border border-[rgba(45,212,191,0.15)] text-[#2dd4bf] text-sm cursor-pointer hover:bg-[#2dd4bf]/5">
            {uploading ? "Загрузка…" : "Загрузить аватар"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatar}
              disabled={uploading}
            />
          </label>
          {avatar && (
            <button
              onClick={handleAvatarDelete}
              disabled={uploading}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Удалить
            </button>
          )}
        </div>
      </div>

      {/* Поля профиля */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Логин">
          <input
            value={user.username ?? ""}
            disabled
            className="w-full px-3 py-2 rounded-lg bg-[#0a1920] border border-[rgba(45,212,191,0.08)] text-gray-500"
          />
        </Field>

        <Field label="Email">
          <input
            value={user.email ?? ""}
            disabled
            className="w-full px-3 py-2 rounded-lg bg-[#0a1920] border border-[rgba(45,212,191,0.08)] text-gray-500"
          />
        </Field>

        <Field label="Имя">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#0a1920] border border-[rgba(45,212,191,0.15)] text-[#e0f7fa] focus:border-[#2dd4bf] outline-none"
          />
        </Field>

        <Field label="Телефон">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#0a1920] border border-[rgba(45,212,191,0.15)] text-[#e0f7fa] focus:border-[#2dd4bf] outline-none"
          />
        </Field>

        <Field label="О себе">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 rounded-lg bg-[#0a1920] border border-[rgba(45,212,191,0.15)] text-[#e0f7fa] focus:border-[#2dd4bf] outline-none resize-y"
          />
        </Field>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        {message && <p className="text-[#2dd4bf] text-sm">{message}</p>}

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 rounded-lg bg-[#2dd4bf] text-[#0a1920] text-sm font-medium hover:bg-[#14b8a6] transition-colors disabled:opacity-50"
        >
          {saving ? "Сохранение…" : "Сохранить"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
