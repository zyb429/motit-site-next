import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.166", "localhost:3000"],

  transpilePackages: ["three", "gsap", "@studio-freight/lenis"],

  serverExternalPackages: ["@prisma/client", ".prisma/client"],

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

  async rewrites() {
    const s3ProxyTarget =
      process.env.S3_PROXY_TARGET ?? "http://localhost:9000/motit-uploads";

    return [
      {
        source: "/files/:path*",
        destination: `${s3ProxyTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;
