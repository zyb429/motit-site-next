import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ['three', 'gsap', '@studio-freight/lenis'],
  
  // Оптимизация
  compress: true,
  poweredByHeader: false,
  
  // Для изображений
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  
  // Кэширование
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
