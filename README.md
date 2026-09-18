# Motit

Сайт с блогом и собственной админкой на Next.js. Раньше использовался Strapi, теперь — собственная админка, Prisma, Auth.js и S3.

## Стек

- **Next.js 16** (App Router, Turbopack, React 19)
- **TypeScript** 5.9
- **MySQL 8** + **Prisma 6**
- **Auth.js** (next-auth beta) — Credentials provider
- **MinIO / S3** — медиа
- **Tailwind CSS 4**
- **Slate** — редактор постов

## Требования

- Node.js 20+
- [Bun](https://bun.sh) (или npm/pnpm)
- Docker + docker compose (для MySQL и MinIO локально)

## Структура репозитория

motit-site-next/                ← корень монорепы
├── motit-site-next/            ← Next.js приложение (основное)
│   ├── prisma/
│   │   └── schema.prisma
│   ├── scripts/
│   │   └── fix-content-type.ts
│   ├── src/
│   │   ├── app/                ← App Router
│   │   ├── components/
│   │   └── lib/
│   └── .env.example
├── docker-compose.yml          ← MySQL + MinIO
└── README.md

## Быстрый старт

### 1. Клонирование

git clone git@github.com:zyb429/motit-site-next.git
cd motit-site-next/motit-site-next
bun install

### 2. Переменные окружения

cp .env.example .env.local

Заполни `.env.local`:

| Переменная | Назначение |
|---|---|
| `DATABASE_URL` | строка подключения к MySQL |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` / `NEXTAUTH_URL` | `http://localhost:3000` |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` |
| `S3_*` | параметры S3/MinIO |
| `NEXT_PUBLIC_S3_URL` | публичный URL бакета |
| `SMTP_*` | для отправки почты |
| `HESK_*` | Help Desk (опционально) |

### 3. Инфраструктура (Docker)

Из корня монорепы:

cd ~/Projects/motit-site-next
docker compose up -d

Поднимет:

- **MySQL** на `localhost:3307` (внутри контейнера — 3306)
- **MinIO** на `localhost:9000` (API) и `localhost:9001` (Web console)

Логин MinIO: `minioadmin` / `minioadmin`.

Проверка:

docker compose ps

### 4. База данных

cd motit-site-next
bun run db:push       # применить схему
bun run db:generate   # сгенерировать Prisma Client

Если есть дамп старой БД:

mysql -h 127.0.0.1 -P 3307 -u motit_user -p motit_site < dump.sql

### 5. Запуск

bun run dev

- Сайт: [http://localhost:3000](http://localhost:3000)
- Админка: [http://localhost:3000/admin](http://localhost:3000/admin) (нужен вход)

## Скрипты

bun run dev          # dev-сервер (Turbopack)
bun run build        # production-сборка
bun run start        # запуск production
bun run lint         # ESLint

bun run db:studio    # Prisma Studio (:5555)
bun run db:pull      # интроспекция схемы из БД
bun run db:generate  # генерация Prisma Client
bun run db:push      # применить схему к БД
bun run db:migrate   # prisma migrate dev

## Архитектура

src/
├── app/
│   ├── (admin)/admin/         # Админка
│   │   ├── page.tsx           # Дашборд
│   │   ├── posts/             # Посты (список, редактор, создание)
│   │   ├── categories/        # Категории
│   │   ├── users/             # Пользователи
│   │   └── settings/          # Настройки
│   ├── (auth)/login/          # Вход
│   ├── (site)/                # Публичный сайт
│   │   ├── page.tsx           # Главная
│   │   ├── blog/              # Блог
│   │   └── authors/           # Авторы
│   ├── (account)/account/     # Личный кабинет
│   ├── api/                   # Route Handlers
│   │   ├── auth/[...nextauth] # Auth.js
│   │   ├── posts/             # CRUD постов
│   │   ├── categories/        # CRUD категорий
│   │   ├── admin/users/       # Управление пользователями
│   │   ├── settings/          # Настройки
│   │   └── upload/            # Загрузка медиа в S3
│   └── globals.css
├── components/
│   ├── admin/                 # Sidebar, settings placeholder
│   ├── auth/                  # LogoutButton
│   ├── blog/                  # BlogCard, BlogPosts, AuthorPosts...
│   └── ui/                    # shadcn-компоненты
└── lib/
    ├── auth.ts                # Auth.js config + getCurrentUser
    ├── prisma.ts              # Prisma Client (singleton)
    ├── s3.ts                  # S3 client
    ├── data-source.ts
    └── db/                    # Функции доступа к данным
        ├── posts.ts
        ├── categories.ts
        ├── users.ts
        └── settings.ts

## Роли

| Роль | Доступ |
|---|---|
| `admin` | Всё, включая управление пользователями |
| `worker` | Посты, категории (контент-менеджер) |
| `client` | Личный кабинет |
| `statistics` | Просмотр статистики |
| `public` | Публичный сайт |

Пароли пользователей хешируются bcrypt (10 раундов).

## Медиа

Файлы хранятся в **MinIO** локально и в **S3** на проде.

- Префиксы: `uploads/*` — картинки постов, `avatars/*` — аватары пользователей.
- Записи — в таблице `files` (Prisma-модель `files`).
- Связи: `posts.featured_image_id` → `files.id`, `users.avatar_id` → `files.id`.

Для исправления `Content-Type` у старых файлов:

cd motit-site-next
bun scripts/fix-content-type.ts

## Миграция со Strapi

Проект полностью мигрирован со Strapi (папка `motit-backend/` удалена). Что изменилось:

| Было (Strapi) | Стало |
|---|---|
| Strapi API `localhost:1337` | Prisma + MySQL напрямую |
| `strapi_jwt` cookie | Auth.js сессии |
| `users-permissions` | Своя таблица `users` + bcrypt |
| Strapi Upload (local) | MinIO / S3 |
| `documentId` в URL | Числовой `id` |
| `components_blog_*` | `posts.content` (JSON Slate) |
| `middleware.ts` | `proxy.ts` (Next.js 16) |

## Продакшен

### 1. S3

Замени MinIO на реальный S3 (AWS, Cloudflare R2, Yandex Object Storage) в прод-`.env.local`:

S3_ENDPOINT="https://s3.amazonaws.com"
S3_REGION="eu-central-1"
S3_BUCKET="motit-uploads"
S3_ACCESS_KEY_ID="..."
S3_SECRET_ACCESS_KEY="..."
S3_PUBLIC_URL="https://motit-uploads.s3.amazonaws.com"
NEXT_PUBLIC_S3_URL="https://motit-uploads.s3.amazonaws.com"

### 2. next.config.ts

Добавь прод-домен S3 в `images.remotePatterns`:

images: {
  remotePatterns: [
    { protocol: "https", hostname: "motit-uploads.s3.amazonaws.com", pathname: "/**" },
  ],
}

### 3. .env.local на проде

DATABASE_URL="mysql://user:pass@prod-host:3306/motit_site"
AUTH_SECRET="<openssl rand -base64 32>"
AUTH_URL="https://motit.by"
NEXTAUTH_URL="https://motit.by"
NEXT_PUBLIC_SITE_URL="https://motit.by"

### 4. Сборка и запуск

bun install --frozen-lockfile
bun run build
bun run start

## Безопасность

- `.env`, `.env.local`, дампы БД, `mysql creds.txt` — никогда не коммитить (см. `.gitignore`).
- Все секреты — только в `.env.local` на сервере.
- Пароли — bcrypt.
- Auth.js — JWT-сессии с подписью `AUTH_SECRET`.

## Лицензия

Private. Все права защищены.
