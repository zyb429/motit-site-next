# Motit

Сайт с блогом и собственной админкой на Next.js. Раньше использовался Strapi, теперь — собственная админка, Prisma, Auth.js и S3.

## Стек

- **Next.js 16** — App Router, Turbopack, React 19
- **TypeScript 5.9**
- **MySQL 8** + **Prisma 7**
- **Auth.js** (next-auth beta) — Credentials provider
- **MinIO / S3** — медиа
- **Redis 7** — pub/sub и presence в чатах
- **Socket.IO** — WebSocket-сервер (отдельный процесс)
- **Tailwind CSS 4**
- **Slate** — редактор постов

## Требования

- [Bun](https://bun.sh)
- Docker + docker compose

## Структура репозитория

```
motit-site-next/            ← корень монорепы
├── motit-site-next/        ← Next.js приложение
│   ├── prisma/
│   ├── scripts/
│   ├── src/
│   │   └── app/api/health/ ← healthcheck для uptime-мониторинга
│   ├── Dockerfile          ← образ на oven/bun:1
│   ├── .dockerignore
│   └── .env.example
├── docker-compose.yml      ← MySQL + Redis + MinIO + app + ws
└── README.md
```

## Быстрый старт

Есть два варианта запуска.

### Вариант A — всё в Docker (проще всего)

```bash
cp motit-site-next/.env.example motit-site-next/.env
# отредактировать .env при необходимости

cd ~/Projects/motit-site-next
docker compose up --build
```

Первый запуск — 2–5 минут (bun install, prisma generate, миграции). Дальше — кэш, запуск за секунды.

После старта:

- Сайт — <http://localhost:3000>
- Health — <http://localhost:3000/api/health>
- MinIO Console — <http://localhost:9001> (minioadmin / minioadmin)
- WebSocket — <http://localhost:3001>

Остановить:

```bash
docker compose down           # данные сохранятся
docker compose down -v        # БД обнулится
```

### Вариант B — инфра в Docker, Next.js на хосте

Для быстрого hot-reload и отладки в IDE.

```bash
cd ~/Projects/motit-site-next
docker compose up -d mysql redis minio minio-init
```

Затем в отдельном терминале:

```bash
cd motit-site-next
bun install
bun run dev          # Next.js на :3000
bun run ws           # WS на :3001 (в отдельном терминале)
```

Или одной командой:

```bash
bun run dev:all
```

## Переменные окружения

Скопируйте шаблон:

```bash
cp motit-site-next/.env.example motit-site-next/.env
```

Основные переменные:

| Переменная | Назначение |
| --- | --- |
| `DATABASE_URL` | MySQL connection string |
| `SHADOW_DATABASE_URL` | Для `prisma migrate dev` (нужна только на хосте) |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` | `http://localhost:3000` |
| `NEXTAUTH_URL` | То же |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` |
| `REDIS_URL` | `redis://localhost:6379` (хост) / `redis://redis:6379` (докер) |
| `WS_PORT` | `3001` |
| `NEXT_PUBLIC_WS_URL` | `http://localhost:3001` |
| `S3_*` | S3/MinIO credentials |
| `NEXT_PUBLIC_S3_URL` | Публичный URL бакета |
| `SMTP_*` | Отправка почты |
| `HESK_*` | Help Desk (опционально) |

**Важно:** внутри Docker хосты `mysql`, `redis`, `minio` (имена сервисов). Для запуска на хосте — `127.0.0.1` с портами `3307` / `6379` / `9000`.

## Скрипты

| Команда | Что делает |
| --- | --- |
| `bun run dev` | Dev-сервер (Turbopack) |
| `bun run dev:webpack` | Dev-сервер (Webpack, для Docker) |
| `bun run dev:all` | Next.js + WS одновременно |
| `bun run build` | Production-сборка |
| `bun run start` | Запуск production |
| `bun run lint` | ESLint |
| `bun run db:studio` | Prisma Studio (:5555) |
| `bun run db:pull` | Интроспекция схемы |
| `bun run db:generate` | Генерация Prisma Client |
| `bun run db:push` | Применить схему к БД |
| `bun run db:migrate` | Prisma migrate dev |
| `bun run ws` | WebSocket-сервер (Socket.IO) |

## Архитектура

```
src/
├── app/
│   ├── (admin)/admin/    # Админка
│   ├── (auth)/login/     # Вход
│   ├── (site)/           # Публичный сайт
│   ├── (cabinet)/        # Личный кабинет
│   └── api/              # Route Handlers
│       └── health/       # healthcheck
├── components/
│   ├── admin/            # Sidebar, модалки
│   ├── auth/             # LogoutButton, формы
│   ├── blog/             # BlogCard, BlogPosts
│   └── ui/               # shadcn-компоненты
└── lib/
    ├── auth.ts           # Auth.js config
    ├── prisma.ts         # Prisma Client (singleton)
    ├── redis.ts          # Redis client (ioredis)
    ├── s3.ts             # S3 client
    └── db/               # Функции доступа к данным
```

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

## Чат

Чат работает через WebSocket (Socket.IO) на отдельном процессе `server.ts` (порт 3001). Redis используется для pub/sub между инстансами.

Функции:

- Личные сообщения, группы, каналы
- Реакции, ответы, редактирование
- Закреплённые сообщения (для себя / для всех)
- Presence (кто онлайн)
- Файлы и медиа

## Миграция со Strapi

Проект полностью мигрирован со Strapi (папка `motit-backend/` удалена).

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

Замените MinIO на реальный S3 (AWS, Cloudflare R2, Yandex Object Storage) в прод-`.env`:

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
},
```

### 3. .env на проде

```env
DATABASE_URL="mysql://user:pass@prod-host:3306/motit_site"
AUTH_SECRET="<openssl rand -base64 32>"
AUTH_URL="https://motit.by"
NEXTAUTH_URL="https://motit.by"
NEXT_PUBLIC_SITE_URL="https://motit.by"
```

### 4. Сборка и запуск

В проде — не `dev`, а production-сборка:

```bash
bun install --frozen-lockfile
bun run build
bun run start
```

В `docker-compose.yml` для прода замените `command` в сервисе `app` на:

```yaml
    command: >
      sh -c "
      bunx prisma generate &&
      bunx prisma migrate deploy &&
      bun run build &&
      bun run start
      "
    environment:
      NODE_ENV: production
```

## Безопасность

- `.env`, `.env.local`, дампы БД, `mysql creds.txt` — никогда не коммитить (см. `.gitignore`).
- Все секреты — только в `.env` на сервере.
- Пароли — bcrypt.
- Auth.js — JWT с подписью `AUTH_SECRET`.

## Лицензия

Private. Все права защищены.
