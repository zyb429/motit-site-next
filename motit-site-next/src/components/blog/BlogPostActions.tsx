// src/components/blog/BlogPostActions.tsx
'use client';

import { Share2 } from 'lucide-react';
import { useSyncExternalStore } from 'react';

interface BlogPostActionsProps {
  title: string;
  excerpt?: string;
  url: string;
}

const emptySubscribe = () => () => {};

function getOrigin() {
  return window.location.origin;
}

function getServerOrigin() {
  return '';
}

export function BlogPostActions({ title, excerpt, url }: BlogPostActionsProps) {
  const origin = useSyncExternalStore(emptySubscribe, getOrigin, getServerOrigin);
  const currentUrl = origin ? `${origin}${url}` : url;

  const handleShare = async () => {
    const shareData = {
      title,
      text: excerpt || '',
      url: currentUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(currentUrl);
        alert('Ссылка скопирована в буфер обмена!');
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Ошибка при попытке поделиться:', error);
      }
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleShare}
        className="p-2 text-(--text-muted) hover:text-(--accent) transition-colors rounded-lg hover:bg-(--accent-dim)"
        aria-label="Поделиться"
        title="Поделиться"
      >
        <Share2 size={18} />
      </button>
    </div>
  );
}