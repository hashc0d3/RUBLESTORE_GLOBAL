# Build from monorepo root: docker build -f apps/web/Dockerfile .
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.14.2 --activate
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
COPY . .
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
COPY --from=builder /app .
WORKDIR /app
EXPOSE 3000
# Миграции при каждом старте (идемпотентно), затем Next.js
CMD ["sh", "-c", "pnpm --filter web db:migrate && pnpm --filter web start"]
