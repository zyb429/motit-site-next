import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['192.168.1.166', 'localhost:3000'],

  transpilePackages: ['three', 'gsap', '@studio-freight/lenis'],
  
  // Оптимизация
  compress: true,
  poweredByHeader: false,
  
  // Для изображений
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
      // Для продакшена - замените на ваш реальный домен
      {
        protocol: 'https',
        hostname: 'api.your-domain.com',
        port: '',
        pathname: '/uploads/**',
      },
    ],
    // ✅ Разрешаем локальные IP для разработки
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;
