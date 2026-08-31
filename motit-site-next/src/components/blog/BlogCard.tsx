'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Calendar, User } from 'lucide-react';

interface BlogCardProps {
  post: any;
  className?: string;
}

export function BlogCard({ post, className = '' }: BlogCardProps) {
  const attrs = post || {};
  
  const isDraft = attrs.post_status === 'draft';
  const title = attrs.title || 'Без названия';
  const slug = attrs.slug || '';
  const excerpt = attrs.excerpt || '';
  const publishedAt = attrs.publishedAt || null;
  const category = attrs.category?.data?.attributes;
  const author = attrs.admin_user?.data?.attributes;

  // ✅ Просто берем url из объекта
  let imageUrl = null;
  if (attrs.featured_image) {
    if (typeof attrs.featured_image === 'string') {
      imageUrl = attrs.featured_image;
    } else if (attrs.featured_image.url) {
      const url = attrs.featured_image.url;
      imageUrl = url.startsWith('/uploads') 
        ? `http://localhost:1337${url}`
        : url;
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (!slug) return null;

  return (
    <Link
      href={`/blog/${slug}`}
      className={`group block bg-[#0f2832] rounded-2xl overflow-hidden border border-[rgba(45,212,191,0.08)] hover:border-[#2dd4bf]/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${className}`}
    >
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#0a1920]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl opacity-20">📄</span>
          </div>
        )}
        {isDraft && (
          <span className="absolute top-3 right-3 bg-yellow-500 text-black text-xs font-medium px-3 py-1 rounded-full">
            Черновик
          </span>
        )}
        {category && (
          <span className="absolute bottom-3 left-3 bg-[#2dd4bf]/20 backdrop-blur-sm text-[#2dd4bf] text-xs font-medium px-3 py-1 rounded-full">
            {category.name}
          </span>
        )}
      </div>

      <div className="p-5 space-y-3">
        <h2 className="text-lg font-bold text-[#e0f7fa] line-clamp-2 group-hover:text-[#2dd4bf] transition-colors">
          {title}
        </h2>

        {excerpt && (
          <p className="text-sm text-gray-400 line-clamp-2">
            {excerpt}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-[rgba(45,212,191,0.05)]">
          <div className="flex items-center gap-3">
            {author && (
              <span className="flex items-center gap-1">
                <User size={12} className="text-[#2dd4bf]" />
                {author.firstname || author.username}
              </span>
            )}
          </div>
          {publishedAt && (
            <span className="flex items-center gap-1">
              <Calendar size={12} className="text-[#2dd4bf]" />
              {formatDate(publishedAt)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}