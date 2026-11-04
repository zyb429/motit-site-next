// src/components/blog/SearchInput.tsx
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  defaultValue?: string;
  className?: string;
}

export function SearchInput({
  defaultValue = "",
  className = "",
}: SearchInputProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (
    e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get("search") as string;

    const params = new URLSearchParams(window.location.search);

    params.delete("search");
    if (search.trim()) {
      params.set("search", search.trim());
    }
    params.delete("page");

    const queryString = params.toString();
    router.push(`/blog${queryString ? `?${queryString}` : ""}`);
  };

  const handleClear = () => {
    setValue("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        name="search"
        placeholder="Поиск по блогу..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full px-4 py-2 pl-9 pr-10 rounded-lg bg-(--bg-card) border border-(--border) text-(--text-primary) placeholder:text-(--text-muted) text-sm focus:border-(--accent) focus:outline-none transition-colors"
      />
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none"
      />

      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-muted) hover:text-(--text-primary) transition-colors"
          aria-label="Очистить поиск"
        >
          <X size={16} />
        </button>
      )}

      <button type="submit" className="sr-only">
        Поиск
      </button>
    </form>
  );
}