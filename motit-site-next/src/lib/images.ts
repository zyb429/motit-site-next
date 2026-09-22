/**
 * Универсальный тип для картинки из разных источников:
 * - готовая строка URL
 * - Prisma-модель files (url)
 * - Strapi-объект с data.attributes.url
 * - legacy-форматы
 */

function normalizeImageUrl(url: string): string {
  if (!url || typeof url !== "string") return "";

  // Если URL относительный, добавляем базовый
  if (url.startsWith("/uploads")) {
    const baseUrl =
      process.env.NEXT_PUBLIC_S3_URL || "http://localhost:9000/motit-uploads";
    return `${baseUrl}${url}`;
  }

  return url;
}

type ImageInput =
  | string
  | {
      url?: string | null;
      attributes?: { url?: string | null } | null;
      data?: {
        url?: string | null;
        attributes?: { url?: string | null } | null;
      } | null;
    }
  | null
  | undefined;

export function getSafeImageUrl(image: ImageInput): string | null {
  if (!image) return null;

  if (typeof image === "string") {
    return normalizeImageUrl(image);
  }

  if (typeof image === "object") {
    try {
      let url: unknown = image.url || null;

      if (!url) {
        url =
          image.data?.attributes?.url ||
          image.attributes?.url ||
          image.data?.url ||
          null;
      }

      if (url && typeof url === "object") {
        url = String(url);
      }

      if (url && typeof url === "string") {
        return normalizeImageUrl(url);
      }
    } catch (e) {
      console.warn("Error extracting image URL:", e);
      return null;
    }
  }

  return null;
}
