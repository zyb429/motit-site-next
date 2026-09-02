'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface BlogPostProps {
  initialPost?: any;
}

type HeadingLevel = 'h2' | 'h3' | 'h4';

const headingClasses: Record<HeadingLevel, string> = {
  h2: 'text-2xl md:text-3xl font-bold text-[#e0f7fa] mt-8 mb-4',
  h3: 'text-xl md:text-2xl font-bold text-[#e0f7fa] mt-6 mb-3',
  h4: 'text-lg md:text-xl font-bold text-[#e0f7fa] mt-4 mb-2',
};

export function BlogPost({ initialPost }: BlogPostProps) {
  const post = initialPost;
  if (!post) return null;

  // ✅ Нормализация данных для Strapi v5
  const attrs = post.attributes || post;
  const contentBlocks = attrs.content_blocks || [];

  // Функция для безопасного получения URL изображения
  const getSafeUrl = (input: any): string | null => {
    if (!input) return null;
    if (typeof input === 'string') {
      return input.startsWith('/uploads') 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}${input}`
        : input;
    }
    if (typeof input === 'object' && input.url) {
      return input.url.startsWith('/uploads') 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}${input.url}`
        : input.url;
    }
    return null;
  };

  if (contentBlocks.length === 0 && attrs.content) {
    return (
      <div 
        className="prose prose-invert max-w-none prose-headings:text-[#e0f7fa] prose-headings:font-bold prose-a:text-[#2dd4bf] prose-a:hover:text-[#14b8a6] prose-p:text-gray-300 prose-strong:text-[#e0f7fa] prose-li:text-gray-300 prose-blockquote:text-gray-400 prose-blockquote:border-[#2dd4bf]"
        dangerouslySetInnerHTML={{ __html: attrs.content }}
      />
    );
  }

  return (
    <div className="space-y-8 max-w-none">
      {contentBlocks.map((block: any, index: number) => {
        const component = block.__component || '';

        switch (component) {
          case 'blog.heading': {
            const level = block.heading_level || 'h2';
            const HeadingTag = level;
            const className = headingClasses[level as HeadingLevel] || headingClasses.h2;
            return (
              <HeadingTag key={index} className={className}>
                {block.text}
              </HeadingTag>
            );
          }

          case 'blog.text':
            return (
              <div key={index} className="prose prose-invert max-w-none prose-p:text-gray-300 prose-strong:text-[#e0f7fa] prose-a:text-[#2dd4bf] prose-a:hover:text-[#14b8a6]">
                <ReactMarkdown>{block.text}</ReactMarkdown>
              </div>
            );

          case 'blog.image': {
            const imageUrl = getSafeUrl(block.image);
            if (!imageUrl) return null;
            return (
              <figure key={index} className="my-6">
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#0a1920]">
                  <img
                    src={imageUrl}
                    alt={block.caption || 'Изображение'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                {block.caption && (
                  <figcaption className="text-sm text-gray-500 mt-2 text-center">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );
          }

          case 'blog.quote':
            return (
              <blockquote key={index} className="border-l-4 border-[#2dd4bf] pl-5 py-2 my-6 bg-[#0d2029]/50 rounded-r-xl pr-4">
                <p className="text-lg italic text-gray-300 leading-relaxed">
                  {block.quote_text}
                </p>
                {block.quote_author && (
                  <footer className="text-sm text-gray-500 mt-2">
                    — {block.quote_author}
                  </footer>
                )}
              </blockquote>
            );

          case 'blog.code':
            return (
              <div key={index} className="my-6 rounded-xl overflow-hidden">
                <SyntaxHighlighter
                  language={block.code_language || 'javascript'}
                  style={vscDarkPlus}
                  className="rounded-xl"
                  showLineNumbers
                >
                  {block.code_content || ''}
                </SyntaxHighlighter>
              </div>
            );

          case 'blog.button':
            if (!block.button_url) return null;
            return (
              <div key={index} className="my-6">
                <a
                  href={block.button_url}
                  className="inline-flex items-center gap-2 bg-[#2dd4bf] text-[#0a1920] px-6 py-3 rounded-xl font-medium hover:bg-[#14b8a6] transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {block.button_text || 'Подробнее'}
                </a>
              </div>
            );

          case 'blog.video':
            if (!block.video_url) return null;
            return (
              <div key={index} className="aspect-video my-6 rounded-xl overflow-hidden">
                <iframe
                  src={block.video_url}
                  className="w-full h-full"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            );

          case 'blog.gallery': {
            const images = block.gallery_images?.data || [];
            if (!images.length) return null;
            return (
              <div key={index} className="grid grid-cols-2 md:grid-cols-3 gap-4 my-6">
                {images.map((img: any, i: number) => {
                  const url = img?.attributes?.url || '';
                  if (!url) return null;
                  const fullUrl = url.startsWith('/uploads') 
                    ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}${url}`
                    : url;
                  return (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-[#0a1920]">
                      <img
                        src={fullUrl}
                        alt={img?.attributes?.alternativeText || `Изображение ${i + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  );
                })}
              </div>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
}