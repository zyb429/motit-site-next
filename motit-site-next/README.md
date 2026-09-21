# motit-site-next

Сайт Motit на Next.js 16 с собственной админкой, helpdesk (обращения),
загрузкой файлов в S3-совместимое хранилище (MinIO) и MySQL в качестве БД.

Зависимости — [Bun](https://bun.sh). Единственный lock-файл — `bun.lock`.

## Стек

- **Next.js 16** (App Router, Server Components, React 19)
- **Prisma 6.19** + **MySQL 8** (локально, не в Docker)
- **NextAuth v5** (Credentials provider, роли: admin / worker / client / statistics)
- **MinIO** (S3-совместимое хранилище, локально в Docker)
- **Tailwind CSS 4**, Radix UI, lucide-react
- **TypeScript 5.9**

## Структура

```
motit-site-next/                     # корень репозитория
├─ docker-compose.yml                # MinIO + minio-init (MySQL — локальный!)
├─ README.md                         # этот файл
└─ motit-site-next/                  # приложение
   ├─ prisma/
   │  └─ schema.prisma               # схема БД
   ├─ public/                        # статика
   │  ├─ documents/
   │  ├─ images/
   │  └─ uploads/
   ├─ scripts/                       # разовые скрипты
   │  ├─ migrate-uploads.ts
   │  ├─ fix-content-type.ts
   │  └─ test-db.ts
   ├─ src/
   │  ├─ app/                        # App Router
   │  │  ├─ (site)/                  # публичная часть
   │  │  ├─ (account)/               # личный кабинет клиента
   │  │  ├─ (admin)/                 # админ-панель
   │  │  ├─ api/                     # REST API
   │  │  └─ layout.tsx
   │  ├─ components/                 # UI-компоненты
   │  ├─ hooks/                      # кастомные React-хуки
   │  ├─ lib/
   │  │  ├─ auth.ts                  # NextAuth + getCurrentUser()
   │  │  ├─ prisma.ts                # PrismaClient singleton
   │  │  ├─ s3.ts                    # S3/MinIO-клиент
   │  │  ├─ settings.ts              # настройки из БД
   │  │  ├─ bigint.ts                # сериализатор BigInt
   │  │  ├─ db/                      # доменные функции БД
   │  │  └─ tickets/                 # хелперы helpdesk
   │  ├─ proxy.ts                    # middleware
   │  └─ types/                      # next-auth.d.ts и пр.
   ├─ .env.example                   # шаблон переменных окружения
   ├─ eslint.config.mjs
   ├─ next.config.ts
   ├─ package.json
   ├─ postcss.config.mjs
   ├─ bun.lock
   └─ tsconfig.json
```

## Требования

- **Bun** >= 1.1 — package manager и раннер
- **MySQL 8** — установлен и запущен локально (не в Docker)
- **Docker** + **Docker Compose** — только для MinIO (S3)
- **Node.js** >= 20 — для некоторых CLI Prisma; сам проект на Bun

Проверить:

```bash
bun --version
mysql --version
docker --version
docker compose version
```

Если Docker не запущен:

```bash
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
# затем перелогиниться
```

Если MySQL не запущен:

```bash
# Arch
sudo systemctl enable --now mysqld

# Debian/Ubuntu
sudo systemctl enable --now mysql
```

## Быстрый старт

### 1. Клонировать и установить зависимости

```bash
git clone <url> motit-site-next
cd motit-site-next/motit-site-next
bun install
```

### 2. Подготовить MySQL (локально)

Если MySQL ещё не установлен:

```bash
# Arch
sudo pacman -S mysql
sudo systemctl enable --now mysqld
sudo mysql_secure_installation
```

Создай БД и пользователя:

```bash
sudo mysql -e "
  CREATE DATABASE motit_site
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_520_ci;
  CREATE USER 'motit_user'@'localhost' IDENTIFIED BY 'замени-на-свой-пароль';
  GRANT ALL PRIVILEGES ON motit_site.* TO 'motit_user'@'localhost';
  FLUSH PRIVILEGES;
"
```

Проверь, что подключаешься:

```bash
mysql -umotit_user -p motit_site -e "SHOW TABLES;"
```

### 3. Поднять MinIO (S3)

Из **корня репозитория** (там, где `docker-compose.yml`):

```bash
docker compose up -d
```

Проверить:

```bash
docker ps --filter name=motit-minio
curl -s http://localhost:9000/minio/health/live && echo " OK"
```

Ожидаемо: `motit-minio` — `Up`, `minio-init` — `Exited (0)` (это норма,
он одноразовый и создаёт бакет), `curl` → `OK`.

Остановить:

```bash
docker compose down          # остановить, данные сохранятся
docker compose down -v       # + удалить volume (файлы в MinIO пропадут)
```

### 4. Создать `.env`

```bash
cd motit-site-next
cp .env.example .env
```

Открой `.env` и заполни своими значениями. Минимально нужны:

```dotenv
USE_PRISMA="1"

# Server
HOST=0.0.0.0
PORT=3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# NextAuth
AUTH_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="<openssl rand -base64 32>"

# MySQL (локальный)
DATABASE_URL="mysql://motit_user:замени-на-свой-пароль@localhost:3306/motit_site"

# S3 / MinIO
S3_ENDPOINT="http://localhost:9000"
S3_REGION="us-east-1"
S3_BUCKET="motit-uploads"
S3_ACCESS_KEY_ID="minioadmin"
S3_SECRET_ACCESS_KEY="minioadmin"
S3_PUBLIC_URL="http://localhost:9000/motit-uploads"
S3_FORCE_PATH_STYLE="true"
NEXT_PUBLIC_S3_URL="http://localhost:9000/motit-uploads"

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=you@example.com
SMTP_PASS="<app-password>"
SMTP_FROM_NAME="Motit | Официальный сайт"
SMTP_FROM_EMAIL=you@example.com
CONTACT_EMAIL=you@example.com

# Help Desk (опционально)
HELP_DESK_TYPE=hesk_form
HESK_API_URL=https://help.example.com
HESK_API_TOKEN=
HESK_CATEGORY_ID=1
```

Полный список с комментариями — в `.env.example`. Файл `.env` уже в
`.gitignore`, **в репозиторий не коммитится**.

`AUTH_SECRET` сгенерируй так:

```bash
openssl rand -base64 32
```

⚠️ Если в пароле MySQL есть `!` или другие спецсимволы URL, экранируй их
(`!` → `%21`) либо используй пароль без них. Иначе Prisma не сможет
распарсить `DATABASE_URL`.

### 5. Накатить схему БД и засеять справочники

```bash
cd motit-site-next
bunx prisma generate
bunx prisma db push
bunx prisma db seed        # создаёт роли/статусы/приоритеты/категории/настройки
```

Проверить, что всё на месте:

```bash
bunx prisma studio     # откроется http://localhost:5555
```

В БД должны быть таблицы: `users`, `roles`, `users_role_lnk`, `statuses`,
`priorities`, `ticket_categories`, `tickets`, `ticket_comments`,
`ticket_attachments`, `files`, `settings` и др.

**Важно:** без `bunx prisma db seed` приложение не сможет создать ни одного
тикета — `createTicket()` ищет `statuses.code = 'OPEN'`, а её в пустой БД
нет.

### 6. Запустить dev-сервер

```bash
bun run dev
```

Открой [http://localhost:3000](http://localhost:3000).

## Первый вход

В свежей БД **нет пользователей**. Роли уже созданы сидом, а пользователя
нужно завести вручную.

### Вариант A — через Prisma Studio

```bash
bunx prisma studio
```

1. Таблица `roles` — убедись, что есть запись `name = "admin"` (сид её создаёт).
2. Таблица `users` — создай пользователя:
   - `uuid` — сгенерируй (`uuidgen` в терминале)
   - `username` — `admin`
   - `email` — свой
   - `password` — bcrypt-хэш пароля (см. ниже)
   - `is_active` — `true`
   - `blocked` — `false`
3. Таблица `users_role_lnk` — свяжи пользователя с ролью `admin`:
   - `user_id` — id из шага 2
   - `role_id` — id роли `admin`

### Вариант B — через SQL

```bash
mysql -umotit_user -p motit_site
```

```sql
-- пользователь (замени <hash> на bcrypt-хэш своего пароля)
INSERT INTO users (uuid, username, email, password, is_active, blocked, created_at, updated_at)
VALUES (UUID(), 'admin', 'admin@example.com', '<hash>', 1, 0, NOW(), NOW());

-- привязать роль admin (она уже создана сидом)
INSERT INTO users_role_lnk (user_id, role_id, created_at, updated_at)
SELECT u.id, r.id, NOW(), NOW()
FROM users u, roles r
WHERE u.username = 'admin' AND r.name = 'admin';
```

### Как получить bcrypt-хэш пароля

```bash
node -e "console.log(require('bcryptjs').hashSync('твой-пароль', 10))"
```

Скопируй вывод (`$2a$10$...`) в поле `password`.

Логин: `/login`, вводишь `admin` (или email) и пароль.

## Скрипты

```bash
bun run dev              # dev-сервер (http://localhost:3000)
bun run build            # production-сборка
bun run start            # запуск production-сборки
bun run lint             # ESLint

bunx prisma generate     # сгенерировать Prisma Client
bunx prisma studio       # веб-интерфейс к БД (http://localhost:5555)
bunx prisma db push      # применить схему без миграций (dev)
bunx prisma db seed      # засеять справочники
bunx prisma migrate dev  # создать и применить миграцию
bunx tsc --noEmit        # проверка типов без сборки
```

## Что есть в приложении

### Публичная часть

- `/` — главная
- `/posts`, `/authors/[username]` — блог и авторы
- `/login` — вход

### Личный кабинет (`/account`)

- `/account` — обзор (роль, контакты, счётчики)
- `/account/profile` — профиль (имя, телефон, bio, аватар)
- `/account/security` — смена пароля
- `/account/tickets` — список обращений
- `/account/tickets/new` — выбор категории
- `/account/tickets/new/[category]` — форма создания
- `/account/tickets/[uuid]` — карточка с перепиской и вложениями

### Админка (`/admin`)

- `/admin` — дашборд
- `/admin/posts`, `/admin/categories` — контент
- `/admin/users` — пользователи и роли
- `/admin/tickets` — все обращения с фильтрами
- `/admin/tickets/[uuid]` — карточка, смена статуса/приоритета/исполнителя,
  внутренние заметки
- `/admin/ticket-categories` — категории обращений
- `/admin/settings/upload` — whitelist MIME-типов для загрузки

### Служебные

- `/api/debug-prisma` — диагностика Prisma Client (только для админов):
  какие поля и relations видны в модели `ticket_attachments`

## Роли

- **admin** — полный доступ, включая настройки и пользователей
- **worker** — сотрудник helpdesk, видит все тикеты
- **client** — клиент, видит только свои тикеты
- **statistics** — доступ к статистике

Роль хранится в `users_role_lnk` → `roles.name`, маппится в `UserRole` через
`parseRole()` в `src/lib/auth.ts`.

## Загрузка файлов

- до 5 файлов за раз, до 10 МБ каждый
- MIME-типы проверяются по белому списку из настроек (таблица `settings`,
  ключ `upload.allowed_mime`)
- редактируется через `/admin/settings/upload`
- файлы кладутся в MinIO (bucket `motit-uploads`), метаданные — в таблицу
  `files`, связь с тикетами/комментариями — через `ticket_attachments`

## Разовые скрипты

В `motit-site-next/scripts/`:

- `migrate-uploads.ts` — перенос файлов из Strapi uploads в MinIO/S3.
  Запускается один раз при миграции
- `fix-content-type.ts` — исправление Content-Type у файлов, залитых
  с неправильным MIME
- `test-db.ts` — проверка подключения к MySQL

## Частые проблемы

### `Can't connect to local MySQL server through socket`

Локальный MySQL не запущен:

```bash
sudo systemctl start mysqld     # Arch
sudo systemctl start mysql      # Debian/Ubuntu
```

Проверить:

```bash
systemctl status mysqld
mysqladmin ping -umotit_user -p
```

### `Access denied for user 'motit_user'@'localhost'`

Пароль в `DATABASE_URL` не совпадает с реальным паролем MySQL:

```bash
mysql -umotit_user -p -e "SELECT 1;"
```

Если пароль забыт — сбрось:

```bash
sudo mysql -e "
  ALTER USER 'motit_user'@'localhost' IDENTIFIED BY 'новый-пароль';
  FLUSH PRIVILEGES;
"
```

### `Unknown database 'motit_site'`

БД не создана:

```bash
sudo mysql -e "
  CREATE DATABASE motit_site
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_520_ci;
"
bunx prisma db push
```

### `Cannot connect to the Docker daemon`

Docker не запущен (нужен для MinIO):

```bash
sudo systemctl start docker
```

### `ECONNREFUSED ::1:9000` при загрузке файла

MinIO не работает:

```bash
docker compose up -d
docker ps --filter name=motit-minio
curl -s http://localhost:9000/minio/health/live && echo " OK"
```

### `NoSuchBucket` или файлы не открываются

Бакет не создан или приватный. Проверить:

```bash
docker run --rm --network host \
  -e "MC_HOST_local=http://minioadmin:minioadmin@localhost:9000" \
  minio/mc ls local/
```

Если бакета нет:

```bash
docker run --rm --network host \
  -e "MC_HOST_local=http://minioadmin:minioadmin@localhost:9000" \
  minio/mc mb local/motit-uploads

docker run --rm --network host \
  -e "MC_HOST_local=http://minioadmin:minioadmin@localhost:9000" \
  minio/mc anonymous set download local/motit-uploads
```

### `AccessDenied` при загрузке

`S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` в `.env` не совпадают с
`MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` в `docker-compose.yml`. Приведи к
одному значению и перезапусти:

```bash
docker compose restart minio
# и заново bun run dev
```

### `PrismaClientInitializationError: Can't reach database server`

Обычно одна из трёх причин:

1. MySQL не запущен — см. выше
2. `DATABASE_URL` в `.env` указывает не туда (порт, хост, имя БД)
3. Пароль в URL не совпадает с реальным

Проверить:

```bash
grep DATABASE_URL motit-site-next/.env
mysql -umotit_user -p motit_site -e "SELECT 1;"
```

### Предупреждение `metadataBase property in metadata export is not set`

Не критично, но лучше поправить. В `src/app/layout.tsx`:

```ts
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  // ...
};
```

## Деплой

### Vercel

- Build Command: `bun run build`
- Output: `.next` (Next.js App Router)
- Env: перенести переменные из `.env` в настройки проекта
- БД: внешний MySQL (не контейнер)
- S3: внешний бакет (AWS S3, Cloudflare R2, Wasabi, Yandex Object Storage)

⚠️ `localhost:9000` в `S3_ENDPOINT` в проде не работает. Замени на реальный
адрес S3-хранилища. Аналогично `S3_PUBLIC_URL` и `NEXT_PUBLIC_S3_URL`.

### Prisma на проде

Не используй `db push` в проде. Локально создай миграцию и закоммить
`prisma/migrations/`, на проде примени:

```bash
bunx prisma migrate deploy
```

## Лицензия

Внутренний проект.
