# Настройка .env файлов

## Для запуска через Docker Compose (на сервере)

⚠️ **КРИТИЧЕСКИ ВАЖНО ДЛЯ БЕЗОПАСНОСТИ:**
- **НЕ открывайте порт PostgreSQL** во внешний интернет (5433 УДАЛЁН)
- **Используйте надёжные пароли** — минимум 32 символа
- **БД доступна только из контейнеров** через внутреннюю сеть Docker

**Нужен только один файл:** `.env` в корне репозитория (рядом с `docker-compose.yml`).

Создайте `/opt/RUBLESTORE_GLOBAL/.env`:

```env
# ============= БЕЗОПАСНОСТЬ =============
# Пароль БД (замените на надёжный, минимум 32 символа)
# Сгенерировать: openssl rand -base64 32
DB_PASSWORD=your-very-secure-password-min-32-chars-change-this

# Адрес сервера (замените на ваш)
PAYLOAD_PUBLIC_SERVER_URL=http://155.117.46.144:3001
NEXT_PUBLIC_API_URL=http://155.117.46.144:4000
CORS_ORIGIN=http://155.117.46.144:3001

# Секреты (замените на свои, минимум 32 символа)
PAYLOAD_SECRET=your-secret-key-min-32-chars-change-in-production
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=your-32-char-base64-key-change-this
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

**Примечание:** При локальном запуске МОЖНО открыть порт 5433 (это безопасно, так как на локальной машине).

## Резюме

| Режим запуска | Нужные .env файлы |
|---------------|-------------------|
| **Docker Compose** (сервер) | Только `.env` в корне |
| **Локально без Docker** | `apps/web/.env` + `apps/api/.env` |

---

## Быстрый старт на сервере

```bash
cd /opt/RUBLESTORE_GLOBAL

# Сгенерируйте надёжный пароль БД
DB_PASSWORD=$(openssl rand -base64 32)
echo "DB_PASSWORD=$DB_PASSWORD" > .env

# Добавьте остальные переменные
cat >> .env << 'EOF'
PAYLOAD_PUBLIC_SERVER_URL=http://155.117.46.144:3001
NEXT_PUBLIC_API_URL=http://155.117.46.144:4000
CORS_ORIGIN=http://155.117.46.144:3001
PAYLOAD_SECRET=your-secret-key-min-32-chars-change-in-production
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=your-32-char-base64-key-change-this
EOF

# Запуск (без открытия портов БД в интернет)
docker compose up -d --build
```

---

## Ошибка «Application error: a server-side exception has occurred»

На сервере посмотрите **реальную причину** в логах контейнера web:

```bash
docker compose logs web --tail 150
```

### Частые причины и решения:

1. **Нет доступа к БД** — проверьте, что контейнер `postgres` запущен:
   ```bash
   docker compose ps
   docker compose logs postgres --tail 50
   ```

2. **Ошибка пароля PostgreSQL** (`password authentication failed`) — возможные причины:
   - **Том БД был создан с другим паролем.** Решения:
     - **Если данные не нужны (dev):** 
       ```bash
       docker compose down -v
       docker compose up -d --build
       ```
     - **Если данные нужны (production):** подключитесь к postgres и измените пароль:
       ```bash
       docker compose up -d postgres
       sleep 5  # подождать запуск
       docker exec -it ruble-store-postgres psql -U postgres -d postgres \
         -c "ALTER USER postgres WITH PASSWORD 'ваш-новый-пароль';"
       ```
       Затем обновите `DB_PASSWORD` в `.env` и перезапустите контейнеры:
       ```bash
       docker compose up -d
       ```
   - **Переменная `DB_PASSWORD` не установлена в `.env`** — проверьте, что `DB_PASSWORD` есть в файле

3. **Колонка в БД не совпадает со схемой** — например `column products_colors.is_default does not exist`:
   ```bash
   docker compose run --rm web sh -c "NODE_OPTIONS='--no-experimental-fetch' pnpm --filter web db:migrate"
   ```

4. **SQL-injection атаки** — если видите странные SQL-команды в логах postgres:
   - БД открыта в интернет (проверьте, что используется `expose` вместо `ports`)
   - Используйте надёжный пароль (минимум 32 символа)
   - Регулярно проверяйте логи: `docker compose logs postgres | grep -i "error\|fatal"`

5. **Перезапуск контейнера** — каталог и шапка теперь используют Local API (без HTTP-запроса к себе), после деплоя страницы должны стабильно открываться.
