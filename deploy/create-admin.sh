#!/bin/bash
# Создать админа Payload через API (работает в running web-контейнере)
# Использование: bash deploy/create-admin.sh rublestore@rublestore.ru 'rublestoreadmin!'
set -euo pipefail
cd "$(dirname "$0")/.."

EMAIL="${1:?email}"
PASSWORD="${2:?password}"

# Секрет из .env или дефолт dev (задайте CREATE_ADMIN_SECRET в production)
SECRET=$(grep -E '^CREATE_ADMIN_SECRET=|^SEED_SECRET=' .env 2>/dev/null | head -1 | cut -d= -f2-)
SECRET=${SECRET:-ruble-store-seed-dev-do-not-use-in-production}

ENC_EMAIL=$(python3 -c "import urllib.parse; print(urllib.parse.quote('''$EMAIL'''))")
ENC_PASS=$(python3 -c "import urllib.parse; print(urllib.parse.quote('''$PASSWORD'''))")

RESP=$(curl -sS "http://127.0.0.1:3001/api/create-admin?key=${SECRET}&email=${ENC_EMAIL}&password=${ENC_PASS}")
echo "$RESP"

if echo "$RESP" | grep -q '"ok":true'; then
  echo "Готово. Вход: https://www.rublestore.ru/admin"
  echo "Email: $EMAIL"
else
  echo "Ошибка. Если 404 — пересоберите web: docker compose up -d --build web"
  exit 1
fi
