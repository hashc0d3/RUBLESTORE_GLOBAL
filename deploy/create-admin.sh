#!/bin/bash
# Создать админа Payload на сервере
# Использование: bash deploy/create-admin.sh rublestore@rublestore.ru 'rublestoreadmin!'
set -euo pipefail
cd "$(dirname "$0")/.."

EMAIL="${1:?email}"
PASSWORD="${2:?password}"

docker compose exec web mkdir -p /app/apps/web/scripts
docker cp apps/web/scripts/create-admin.ts ruble-store-web:/app/apps/web/scripts/create-admin.ts

docker compose exec web sh -c \
  "cd /app && pnpm dlx tsx apps/web/scripts/create-admin.ts '${EMAIL}' '${PASSWORD}'"
