#!/bin/bash
# Создать админа Payload через API (работает в running web-контейнере)
# Использование: bash deploy/create-admin.sh rublestore@rublestore.ru 'rublestoreadmin!'
set -euo pipefail
cd "$(dirname "$0")/.."

EMAIL="${1:?email}"
PASSWORD="${2:?password}"

# Секрет из контейнера web (должен совпадать с CREATE_ADMIN_SECRET в docker-compose)
SECRET=$(docker compose exec -T web sh -c \
  'printf "%s" "${CREATE_ADMIN_SECRET:-${SEED_SECRET:-ruble-store-seed-dev-do-not-use-in-production}}"' \
  | tr -d '\r\n')

ENC_EMAIL=$(python3 -c "import urllib.parse; print(urllib.parse.quote('''$EMAIL'''))")
ENC_PASS=$(python3 -c "import urllib.parse; print(urllib.parse.quote('''$PASSWORD'''))")

RESP=$(curl -sS "http://127.0.0.1:3001/api/create-admin?key=${SECRET}&email=${ENC_EMAIL}&password=${ENC_PASS}")
echo "$RESP"

if echo "$RESP" | grep -q '"ok":true'; then
  echo "Готово. Вход: https://www.rublestore.ru/admin"
  echo "Email: $EMAIL"
else
  echo "Ошибка. Проверьте ключ: docker compose exec web printenv CREATE_ADMIN_SECRET"
  exit 1
fi
