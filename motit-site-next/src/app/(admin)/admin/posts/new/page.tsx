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
  full_name?: string;
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

async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get("strapi_jwt")?.value || cookieStore.get("token")?.value;

    if (!token) {
      return null;
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        Cookie: `strapi_jwt=${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[CreatePostPage] Strapi error: ${errorText}`);
      return null;
    }

    const data = await response.json();
    const user = data.user || data.data || data;

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstname: user.firstname || user.username,
      lastname: user.lastname || "",
      full_name: user.full_name || user.username,
    };
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
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
