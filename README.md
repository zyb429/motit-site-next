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
```
cp motit-site-next/.env.example motit-site-next/.env
# отредактировать .env при необходимости

cd ~/Projects/motit-site-next
docker compose up --build
```
Первый запуск — 2–5 минут (bun install, prisma generate, миграции). Дальше — кэш, запуск за секунды.

**Порядок старта контейнеров:** mysql (healthy) → redis (healthy) → minio (healthy) → minio-init (создаёт бакет motit-uploads и завершается) → app (стартует только после service_completed_successfully у minio-init). ws стартует параллельно, ждёт только redis.

После старта (контейнер app должен быть healthy):

```
docker compose exec app bunx prisma db seed
```

Это создаст справочники (роли, статусы, приоритеты, категории тикетов, MIME-настройки) и admin-пользователя.

- Сайт — http://localhost:3000
- Health — http://localhost:3000/api/health
- MinIO Console — http://localhost:9001 (minioadmin / minioadmin)
- WebSocket — http://localhost:3001

Остановить:
```
docker compose down           # данные сохранятся
docker compose down -v        # БД обнулится
```
### Вариант B — инфра в Docker, Next.js на хосте

Для быстрого hot-reload и отладки в IDE.
```
cd ~/Projects/motit-site-next
docker compose up -d mysql redis minio minio-init
```
Затем в отдельном терминале:
```
cd motit-site-next
bun install
bun run dev          # Next.js на :3000
bun run ws           # WS на :3001 (в отдельном терминале)
```
Или одной командой:
```
bun run dev:all
```
### Порты

| Сервис | Порт (хост) |
| --- | --- |
| app (Next.js) | 3000 |
| ws (WebSocket) | 3001 |
| MySQL | 3307 |
| Redis | 6379 |
| MinIO API (S3) | 9000 |
| MinIO Console | 9001 |

## Переменные окружения

Скопируйте шаблон:
```
cp motit-site-next/.env.example motit-site-next/.env
```
Основные переменные:

| Переменная | Назначение |
| --- | --- |
| USE_PRISMA | Флаг использования Prisma (1) |
| HOST | Адрес, на котором слушает сервер (0.0.0.0) |
| PORT | Порт приложения (3000) |
| DATABASE_URL | MySQL connection string |
| SHADOW_DATABASE_URL | Для prisma migrate dev (нужна только на хосте) |
| AUTH_SECRET | openssl rand -base64 32 |
| AUTH_URL | http://localhost:3000 (локально) / https://motit.by (прод) |
| NEXTAUTH_URL | То же |
| NEXT_PUBLIC_SITE_URL | http://localhost:3000 |
| REDIS_URL | redis://localhost:6379 (хост) / redis://redis:6379 (докер) |
| WS_PORT | 3001 |
| NEXT_PUBLIC_WS_URL | http://localhost:3001 |
| S3_* | S3/MinIO credentials |
| NEXT_PUBLIC_S3_URL | Публичный URL бакета |
| SMTP_* | Отправка почты |
| HESK_* | Help Desk (опционально) |

**Важно:** внутри Docker хосты mysql, redis, minio (имена сервисов). Для запуска на хосте — 127.0.0.1 с портами 3307 / 6379 / 9000.

**env_file и переопределения:** сервисы app и ws читают ./motit-site-next/.env через env_file. Дополнительно в environment переопределяются DATABASE_URL, SHADOW_DATABASE_URL, REDIS_URL, S3_ENDPOINT, S3_PROXY_TARGET — на имена docker-сервисов (mysql, redis, minio).

**HESK_API_TOKEN:** нужно заполнить вручную — получить токен в админ-панели HESK. Без него интеграция Help Desk не заработает.

**Про shadow database:** SHADOW_DATABASE_URL используется только командой prisma migrate dev (запускается с хоста). В контейнере app выполняется prisma migrate deploy, которому shadow database не нужна. База motit_site_shadow автоматически не создаётся — если планируете migrate dev, создайте её вручную и дайте motit_user права:
```
docker compose exec mysql mysql -uroot -proot_local_dev -e \
  "CREATE DATABASE IF NOT EXISTS motit_site_shadow; \
   GRANT ALL PRIVILEGES ON motit_site_shadow.* TO 'motit_user'@'%'; \
   FLUSH PRIVILEGES;"
```
**Про .env и секреты:** файл motit-site-next/.env никогда не коммитится — он в .gitignore. В репозитории хранится только .env.example без значений. Реальные секреты (SMTP_PASS, AUTH_SECRET, пароли БД и S3) держите только в локальном .env и в переменных окружения прода.

### Шаблон .env.example
```
USE_PRISMA="1"

# Server
HOST=0.0.0.0
PORT=3000

# API URL для связи с бэкендом
NEXT_PUBLIC_SITE_URL=http://localhost:3000

AUTH_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"

# SMTP (ваш корпоративный почтовый сервер)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=you@example.com
SMTP_PASS="<app-password>"
SMTP_FROM_NAME="Motit | Официальный сайт"
SMTP_FROM_EMAIL=you@example.com
CONTACT_EMAIL=you@example.com

# Help Desk (опционально - оставьте none если не нужен)
HELP_DESK_TYPE=hesk_form
# URL вашей установки HESK, например: https://help.example.com
HESK_API_URL=https://help.example.com
# Токен, сгенерированный в админ-панели HESK
HESK_API_TOKEN=
# ID категории, в которую будут попадать тикеты (можно найти в админ-панели)
HESK_CATEGORY_ID=1

# MYSQL MotitSecure2024 in Docker
# Если пароль содержит спецсимволы (!, @, #), закодируй их в URL:
# ! → %21,  @ → %40,  # → %23
DATABASE_URL="mysql://motit_user:MotitSecure2024%21@127.0.0.1:3307/motit_site"
SHADOW_DATABASE_URL="mysql://motit_user:MotitSecure2024%21@127.0.0.1:3307/motit_site_shadow"

# openssl rand -base64 32
AUTH_SECRET="<openssl rand -base64 32>"

# S3 / MinIO
S3_ENDPOINT="http://localhost:9000"
S3_REGION="us-east-1"
S3_BUCKET="motit-uploads"
S3_ACCESS_KEY_ID="minioadmin"
S3_SECRET_ACCESS_KEY="minioadmin"
S3_PUBLIC_URL="/files"
S3_FORCE_PATH_STYLE="true"
NEXT_PUBLIC_S3_URL="/files"
S3_PROXY_TARGET="http://localhost:9000/motit-uploads"

# Chat / WebSocket
REDIS_URL="redis://127.0.0.1:6379"
WS_PORT=3001
NEXT_PUBLIC_WS_URL="http://localhost:3001"
```

## Скрипты

| Команда | Что делает |
| --- | --- |
| bun run dev | Dev-сервер (Turbopack) |
| bun run dev:webpack | Dev-сервер (Webpack, для Docker) |
| bun run dev:all | Next.js + WS одновременно |
| bun run build | Production-сборка |
| bun run start | Запуск production |
| bun run lint | ESLint |
| bun run db:studio | Prisma Studio (:5555) |
| bun run db:pull | Интроспекция схемы |
| bun run db:generate | Генерация Prisma Client |
| bun run db:push | Применить схему к БД |
| bun run db:migrate | Prisma migrate dev |
| bun run ws | WebSocket-сервер (Socket.IO) |
| docker compose exec app bunx prisma db seed | Справочники + admin-пользователь |

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
| admin | Всё, включая пользователей |
| worker | Посты, категории |
| client | Личный кабинет |
| statistics | Просмотр статистики |
| public | Публичный сайт |

Пароли — bcrypt (10 раундов).

## Учётные записи по умолчанию

Создаются командой prisma db seed:

| Email | Пароль | Роль |
| --- | --- | --- |
| admin@local.dev | admin123 | admin |

Пароль хэшируется через bcrypt (bcryptjs, 10 раундов) — это соответствует проверке в src/lib/auth.ts, где используется bcrypt.compare. Хэширование через Bun.password.hash (argon2) не подойдёт: алгоритмы несовместимы.

⚠️ В продакшене сразу после первого запуска смените пароль admin через админку или переопределите seed так, чтобы он брал email/пароль из переменных окружения:
```
const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@local.dev";
const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin123";
```
## Медиа

Файлы хранятся в MinIO локально и в S3 на проде.

- Префиксы: uploads/* — посты, avatars/* — аватары.
- Записи — в таблице files.
- Связи: posts.featured_image_id, users.avatar_id.
- Локально S3 проксируется через /files (S3_PUBLIC_URL="/files", S3_PROXY_TARGET="http://localhost:9000/motit-uploads"), чтобы избежать CORS и проблем с прямыми ссылками на MinIO.

Для исправления Content-Type у старых файлов:
```
cd motit-site-next
bun scripts/fix-content-type.ts
```
## Чат

Чат работает через WebSocket (Socket.IO) на отдельном процессе server.ts (порт 3001). Redis используется для pub/sub между инстансами.

Функции:

- Личные сообщения, группы, каналы
- Реакции, ответы, редактирование
- Закреплённые сообщения (для себя / для всех)
- Presence (кто онлайн)
- Файлы и медиа

## Особенности реализации

### Prisma v7 + Next.js

В prisma/schema.prisma обязательна опция:
```
generator client {
  provider            = "prisma-client"
  output              = "../generated/prisma/"
  importFileExtension = "ts"
}
```
Без importFileExtension = "ts" сгенерированные файлы содержат импорты с .js, и Webpack/Next.js не может их разрешить — приложение падает с Module not found: Can't resolve '@generated/prisma/client'.

### MinIO: community-образы

Официальные образы minio/minio и minio/mc были удалены с Docker Hub и Quay.io. В проекте используются форки:

- bigbeartechworld/big-bear-minio:latest — сервер MinIO
- netvark/mc:latest — клиент mc для инициализации бакета

Healthcheck MinIO проверяет HTTP-эндпоинт /minio/health/ready через curl, а не через mc ready local, потому что в форк-образе нет предварительно настроенного алиаса local.

### Docker: volumes, лимиты, зависимости

- Анонимные volumes: node_modules, .next и generated вынесены в анонимные volumes, чтобы не затирать их при монтировании исходников с хоста (./motit-site-next:/app).
- Лимиты для app: mem_limit: 4g и ulimits.nproc: 30000/30000 — для стабильной работы Next.js + Prisma во время сборки и dev-режима.
- Healthcheck app: проверяет http://localhost:3000/api/health с start_period: 120s.
- Healthcheck ws: отсутствует — для мониторинга используйте docker compose logs ws или внешний пробник на порт 3001.
- RAYON_NUM_THREADS: "4" в app.environment — ограничение параллелизма Rust-частей (например, SWC).

### Пароли в docker-compose.yml

В docker-compose.yml захардкожены:
```
MYSQL_ROOT_PASSWORD: root_local_dev
MYSQL_PASSWORD: MotitSecure2024! (и тот же пароль в DATABASE_URL / SHADOW_DATABASE_URL для app)
```
Для локальной разработки это допустимо. Для прода — заменить и вынести в .env / docker secrets.

## Миграция со Strapi

Проект полностью мигрирован со Strapi (папка motit-backend/ удалена).

| Было (Strapi) | Стало |
| --- | --- |
| Strapi API :1337 | Prisma + MySQL |
| strapi_jwt cookie | Auth.js sessions |
| users-permissions | Своя users + bcrypt |
| Upload local | MinIO / S3 |
| documentId в URL | Числовой id |
| components_blog_* | posts.content (Slate) |
| middleware.ts | proxy.ts (Next.js 16) |

## Продакшен

### 1. S3

Замените MinIO на реальный S3 (AWS, Cloudflare R2, Yandex Object Storage) в прод-.env:
```
S3_ENDPOINT="https://s3.amazonaws.com"
S3_REGION="eu-central-1"
S3_BUCKET="motit-uploads"
S3_ACCESS_KEY_ID="..."
S3_SECRET_ACCESS_KEY="..."
S3_PUBLIC_URL="https://motit-uploads.s3.amazonaws.com"
NEXT_PUBLIC_S3_URL="https://motit-uploads.s3.amazonaws.com"
```
### 2. next.config.ts

Добавьте прод-домен S3 в images.remotePatterns:
```
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
```
DATABASE_URL="mysql://user:pass@prod-host:3306/motit_site"
AUTH_SECRET="<openssl rand -base64 32>"
AUTH_URL="https://motit.by"
NEXTAUTH_URL="https://motit.by"
NEXT_PUBLIC_SITE_URL="https://motit.by"
```
### 4. Сборка и запуск

В проде — не dev, а production-сборка:
```
bun install --frozen-lockfile
bun run build
bun run start
```
В docker-compose.yml для прода замените command в сервисе app на:
```
    command: >
      sh -c "
      bunx prisma generate &&
      bunx prisma migrate deploy &&
      bunx prisma db seed &&
      bun run build &&
      bun run start
      "
    environment:
      NODE_ENV: production
```
⚠️ Важно: prisma db seed в проде создаст пользователя admin@local.dev с паролем admin123. Сразу после первого запуска смените пароль через админку или переопределите seed так, чтобы он брал email/пароль из переменных окружения:
```
const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@local.dev";
const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin123";
```
## Безопасность

- .env, .env.local, дампы БД, mysql creds.txt — никогда не коммитить (см. .gitignore).
- Все секреты — только в .env на сервере.
- Пароли — bcrypt.
- Auth.js — JWT с подписью AUTH_SECRET.
- SMTP_PASS (Gmail App Password) и AUTH_SECRET при утечке — немедленно отозвать и перегенерировать.
- Пароли MySQL (root_local_dev, MotitSecure2024!) захардкожены в docker-compose.yml — для прода заменить и вынести в секреты.

## Лицензия

Private. Все права защищены.
