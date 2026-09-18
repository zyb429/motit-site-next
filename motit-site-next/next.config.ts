import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.166", "localhost:3000"],

  transpilePackages: ["three", "gsap", "@studio-freight/lenis"],

  compress: true,
  poweredByHeader: false,

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    remotePatterns: [
      // S3 / MinIO локально
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/motit-uploads/**",
      },
      // Для прода — замени на реальный домен S3/CDN
      {
        protocol: "https",
        hostname: "your-s3-domain.com",
        port: "",
        pathname: "/**",
      },
    ],
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;
