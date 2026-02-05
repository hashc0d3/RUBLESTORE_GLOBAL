# Build from monorepo root: docker build -f apps/web/Dockerfile .
FROM node:20-alpine AS base
# Установка pnpm через npm (обход проблем corepack с registry на сервере)
RUN npm install -g pnpm@9
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
# Копируем только нужные файлы для сборки (ускоряет)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/web ./apps/web
COPY apps/api/package.json ./apps/api/
COPY packages ./packages
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ARG PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV PAYLOAD_PUBLIC_SERVER_URL=$PAYLOAD_PUBLIC_SERVER_URL
ENV PAYLOAD_DISABLE_PUSH=true
# Dummy for build (migrate runs at start)
ENV DATABASE_URL=postgresql://postgres:postgres@postgres:5432/ruble_store
ENV PAYLOAD_SECRET=build-time-secret-min-32-characters-long
RUN pnpm --filter web build

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV NODE_OPTIONS="--no-experimental-fetch"
# Копируем только production зависимости (меньше размер)
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
# Собранный Next.js
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
# Для миграций Payload нужны исходники и конфиги
COPY --from=builder /app/apps/web/src ./apps/web/src
COPY --from=builder /app/apps/web/package.json ./apps/web/
COPY --from=builder /app/apps/web/next.config.ts ./apps/web/
COPY --from=builder /app/apps/web/tsconfig.json ./apps/web/
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
WORKDIR /app
EXPOSE 3000
# Миграции при старте (при ошибке всё равно запускаем Next.js, чтобы сайт открывался)
# -H 0.0.0.0 — слушать снаружи контейнера (иначе только localhost)
CMD ["sh", "-c", "pnpm --filter web db:migrate || true && pnpm --filter web start -- -H 0.0.0.0"]
