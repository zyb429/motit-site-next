export function getSafeImageUrl(image: any): string | null {
  if (!image) return null;
  
  // Если это строка
  if (typeof image === 'string') {
    return normalizeImageUrl(image);
  }
  
  // Если это объект (как в вашем случае)
  if (typeof image === 'object' && image !== null) {
    try {
      // 🎯 Прямой доступ к url (самый простой путь)
      let url = image?.url || null;
      
      // Если url нет, пробуем другие пути
      if (!url) {
        url = image?.data?.attributes?.url || 
              image?.attributes?.url ||
              image?.data?.url ||
              null;
      }
      
      // Если URL - объект, преобразуем в строку
      if (url && typeof url === 'object') {
        url = String(url);
      }
      
      // Если получили строку
      if (url && typeof url === 'string') {
        return normalizeImageUrl(url);
      }
    } catch (e) {
      console.warn('Error extracting image URL:', e);
      return null;
    }
  }
  
  return null;
}

/**
 * Нормализация URL изображения
 */
function normalizeImageUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  
  // Если URL относительный, добавляем базовый
  if (url.startsWith('/uploads')) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
    return `${baseUrl}${url}`;
  }
  
  return url;
}