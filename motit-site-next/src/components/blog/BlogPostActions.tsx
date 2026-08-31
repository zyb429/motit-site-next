'use client';

import { Share2, Bookmark, BookmarkCheck } from 'lucide-react';
import { useState, useEffect } from 'react';

interface BlogPostActionsProps {
  title: string;
  excerpt?: string;
  url: string;
}

export function BlogPostActions({ title, excerpt, url }: BlogPostActionsProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    // Устанавливаем полный URL только на клиенте
    setCurrentUrl(window.location.origin + url);
    
    // Проверяем, есть ли пост в закладках
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    setIsBookmarked(bookmarks.includes(url));
  }, [url]);

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
        // Фолбэк: копируем ссылку в буфер обмена
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
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    let newBookmarks;
    
    if (isBookmarked) {
      newBookmarks = bookmarks.filter((b: string) => b !== url);
    } else {
      newBookmarks = [...bookmarks, url];
    }
    
    localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
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