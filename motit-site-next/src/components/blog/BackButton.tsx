"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton({ fallback = "/blog" }: { fallback?: string }) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#2dd4bf] transition-colors mb-6"
    >
      <ArrowLeft size={16} />
      Назад
    </button>
  );
}