import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import {
  PlusCircle,
  FileText,
  FolderOpen,
  Settings,
  LogOut,
  Home,
  PenSquare,
} from "lucide-react";

type User = {
  id: number;
  username: string;
  email: string;
  firstname?: string;
  lastname?: string;
};

async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("strapi_jwt")?.value;

    console.log(`[Admin] JWT token: ${token ? "✅" : "❌"}`);

    if (!token) {
      return null;
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // ✅ Запрашиваем пользователя через Strapi с API Token
    const response = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        Cookie: `strapi_jwt=${token}`,
      },
      cache: "no-store",
    });

    console.log(`[Admin] Strapi status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Admin] Strapi error: ${response.status} - ${errorText}`);

      return null;
    }

    const user = await response.json();
    console.log(`[Admin] User found: ${user.username || user.email}`);

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstname: user.firstname || user.username,
      lastname: user.lastname || "",
    };
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    console.log("[Admin] No user, redirecting to login");
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <PenSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Админ панель
                </h1>
                <p className="text-sm text-gray-500">
                  Добро пожаловать, {user.firstname || user.username}!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <Home className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">На сайт</span>
              </Link>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="text-red-600 hover:text-red-700 transition-colors flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm hidden sm:inline">Выйти</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Всего постов
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">0</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Категории</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">0</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Быстрые действия
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/posts/new"
              className="group bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all hover:border-blue-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <PlusCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Создать пост</h3>
                  <p className="text-sm text-gray-500">Написать новый пост</p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/posts"
              className="group bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all hover:border-green-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Все посты</h3>
                  <p className="text-sm text-gray-500">Управление постами</p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/categories"
              className="group bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all hover:border-purple-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                  <FolderOpen className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Категории</h3>
                  <p className="text-sm text-gray-500">
                    Управление категориями
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/settings"
              className="group bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all hover:border-gray-300"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                  <Settings className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Настройки</h3>
                  <p className="text-sm text-gray-500">Настройки сайта</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Последняя активность
          </h2>
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">
              Здесь будет отображаться последняя активность
            </p>
            <p className="text-xs mt-1">Скоро появится</p>
          </div>
        </div>
      </main>
    </div>
  );
}
