# Motit

Сайт с блогом и собственной админкой на Next.js.
Раньше использовался Strapi, теперь — собственная
админка, Prisma, Auth.js и S3.

## Стек

- **Next.js 16** — App Router, Turbopack, React 19
- **TypeScript 5.9**
- **MySQL 8** + **Prisma 7**
- **Auth.js** (next-auth beta) — Credentials provider
- **MinIO / S3** — медиа
- **Tailwind CSS 4**
- **Slate** — редактор постов

## Требования

- Node.js 20+
- [Bun](https://bun.sh) (или npm/pnpm)
- Docker + docker compose — для MySQL и MinIO локально

## Структура репозитория

"```"
motit-site-next/            ← корень монорепы
├── motit-site-next/        ← Next.js приложение
│   ├── prisma/
│   ├── scripts/
│   ├── src/
│   └── .env.example
├── docker-compose.yml      ← MySQL + MinIO
└── README.md
"```"

## Быстрый старт

### 1. Клонирование

```bash
git clone git@github.com:zyb429/motit-site-next.git
cd motit-site-next/motit-site-next
bun install
```

### 2. Переменные окружения

```bash
cp .env.example .env.local
```

Заполните `.env.local`:

| Переменная | Назначение |
| --- | --- |
| `DATABASE_URL` | MySQL connection string |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` | `http://localhost:3000` |
| `NEXTAUTH_URL` | То же |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` |
| `S3_*` | S3/MinIO credentials |
| `NEXT_PUBLIC_S3_URL` | Публичный URL бакета |
| `SMTP_*` | Отправка почты |
| `HESK_*` | Help Desk (опционально) |

### 3. Инфраструктура (Docker)

Из корня монорепы:

```bash
cd ~/Projects/motit-site-next
docker compose up -d
```

Поднимет:

- **MySQL** — `localhost:3307` (внутри — 3306)
- **MinIO API** — `localhost:9000`
- **MinIO Console** — `localhost:9001`

Логин MinIO: `minioadmin` / `minioadmin`.

Проверка:

```bash
docker compose ps
```

### 4. База данных

```bash
cd motit-site-next
bun run db:push
bun run db:generate
```

Если есть дамп старой БД:

```bash
mysql -h 127.0.0.1 -P 3307 -u motit_user -p motit_site < dump.sql
```

### 5. Запуск

```bash
bun run dev
```

- Сайт — <http://localhost:3000>
- Админка — <http://localhost:3000/admin> (нужен вход)

## Скрипты

| Команда | Что делает |
| --- | --- |
| `bun run dev` | Dev-сервер (Turbopack) |
| `bun run build` | Production-сборка |
| `bun run start` | Запуск production |
| `bun run lint` | ESLint |
| `bun run db:studio` | Prisma Studio (:5555) |
| `bun run db:pull` | Интроспекция схемы |
| `bun run db:generate` | Генерация Prisma Client |
| `bun run db:push` | Применить схему к БД |
| `bun run db:migrate` | Prisma migrate dev |

## Архитектура

"```"
src/
├── app/
│   ├── (admin)/admin/    # Админка
│   ├── (auth)/login/     # Вход
│   ├── (site)/           # Публичный сайт
│   ├── (cabinet)/        # Личный кабинет
│   └── api/              # Route Handlers
├── components/
│   ├── admin/            # Sidebar, модалки
│   ├── auth/             # LogoutButton, формы
│   ├── blog/             # BlogCard, BlogPosts
│   └── ui/               # shadcn-компоненты
└── lib/
    ├── auth.ts           # Auth.js config
    ├── prisma.ts         # Prisma Client (singleton)
    ├── s3.ts             # S3 client
    └── db/               # Функции доступа к данным
"```"

## Роли

| Роль | Доступ |
| --- | --- |
| `admin` | Всё, включая пользователей |
| `worker` | Посты, категории |
| `client` | Личный кабинет |
| `statistics` | Просмотр статистики |
| `public` | Публичный сайт |

Пароли — bcrypt (10 раундов).

## Медиа

Файлы хранятся в **MinIO** локально и в **S3** на проде.

- Префиксы: `uploads/*` — посты, `avatars/*` — аватары.
- Записи — в таблице `files`.
- Связи: `posts.featured_image_id`, `users.avatar_id`.

Для исправления `Content-Type` у старых файлов:

```bash
cd motit-site-next
bun scripts/fix-content-type.ts
```

## Миграция со Strapi

Проект полностью мигрирован со Strapi
(папка `motit-backend/` удалена).

| Было (Strapi) | Стало |
| --- | --- |
| Strapi API :1337 | Prisma + MySQL |
| `strapi_jwt` cookie | Auth.js sessions |
| `users-permissions` | Своя `users` + bcrypt |
| Upload local | MinIO / S3 |
| `documentId` в URL | Числовой `id` |
| `components_blog_*` | `posts.content` (Slate) |
| `middleware.ts` | `proxy.ts` (Next.js 16) |

## Продакшен

### 1. S3

Замените MinIO на реальный S3 (AWS, Cloudflare R2,
Yandex Object Storage) в прод-`.env.local`:

```env
S3_ENDPOINT="https://s3.amazonaws.com"
S3_REGION="eu-central-1"
S3_BUCKET="motit-uploads"
S3_ACCESS_KEY_ID="..."
S3_SECRET_ACCESS_KEY="..."
S3_PUBLIC_URL="https://motit-uploads.s3.amazonaws.com"
NEXT_PUBLIC_S3_URL="https://motit-uploads.s3.amazonaws.com"
```

### 2. next.config.ts

Добавьте прод-домен S3 в `images.remotePatterns`:

```ts
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "motit-uploads.s3.amazonaws.com",
      pathname: "/**",
    },
  ],
}
```

### 3. .env.local на проде

```env
DATABASE_URL="mysql://user:pass@prod-host:3306/motit_site"
AUTH_SECRET="<openssl rand -base64 32>"
AUTH_URL="https://motit.by"
NEXTAUTH_URL="https://motit.by"
NEXT_PUBLIC_SITE_URL="https://motit.by"
```

### 4. Сборка и запуск

```bash
bun install --frozen-lockfile
bun run build
bun run start
```

## Безопасность

- `.env`, `.env.local`, дампы БД, `mysql creds.txt` —
  никогда не коммитить (см. `.gitignore`).
- Все секреты — только в `.env.local` на сервере.
- Пароли — bcrypt.
- Auth.js — JWT с подписью `AUTH_SECRET`.

## Лицензия

Private. Все права защищены.
