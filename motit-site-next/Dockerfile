# syntax=docker/dockerfile:1
FROM node:22-alpine

WORKDIR /app

# Зависимости — кэшируются, пока не менялись package.json/bun.lock
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# Исходники
COPY . .

EXPOSE 3000 3001

CMD ["npm", "run", "dev:turbopack"]
