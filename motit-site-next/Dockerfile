# Dockerfile
FROM oven/bun:1

WORKDIR /app

# Зависимости — кэшируются, пока не менялись package.json/bun.lock
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Исходники
COPY . .

EXPOSE 3000 3001

CMD ["bun", "run", "dev:webpack"]
