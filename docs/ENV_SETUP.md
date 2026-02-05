# Настройка .env файлов

## Для запуска через Docker Compose (на сервере)

**Нужен только один файл:** `.env` в корне репозитория (рядом с `docker-compose.yml`).

Создайте `/opt/RUBLESTORE_GLOBAL/.env`:

```env
# Адрес сервера (замените на ваш)
PAYLOAD_PUBLIC_SERVER_URL=http://155.117.46.144:3001
NEXT_PUBLIC_API_URL=http://155.117.46.144:4000
CORS_ORIGIN=http://155.117.46.144:3001

# Секреты (замените на свои)
PAYLOAD_SECRET=ваш-секрет-не-меньше-32-символов-длинный
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=любая-строка-ровно-32-символа
```

**Важно:** Docker Compose автоматически читает переменные из корневого `.env` и подставляет их в `docker-compose.yml` через `${VAR_NAME}`.

Файлы `apps/web/.env` и `apps/api/.env` **НЕ используются** при запуске через Docker — они нужны только для локального запуска без Docker.

---

## Для локального запуска без Docker (на вашей машине)

Если запускаете через `pnpm start:web` и `pnpm start:api` (без Docker), нужны:

### 1. `apps/web/.env`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/ruble_store
PAYLOAD_SECRET=ваш-секрет-не-меньше-32-символов
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3001
PAYLOAD_DISABLE_PUSH=true
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=любая-строка-32-символа
```

### 2. `apps/api/.env`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/ruble_store
PORT=4000
CORS_ORIGIN=http://localhost:3001
```

---

## Резюме

| Режим запуска | Нужные .env файлы |
|---------------|-------------------|
| **Docker Compose** (сервер) | Только `.env` в корне |
| **Локально без Docker** | `apps/web/.env` + `apps/api/.env` |

---

## Быстрый старт на сервере

```bash
cd /opt/RUBLESTORE_GLOBAL

# Создайте .env (если ещё нет)
cat > .env << 'EOF'
PAYLOAD_PUBLIC_SERVER_URL=http://155.117.46.144:3001
NEXT_PUBLIC_API_URL=http://155.117.46.144:4000
CORS_ORIGIN=http://155.117.46.144:3001
PAYLOAD_SECRET=ваш-секрет-не-меньше-32-символов-длинный
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=любая-строка-ровно-32-символа
EOF

# Запуск
docker compose up -d --build
```
