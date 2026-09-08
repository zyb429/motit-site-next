// app/admin/posts/new/page.tsx (Server Component)
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CreatePostClient from "./CreatePostClient";

export type User = {
  id: number;
  documentId?: string;
  username: string;
  email: string;
  firstname?: string;
  lastname?: string;
};

export type Category = {
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

function getApiUrl(): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";
  return baseUrl.replace(/\/$/, "");
}

async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get("strapi_jwt")?.value || cookieStore.get("token")?.value;

    if (!token) {
      return null;
    }

    const baseUrl = getApiUrl();
    const response = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user || data.data || null;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const baseUrl = getApiUrl();
    const response = await fetch(`${baseUrl}/api/categories`, {
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Failed to fetch categories:", response.status);
      return [];
    }

    const data = await response.json();
    return data.data || data || [];
  } catch (error) {
    console.error("Error getting categories:", error);
    return [];
  }
}

export default async function CreatePostPage() {
  const [user, categories] = await Promise.all([
    getCurrentUser(),
    getCategories(),
  ]);

  // ✅ Редирект без try-catch - это правильный подход
  if (!user) {
    redirect("/login");
  }

  return <CreatePostClient initialUser={user} initialCategories={categories} />;
}
