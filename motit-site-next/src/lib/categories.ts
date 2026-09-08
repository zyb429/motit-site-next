type Category = {
  id: number;
  documentId?: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
};

export async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/categories`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      console.error("Failed to fetch categories:", response.status);
      return [];
    }

    const data = await response.json();

    // Обработка разных форматов ответа
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }

    if (Array.isArray(data)) {
      return data;
    }

    return [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}
