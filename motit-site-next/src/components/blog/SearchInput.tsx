'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  defaultValue?: string;
  className?: string;
}

export function SearchInput({ defaultValue = '', className = '' }: SearchInputProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get('search') as string;
    
    const params = new URLSearchParams(window.location.search);
    
    // ✅ Сохраняем все существующие параметры
    params.delete('search');
    if (search.trim()) {
      params.set('search', search.trim());
    }
    params.delete('page');
    
    const queryString = params.toString();
    router.push(`/blog${queryString ? `?${queryString}` : ''}`);
  };

  const handleClear = () => {
    setValue('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    const params = new URLSearchParams(window.location.search);
    params.delete('search');
    params.delete('page');
    
    const queryString = params.toString();
    router.push(`/blog${queryString ? `?${queryString}` : ''}`);
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
        className="w-full px-4 py-2 pl-9 pr-10 rounded-lg bg-[#0d2029] border border-[rgba(45,212,191,0.08)] text-[#e0f7fa] placeholder:text-gray-500 text-sm focus:border-[#2dd4bf] focus:outline-none transition-colors"
      />
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
      
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#e0f7fa] transition-colors"
          aria-label="Очистить поиск"
        >
          <X size={16} />
        </button>
      )}
      
      <button type="submit" className="sr-only">Поиск</button>
    </form>
  );
}