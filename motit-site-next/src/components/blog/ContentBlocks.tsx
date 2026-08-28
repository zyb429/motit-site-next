'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Интерфейсы для каждого типа блока
interface HeadingBlock {
  id: string;
  __component: 'blog.heading';
  heading_level?: 'h2' | 'h3' | 'h4';
  text: string;
}

interface TextBlock {
  id: string;
  __component: 'blog.text';
  text: string;
}

interface ImageBlock {
  id: string;
  __component: 'blog.image';
  image?: any; // Используем any для гибкости
  image_position?: 'left' | 'center' | 'right' | 'full';
  caption?: string;
}

interface QuoteBlock {
  id: string;
  __component: 'blog.quote';
  quote_text: string;
  quote_author?: string;
}

interface CodeBlock {
  id: string;
  __component: 'blog.code';
  code_language?: string;
  code_content: string;
}

interface ButtonBlock {
  id: string;
  __component: 'blog.button';
  button_text: string;
  button_url: string;
  button_style?: 'primary' | 'secondary' | 'outline';
}

interface VideoBlock {
  id: string;
  __component: 'blog.video';
  video_url: string;
}

interface GalleryBlock {
  id: string;
  __component: 'blog.gallery';
  gallery_images?: any;
}

type Block = 
  | HeadingBlock
  | TextBlock
  | ImageBlock
  | QuoteBlock
  | CodeBlock
  | ButtonBlock
  | VideoBlock
  | GalleryBlock;

interface ContentBlocksProps {
  blocks: Block[];
}

export default function ContentBlocks({ blocks }: ContentBlocksProps) {
  console.log('🔍 ContentBlocks received:', JSON.stringify(blocks, null, 2));
  console.log('🔍 Type of blocks:', typeof blocks);
  console.log('🔍 Is array:', Array.isArray(blocks));
  console.log('🔍 Length:', blocks?.length);

  if (!blocks || blocks.length === 0) {
    return null;
  }

  return (
    <div className="blog-content max-w-none">
      {blocks.map((block) => {
        switch (block.__component) {
          case 'blog.heading':
            return renderHeading(block);
          case 'blog.text':
            return renderText(block);
          case 'blog.image':
            return renderImage(block);
          case 'blog.quote':
            return renderQuote(block);
          case 'blog.code':
            return renderCode(block);
          case 'blog.button':
            return renderButton(block);
          case 'blog.video':
            return renderVideo(block);
          case 'blog.gallery':
            return renderGallery(block);
          default:
            return null;
        }
      })}
    </div>
  );
}

// --- Функции рендеринга ---

function renderHeading(block: HeadingBlock) {
  const HeadingTag = block.heading_level || 'h2';
  return (
    <div key={block.id} className="my-6">
      <HeadingTag className="font-bold">{block.text}</HeadingTag>
    </div>
  );
}

function renderText(block: TextBlock) {
  return (
    <div key={block.id} className="blog-text my-6 prose prose-lg dark:prose-invert max-w-none">
      <ReactMarkdown>{block.text}</ReactMarkdown>
    </div>
  );
}

function renderImage(block: ImageBlock) {
  // ✅ Подробное логирование
  console.log('🔍 renderImage START');
  console.log('🔍 block:', block);
  console.log('🔍 block.image:', block.image);
  console.log('🔍 typeof block.image:', typeof block.image);
  
  // ✅ Пытаемся получить URL из разных возможных мест
  let imageUrl = '';
  
  // Вариант 1: block.image.data.attributes.url
  try {
    if (block?.image?.data?.attributes?.url) {
      imageUrl = block.image.data.attributes.url;
    }
  } catch (e) {
    console.warn('Error getting image URL from attributes:', e);
  }
  
  // Вариант 2: block.image.url (если структура другая)
  if (!imageUrl && block?.image?.url) {
    imageUrl = block.image.url;
  }
  
  // Вариант 3: block.image (если это просто строка)
  if (!imageUrl && typeof block?.image === 'string') {
    imageUrl = block.image;
  }
  
  // Если все еще нет URL - пропускаем
  if (!imageUrl) {
    console.warn('Could not find image URL in block:', block);
    return null;
  }
  
  // ✅ Преобразуем в строку, если это объект
  if (typeof imageUrl !== 'string') {
    try {
      imageUrl = String(imageUrl);
    } catch (e) {
      console.warn('Could not convert image URL to string:', imageUrl);
      return null;
    }
  }
  
  // ✅ Если url начинается с /uploads, добавляем базовый URL
  if (imageUrl.startsWith('/uploads')) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
    imageUrl = `${baseUrl}${imageUrl}`;
  }

  console.log('✅ Final image URL:', imageUrl);

  const positionClasses = {
    left: 'float-left mr-6 mb-4 max-w-[50%]',
    right: 'float-right ml-6 mb-4 max-w-[50%]',
    center: 'mx-auto',
    full: 'w-full'
  };

  return (
    <figure key={block.id} className={`my-8 ${positionClasses[block.image_position || 'full']}`}>
      {/* ✅ Используем обычный тег img вместо next/image */}
      <img
        src={imageUrl}
        alt={block.caption || 'Изображение'}
        className="rounded-lg shadow-lg max-w-full h-auto"
      />
      {block.caption && (
        <figcaption className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}

function renderQuote(block: QuoteBlock) {
  return (
    <blockquote key={block.id} className="my-8 border-l-4 border-blue-500 pl-6 py-2">
      <p className="text-xl italic">{block.quote_text}</p>
      {block.quote_author && (
        <footer className="text-sm text-gray-500 mt-2">— {block.quote_author}</footer>
      )}
    </blockquote>
  );
}

function renderCode(block: CodeBlock) {
  return (
    <div key={block.id} className="my-8">
      <SyntaxHighlighter
        language={block.code_language || 'javascript'}
        style={vscDarkPlus}
        className="rounded-lg"
        showLineNumbers
      >
        {block.code_content}
      </SyntaxHighlighter>
    </div>
  );
}

function renderButton(block: ButtonBlock) {
  const styles = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline'
  };

  return (
    <div key={block.id} className="my-6">
      <a
        href={block.button_url}
        className={`${styles[block.button_style || 'primary']} inline-block`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {block.button_text}
      </a>
    </div>
  );
}

function renderVideo(block: VideoBlock) {
  return (
    <div key={block.id} className="my-8 aspect-video">
      <iframe
        src={block.video_url}
        className="w-full h-full rounded-lg"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function renderGallery(block: GalleryBlock) {
  // ✅ Получаем изображения галереи
  let images: any[] = [];
  
  try {
    if (block?.gallery_images?.data && Array.isArray(block.gallery_images.data)) {
      images = block.gallery_images.data;
    } else if (Array.isArray(block?.gallery_images)) {
      images = block.gallery_images;
    }
  } catch (e) {
    console.warn('Error getting gallery images:', e);
  }
  
  if (images.length === 0) {
    return null;
  }

  return (
    <div key={block.id} className="my-8 grid grid-cols-2 md:grid-cols-3 gap-4">
      {images.map((image, index) => {
        let imageUrl = '';
        
        // Пытаемся получить URL из разных мест
        try {
          if (image?.attributes?.url) {
            imageUrl = image.attributes.url;
          } else if (image?.url) {
            imageUrl = image.url;
          } else if (typeof image === 'string') {
            imageUrl = image;
          }
        } catch (e) {
          console.warn('Error getting gallery image URL:', e);
        }
        
        if (!imageUrl) return null;
        
        if (typeof imageUrl !== 'string') {
          try {
            imageUrl = String(imageUrl);
          } catch (e) {
            return null;
          }
        }
        
        if (imageUrl.startsWith('/uploads')) {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
          imageUrl = `${baseUrl}${imageUrl}`;
        }
        
        const altText = image?.attributes?.alternativeText || `Изображение ${index + 1}`;
        
        return (
          <div key={index} className="relative aspect-square overflow-hidden rounded-lg">
            <img
              src={imageUrl}
              alt={altText}
              className="object-cover w-full h-full"
            />
          </div>
        );
      })}
    </div>
  );
}