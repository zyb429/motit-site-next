"use client";

import { useRouter } from "next/navigation";
import { User } from "lucide-react";

interface AuthorLinkProps {
  username: string;
  name: string;
  avatarUrl?: string | null;
  className?: string;
}

export function AuthorLink({
  username,
  name,
  avatarUrl,
  className,
}: AuthorLinkProps) {
  const router = useRouter();

    const go = (e: React.MouseEvent | React.KeyboardEvent) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`/authors/${username}`);
    };

  return (
    <span
      role="link"
      tabIndex={0}
      onClick={go}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") go(e);
      }}
      className={`cursor-pointer inline-flex items-center gap-1.5 hover:text-[#2dd4bf] transition-colors ${className ?? ""}`}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className="w-4 h-4 rounded-full object-cover"
        />
      ) : (
        <User size={12} />
      )}
      {name}
    </span>
  );
}