'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ContentBlocksProps {
  blocks: any[];
}

export default function ContentBlocks({ blocks }: ContentBlocksProps) {
  if (!blocks?.length) return null;

  const getImageUrl = (block: any) => {
    const url = block?.image?.url || 
                block?.image?.data?.attributes?.url || 
                block?.image?.attributes?.url ||
                block?.url ||
                '';
    if (!url) return null;
    if (typeof url !== 'string') return null;
    if (url.startsWith('/uploads')) {
      return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}${url}`;
    }
    return url;
  };

  return (
    <div className="space-y-6 max-w-none">
      {blocks.map((block, index) => {
        const component = block?.__component || '';

        switch (component) {
          case 'blog.heading': {
            const HeadingTag = block?.heading_level || 'h2';
            const className = {
              h2: 'text-2xl md:text-3xl font-bold text-[#e0f7fa] mt-8 mb-4',
              h3: 'text-xl md:text-2xl font-bold text-[#e0f7fa] mt-6 mb-3',
              h4: 'text-lg md:text-xl font-bold text-[#e0f7fa] mt-4 mb-2',
            }[block?.heading_level || 'h2'] || 'text-2xl md:text-3xl font-bold text-[#e0f7fa] mt-8 mb-4';
            
            return (
              <HeadingTag key={index} className={className}>
                {block?.text || ''}
              </HeadingTag>
            );
          }

          case 'blog.text':
            return (
              <div key={index} className="prose prose-invert max-w-none prose-p:text-gray-300 prose-strong:text-[#e0f7fa] prose-a:text-[#2dd4bf] prose-a:hover:text-[#14b8a6]">
                <ReactMarkdown>{block?.text || ''}</ReactMarkdown>
              </div>
            );

          case 'blog.image': {
            const imageUrl = getImageUrl(block);
            if (!imageUrl) return null;
            return (
              <figure key={index} className="my-6">
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#0a1920]">
                  <img
                    src={imageUrl}
                    alt={block?.caption || 'Изображение'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                {block?.caption && (
                  <figcaption className="text-sm text-gray-500 mt-2 text-center">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );
          }

          case 'blog.quote':
            return (
              <blockquote key={index} className="border-l-4 border-[#2dd4bf] pl-5 py-2 my-6">
                <p className="text-lg italic text-gray-300 leading-relaxed">
                  {block?.quote_text || ''}
                </p>
                {block?.quote_author && (
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
                  language={block?.code_language || 'javascript'}
                  style={vscDarkPlus}
                  className="rounded-xl"
                  showLineNumbers
                >
                  {block?.code_content || ''}
                </SyntaxHighlighter>
              </div>
            );

          case 'blog.button':
            if (!block?.button_url) return null;
            return (
              <div key={index} className="my-6">
                <a
                  href={block.button_url}
                  className="inline-flex items-center gap-2 bg-[#2dd4bf] text-[#0a1920] px-6 py-3 rounded-xl font-medium hover:bg-[#14b8a6] transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {block?.button_text || 'Подробнее'}
                  <span>→</span>
                </a>
              </div>
            );

          case 'blog.video':
            if (!block?.video_url) return null;
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
            const images = block?.gallery_images?.data || [];
            if (!images.length) return null;
            return (
              <div key={index} className="grid grid-cols-2 md:grid-cols-3 gap-4 my-6">
                {images.map((img: any, i: number) => {
                  const url = img?.attributes?.url || img?.url || '';
                  if (!url || typeof url !== 'string') return null;
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
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
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