# syntax=docker/dockerfile:1

# ---------- Базовый слой (общий для dev и prod) ----------
FROM node:22-alpine AS base
RUN apk add --no-cache openssl
WORKDIR /app

# Зависимости — кэшируются, пока не менялись package.json/package-lock.json
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --legacy-peer-deps

# Prisma Client — генерируем один раз, чтобы был во всех слоях
COPY prisma ./prisma
RUN npx prisma generate

# Исходники
COPY . .


# ---------- DEV (hot-reload, bind mount из compose) ----------
FROM base AS dev
ENV NODE_ENV=development
EXPOSE 3000 3001
CMD ["npm", "run", "dev:turbopack"]


# ---------- PROD (сборка + запуск) ----------
FROM base AS prod
ENV NODE_ENV=production
# Next.js собирается здесь — БД на этапе build не должна быть нужна
# (убедитесь, что generateStaticParams для blog/[slug] удалён)
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]