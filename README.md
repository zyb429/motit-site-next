# Motit

Сайт с блогом и собственной админкой на Next.js. Раньше использовался Strapi, теперь — собственная админка, Prisma, Auth.js и S3.

## Стек

- **Next.js 16.4.2** — App Router, Turbopack (dev) / Webpack (build), React 19.3.1
- **TypeScript 5.9.3**
- **MySQL 8** + **Prisma 6.19.3** (`prisma-client-js`, `@prisma/client`)
- **Auth.js** (`next-auth@5.0.0-beta.32`, `@auth/core@0.41.3`) — Credentials provider
- **MinIO / S3** — медиа (`@aws-sdk/client-s3@3`, `@aws-sdk/s3-request-presigner`)
- **Redis 7** — pub/sub и presence в чатах (`ioredis@6`)
- **Socket.IO 4.8** — WebSocket-сервер (отдельный процесс, `server.ts`)
- **Tailwind CSS 4.3.3** (`@tailwindcss/postcss`) + `tailwindcss-animate`
- **Tiptap 3.32** — редактор постов (Simple Editor)
- **Slate 0.126** — альтернативный редактор (в процессе миграции)
- **Zod 4.6.7** — валидация
- **React Hook Form 7.90** + `@hookform/resolvers@5`
- **TanStack Query 5.104** — клиентский data-fetching

## Требования

- **Node.js 22+** (Next.js 16.4.2 требует Node `>=20.9`, но `concurrently@10` в `devDependencies` требует Node `>=22`; локально проверено на Node 24) + **npm** (lockfile — `package-lock.json`)
- **Bun** — только для запуска `npm run dev:all` (внутри скрипта используются `bun run ws` / `bun run dev`)
- Docker + docker compose

> Docker-образ приложения — на `node:22-alpine` (внутри контейнера используется `npx` / `npm run`).
> Локальная разработка — на Node/npm, см. раздел «Скрипты». Для `dev:all` нужен Bun; без Bun запускайте `npm run ws` и `npm run dev` в двух терминалах.

## Структура репозитория

```
motit-site-next/ ← корень монорепы
├── motit-site-next/ ← Next.js приложение
│ ├── prisma/
│ ├── scripts/
│ ├── src/
│ │ └── app/api/health/ ← healthcheck: live, ready, smtp, основной
│ ├── server.ts ← WebSocket-сервер (Socket.IO)
│ ├── Dockerfile ← образ на node:22-alpine
│ ├── .dockerignore
│ ├── .env.example
│ ├── package.json
│ └── package-lock.json ← npm lockfile
├── docker-compose.yml ← MySQL + Redis + MinIO + app + ws
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

Первый запуск — 2–5 минут (npm ci, prisma generate, миграции). Дальше — кэш, запуск за секунды.

**Порядок старта контейнеров:**

- `mysql` (healthy, `mysqladmin ping`) → `redis` (healthy, `redis-cli ping`) → `minio` (healthy, HTTP `/minio/health/ready`) → `minio-init` (создаёт бакет `motit-uploads` и делает его публичным на чтение через `mc anonymous set download`, затем завершается) → `app` (стартует только после `service_completed_successfully` у `minio-init`).
- `ws` стартует параллельно с `app`, ждёт только `redis` (healthy).

**Команда контейнера `app`:**

```
npx prisma generate &&
npx prisma migrate deploy &&
npm run dev:turbopack
```

**Команда контейнера `ws`:**

```
npx tsx server.ts
```

`NODE_ENV: development` для обоих сервисов (app и ws) в текущем compose.

После старта (контейнер app должен быть healthy):

```
docker compose exec app npx prisma db seed
```

Это создаст справочники (роли, статусы, приоритеты, категории тикетов, MIME-настройки) и admin-пользователя.

- Сайт — http://localhost:3000
- Health (полный) — http://localhost:3000/api/health
- Health (liveness) — http://localhost:3000/api/health/live
- Health (readiness) — http://localhost:3000/api/health/ready
- Health (SMTP, под Bearer) — http://localhost:3000/api/health/smtp
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
npm install
npm run dev:turbopack          # Next.js на :3000
npm run ws                     # WS на :3001 (в отдельном терминале)
```

Скрипты из `package.json`:

```json
"dev": "next dev",
"dev:webpack": "next dev --webpack",
"dev:turbopack": "next dev --turbopack",
"dev:all": "concurrently -n ws,next -c blue,green \"bun run ws\" \"bun run dev\"",
"ws": "npx tsx server.ts"
```

Или одной командой (нужен установленный **Bun**):

```
npm run dev:all
```

> Примечание: `dev:all` внутри использует `bun run ws` / `bun run dev`. На машине без Bun скрипт упадёт с `bun: command not found` — в этом случае запустите `npm run ws` и `npm run dev` в двух терминалах.

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
| HEALTH_TOKEN | Bearer-токен для /api/health/ready и /api/health/smtp (openssl rand -hex 32) |
| HEALTH_DETAILS | 1 — отдавать detail (текст ошибок) без токена. Только для локалки |

**Важно:** внутри Docker хосты mysql, redis, minio (имена сервисов). Для запуска на хосте — 127.0.0.1 с портами 3307 / 6379 / 9000.

**env_file и переопределения:** сервисы `app` и `ws` читают `./motit-site-next/.env` через `env_file`. Дополнительно в `environment` переопределяются:

- `app`: `DATABASE_URL`, `SHADOW_DATABASE_URL`, `REDIS_URL`, `S3_ENDPOINT`, `S3_PROXY_TARGET` — на имена docker-сервисов (`mysql`, `redis`, `minio`), плюс `NODE_ENV: development` и `RAYON_NUM_THREADS: "4"`;
- `ws`: `REDIS_URL`, `WS_PORT`, `NODE_ENV: development`.

**HESK_API_TOKEN:** нужно заполнить вручную — получить токен в админ-панели HESK. Без него интеграция Help Desk не заработает.

**Про shadow database:** SHADOW_DATABASE_URL используется только командой `prisma migrate dev` (запускается с хоста) и объявляется в `prisma/schema.prisma` (`datasource db { shadowDatabaseUrl = env("SHADOW_DATABASE_URL") }`). В контейнере `app` выполняется `prisma migrate deploy`, которому shadow database не нужна. База `motit_site_shadow` автоматически не создаётся — если планируете `migrate dev`, создайте её вручную и дайте `motit_user` права:

```
docker compose exec mysql mysql -uroot -proot_local_dev -e \
  "CREATE DATABASE IF NOT EXISTS motit_site_shadow; \
   GRANT ALL PRIVILEGES ON motit_site_shadow.* TO 'motit_user'@'%'; \
   FLUSH PRIVILEGES;"
```

**Про .env и секреты:** файл `motit-site-next/.env` никогда не коммитится — он в `.gitignore`. В репозитории хранится только `.env.example` без значений. Реальные секреты (`SMTP_PASS`, `AUTH_SECRET`, `HEALTH_TOKEN`, пароли БД и S3) держите только в локальном `.env` и в переменных окружения прода.

> ⚠️ В текущем `.env.example` в репозитории:
> - `NEXT_PUBLIC_SITE_URL` объявлен **дважды** (`https://motit.by` и `http://localhost:3000`) — оставьте одну строку;
> - `HEALTH_TOKEN` содержит **реальное значение** (`ebb6d572...`) — считайте его скомпрометированным и замените на своё (`openssl rand -hex 32`).
>
> Ниже — исправленный шаблон (один `NEXT_PUBLIC_SITE_URL`, пустой `HEALTH_TOKEN`).

### Шаблон .env.example

```dotenv
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

# Health-check
# openssl rand -hex 32
HEALTH_TOKEN=""
# 1 — отдавать detail (текст ошибок) без токена. Только для локалки!
HEALTH_DETAILS="0"
```

## Скрипты

| Команда | Что делает |
| --- | --- |
| npm run dev | Dev-сервер (Turbopack) |
| npm run dev:webpack | Dev-сервер (Webpack, для Docker) |
| npm run dev:all | Next.js + WS одновременно (`concurrently`, внутри — `bun run ws` + `bun run dev`; нужен Bun) |
| npm run build | Production-сборка (`prisma generate && next build --webpack`) |
| npm run start | Запуск production (`next start`) |
| npm run lint | ESLint (`eslint`) |
| npm run db:studio | Prisma Studio |
| npm run db:pull | Интроспекция схемы |
| npm run db:generate | Генерация Prisma Client |
| npm run db:push | Применить схему к БД |
| npm run db:migrate | Prisma migrate dev |
| npm run db:seed | Сиды (справочники + admin) |
| npm run ws | WebSocket-сервер (`npx tsx server.ts`) |
| npm run backfill:chats | Бэкфилл чатов (`npx tsx scripts/backfill-chats.ts`) |
| npm run backfill:status-history | Бэкфилл истории статусов (`npx tsx scripts/backfill-status-history.ts`) |
| docker compose exec app npx prisma db seed | Справочники + admin-пользователь (в Docker) |

## Архитектура

```
src/
├── app/
│   ├── (admin)/admin/    # Админка
│   ├── (auth)/login/     # Вход
│   ├── (site)/           # Публичный сайт
│   ├── (cabinet)/        # Личный кабинет
│   └── api/              # Route Handlers
│       └── health/       # healthcheck: live, ready, smtp, основной
├── components/
│   ├── admin/            # Sidebar, модалки
│   ├── auth/             # LogoutButton, формы
│   ├── blog/             # BlogCard, BlogPosts
│   └── ui/               # shadcn-компоненты
└── lib/
    ├── auth.ts           # Auth.js config
    ├── health.ts         # общие проверки (db, redis, s3, wsPubSub)
    ├── prisma.ts         # Prisma Client (singleton)
    ├── redis.ts          # Redis client (ioredis): redis + pubsub
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

Пароли — bcrypt (10 раундов, `bcryptjs@3`).

## Учётные записи по умолчанию

Создаются командой `prisma db seed`:

| Email | Пароль | Роль |
| --- | --- | --- |
| admin@local.dev | admin123 | admin |

Пароль хэшируется через bcrypt (bcryptjs, 10 раундов) — это соответствует проверке в `src/lib/auth.ts`, где используется `bcrypt.compare`. Хэширование через `Bun.password.hash` (argon2) не подойдёт: алгоритмы несовместимы.

⚠️ В продакшене сразу после первого запуска смените пароль admin через админку или переопределите seed так, чтобы он брал email/пароль из переменных окружения:

```
const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@local.dev";
const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin123";
```

## Медиа

Файлы хранятся в MinIO локально и в S3 на проде.

- Префиксы: `uploads/*` — посты, `avatars/*` — аватары.
- Записи — в таблице `files`.
- Связи: `posts.featured_image_id`, `users.avatar_id`.
- Локально S3 проксируется через `/files` (`S3_PUBLIC_URL="/files"`, `S3_PROXY_TARGET="http://localhost:9000/motit-uploads"` на хосте и `http://minio:9000/motit-uploads` внутри Docker), чтобы избежать CORS и проблем с прямыми ссылками на MinIO.
- `minio-init` делает бакет `motit-uploads` публичным на чтение (`mc anonymous set download`), поэтому ссылки на файлы открываются без подписи.

Для исправления Content-Type у старых файлов:

```
cd motit-site-next
npx tsx scripts/fix-content-type.ts
```

## Health-check

| Эндпоинт | Проверяет | Кто использует | Авторизация |
| --- | --- | --- | --- |
| `GET /api/health/live` | только процесс (uptime) | Docker `HEALTHCHECK` | нет |
| `GET /api/health` | db, redis, s3, wsPubSub (кэш 5s, без detail) | Внешний uptime-мониторинг | нет |
| `GET /api/health/ready` | то же, без кэша, с detail | Ручная диагностика | `Bearer $HEALTH_TOKEN` (опц.) |
| `GET /api/health/smtp` | SMTP-баннер (`220`) | Внутренний монитор почты | `Bearer $HEALTH_TOKEN` |
| `GET /api/health/metrics` | Prometheus-метрики (`health_check_status` + `health_check_latency_ms` по каждой проверке) | Grafana / Prometheus-скрейпер | `Bearer $HEALTH_TOKEN` |

Переменные:

- `HEALTH_TOKEN` — `openssl rand -hex 32`, включает detail и доступ к `/smtp`.
- `HEALTH_DETAILS=1` — отдавать detail без токена (только локалка!).

Пример:

```bash
curl -s http://localhost:3000/api/health | jq
curl -s -H "Authorization: Bearer $HEALTH_TOKEN" http://localhost:3000/api/health/ready | jq
curl -s -H "Authorization: Bearer $HEALTH_TOKEN" http://localhost:3000/api/health/metrics
```

Поведение при деградации: `/api/health/live` продолжает отдавать `200`, пока жив процесс; `/api/health` и `/api/health/ready` возвращают `503` с `detail` про упавшую зависимость. Поэтому `/live` используется в Docker `HEALTHCHECK` (не рестартует контейнер при падении MinIO/Redis), а `/api/health` — во внешнем мониторинге.

**Тайминги в `docker-compose.yml`:**

- `app`: `interval: 30s`, `timeout: 30s`, `retries: 5`, `start_period: 240s` — запас на первичную компиляцию роутов в dev-режиме.
- `ws`: TCP-коннект к `127.0.0.1:3001`, `interval: 30s`, `timeout: 5s`, `retries: 3`, `start_period: 30s`.

## Чат

Чат работает через WebSocket (Socket.IO) на отдельном процессе `server.ts` (порт 3001). Redis используется для pub/sub между инстансами.

Функции:

- Личные сообщения, группы, каналы
- Реакции, ответы, редактирование
- Закреплённые сообщения (для себя / для всех)
- Presence (кто онлайн)
- Файлы и медиа

## Особенности реализации

### Prisma v6 + Next.js

Используется стандартный генератор `prisma-client-js` без кастомного output — клиент генерируется в `node_modules/@prisma/client`. Версии — **`prisma` и `@prisma/client` 6.19.3**.

В `prisma/schema.prisma` обязательна опция:

```
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider          = "mysql"
  url               = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
}
```

Импорт в коде:

```ts
import { PrismaClient, Prisma } from "@prisma/client";
```

История: проект какое-то время был на Prisma 7 с драйвер-адаптером `@prisma/adapter-mariadb` и кастомным output `src/generated/prisma/`. Из-за нестабильности связки Prisma 7 + adapter + Next.js 16 (проблемы с WASM-компилятором запросов и генерацией) было принято решение откатиться на Prisma 6 + `prisma-client-js`, который стабильно работает с Next.js 16, Turbopack и Webpack.

> Примечание: абзац про `importFileExtension = "ts"` и `Module not found: Can't resolve '@generated/prisma/client'` относится **только к Prisma 7 с кастомным output** и в текущей конфигурации (Prisma 6, `prisma-client-js` без output) неактуален.

### MinIO: community-образы

Официальные образы `minio/minio` и `minio/mc` были удалены с Docker Hub и Quay.io. В проекте используются форки:

- `bigbeartechworld/big-bear-minio:latest` — сервер MinIO
- `netvark/mc:latest` — клиент `mc` для инициализации бакета

`minio-init` выполняет:

```
mc alias set local http://minio:9000 minioadmin minioadmin;
mc mb --ignore-existing local/motit-uploads;
mc anonymous set download local/motit-uploads;
```

Healthcheck MinIO проверяет HTTP-эндпоинт `/minio/health/ready` через `curl`, а не через `mc ready local`, потому что в форк-образе нет предварительно настроенного алиаса `local`.

### MySQL

Образ `mysql:8.0` с параметрами:

```
--character-set-server=utf8mb4
--collation-server=utf8mb4_unicode_520_ci
--default-authentication-plugin=mysql_native_password
```

Healthcheck — `mysqladmin ping -h 127.0.0.1 -uroot -proot_local_dev`, `interval: 5s`, `timeout: 5s`, `retries: 10`, `start_period: 30s`.

### Docker: volumes, лимиты, зависимости

- `Dockerfile` (образ `node:22-alpine`):
  - `COPY package.json package-lock.json ./` → `RUN npm ci`;
  - `EXPOSE 3000 3001`;
  - `CMD ["npm", "run", "dev:turbopack"]` (в compose `app` переопределяет `command`; `ws` использует `npx tsx server.ts`).
- Анонимные volumes: `node_modules`, `.next` и `generated` вынесены в анонимные volumes, чтобы не затирать их при монтировании исходников с хоста (`./motit-site-next:/app`). Для `ws` — `node_modules` и `generated`.
- Лимиты для `app`: `mem_limit: 4g` и `ulimits.nproc: 30000/30000` — для стабильной работы Next.js + Prisma во время сборки и dev-режима.
- Healthcheck `app`: `node -e fetch(...)`, `start_period: 240s`, `timeout: 30s`.
- Healthcheck `ws`: TCP-коннект к `127.0.0.1:3001` через `node -e` + `net.connect`, `start_period: 30s`.
- `RAYON_NUM_THREADS: "4"` в `app.environment` — ограничение параллелизма Rust-частей (например, SWC).
- `restart: unless-stopped` у всех сервисов (`mysql`, `minio`, `redis`, `app`, `ws`); у `minio-init` — не нужен (one-shot).

### ⚠️ Известные проблемы

1. **`NEXT_PUBLIC_SITE_URL` задублирован в текущем `.env.example`** — оставить одну строку (см. исправленный шаблон выше).
2. **`HEALTH_TOKEN` в текущем `.env.example` содержит реальное значение** — заменить на пустое и сгенерировать своё.
3. **`concurrently@10` требует Node `>=22`**, а Next.js 16 — `>=20.9`. Если нужен Node 20, придётся откатить `concurrently` до 9.x или запускать `ws` и `dev` раздельно.
4. **`dev:all` вызывает `bun run ws` / `bun run dev`** — на машине без Bun скрипт упадёт; используйте `npm run ws` и `npm run dev` раздельно.

### Пароли в docker-compose.yml

В `docker-compose.yml` захардкожены:

```
MYSQL_ROOT_PASSWORD: root_local_dev
MYSQL_PASSWORD: MotitSecure2024! (и тот же пароль в DATABASE_URL / SHADOW_DATABASE_URL для app)
MINIO_ROOT_USER: minioadmin
MINIO_ROOT_PASSWORD: minioadmin
```

Для локальной разработки это допустимо. Для прода — заменить и вынести в `.env` / docker secrets.

## Миграция со Strapi

Проект полностью мигрирован со Strapi (папка `motit-backend/` удалена).

| Было (Strapi) | Стало |
| --- | --- |
| Strapi API :1337 | Prisma + MySQL |
| strapi_jwt cookie | Auth.js sessions |
| users-permissions | Своя `users` + bcrypt |
| Upload local | MinIO / S3 |
| documentId в URL | Числовой id |
| components_blog_* | posts.content (Tiptap JSON) |
| middleware.ts | proxy.ts (Next.js 16) |

## Продакшен

### 1. S3

Замените MinIO на реальный S3 (AWS, Cloudflare R2, Yandex Object Storage) в прод-`.env`:

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

```
DATABASE_URL="mysql://user:pass@prod-host:3306/motit_site"
AUTH_SECRET="<openssl rand -base64 32>"
AUTH_URL="https://motit.by"
NEXTAUTH_URL="https://motit.by"
NEXT_PUBLIC_SITE_URL="https://motit.by"
HEALTH_TOKEN="<openssl rand -hex 32>"
HEALTH_DETAILS="0"
```

### 4. Сборка и запуск

В проде — не dev, а production-сборка:

```
npm ci
npm run build
npm run start
```

В `docker-compose.yml` для прода замените `command` в сервисе `app` на:

```
    command: >
      sh -c "
      npx prisma generate &&
      npx prisma migrate deploy &&
      npx prisma db seed &&
      npm run build &&
      npm run start
      "
    environment:
      NODE_ENV: production
```

⚠️ Важно: `prisma db seed` в проде создаст пользователя `admin@local.dev` с паролем `admin123`. Сразу после первого запуска смените пароль через админку или переопределите seed так, чтобы он брал email/пароль из переменных окружения:

```
const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@local.dev";
const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin123";
```

В проде healthcheck `app` можно вернуть к более строгим таймингам (`timeout: 10s`, `start_period: 60s`), так как роуты уже скомпилированы `next build`.

## Безопасность

- `.env`, `.env.local`, дампы БД, `mysql creds.txt` — никогда не коммитить (см. `.gitignore`).
- Все секреты — только в `.env` на сервере.
- Пароли — bcrypt.
- Auth.js — JWT с подписью `AUTH_SECRET`.
- `SMTP_PASS` (Gmail App Password), `AUTH_SECRET`, `HEALTH_TOKEN` при утечке — немедленно отозвать и перегенерировать.
- Пароли MySQL (`root_local_dev`, `MotitSecure2024!`) и MinIO (`minioadmin`/`minioadmin`) захардкожены в `docker-compose.yml` — для прода заменить и вынести в секреты.
- Health-check: `detail` (текст ошибок) отдаётся только при `HEALTH_DETAILS=1` или с `Authorization: Bearer $HEALTH_TOKEN`. В проде — `HEALTH_DETAILS=0`.

## Лицензия

Private. Все права защищены.