'use client';

import { Share2, Bookmark, BookmarkCheck } from 'lucide-react';
import { useState, useSyncExternalStore } from 'react';

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

  const [isBookmarked, setIsBookmarked] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      return Array.isArray(bookmarks) && bookmarks.includes(url);
    } catch {
      return false;
    }
  });

  const handleShare = async () => {
    const shareData = {
      title: title,
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

  const handleBookmark = () => {
    let bookmarks: string[] = [];
    try {
      const raw = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      bookmarks = Array.isArray(raw) ? raw : [];
    } catch {
      bookmarks = [];
    }

    const newBookmarks = isBookmarked
      ? bookmarks.filter((b) => b !== url)
      : [...new Set([...bookmarks, url])];

    try {
      localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
    } catch {
      // ignore
    }

    setIsBookmarked(!isBookmarked);
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleShare}
        className="p-2 text-gray-400 hover:text-[#2dd4bf] transition-colors rounded-lg hover:bg-[rgba(45,212,191,0.06)]"
        aria-label="Поделиться"
        title="Поделиться"
      >
        <Share2 size={18} />
      </button>
      <button
        onClick={handleBookmark}
        className="p-2 text-gray-400 hover:text-[#2dd4bf] transition-colors rounded-lg hover:bg-[rgba(45,212,191,0.06)]"
        aria-label={isBookmarked ? 'Удалить из закладок' : 'Добавить в закладки'}
        title={isBookmarked ? 'Удалить из закладок' : 'Добавить в закладки'}
      >
        {isBookmarked ? (
          <BookmarkCheck size={18} className="text-[#2dd4bf]" />
        ) : (
          <Bookmark size={18} />
        )}
      </button>
    </div>
  );
}
