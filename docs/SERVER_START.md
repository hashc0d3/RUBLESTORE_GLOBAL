# Запуск на сервере

## Вариант 1: Всё через Docker Compose (один терминал)

Из корня репозитория. В `.env` в корне (или в `apps/web/.env` / `apps/api/.env`) можно задать переменные для хоста; в контейнерах БД доступна как `postgres:5432`.

```bash
docker compose up -d --build
```

Поднимаются: Postgres (порт 5433 на хосте), API (4000), Web (3000). Миграции Payload выполняются при старте контейнера web.

- Сайт: http://155.117.46.144:3000  
- API: http://155.117.46.144:4000  

**Если :3000 не открывается (ERR_CONNECTION_REFUSED)** — на сервере выполните по порядку:

1. Контейнеры запущены и web не падает:
   ```bash
   cd /opt/RUBLESTORE_GLOBAL
   docker compose ps
   ```
   У контейнера `ruble-store-web` должен быть статус `Up` (не `Restarting`).

2. Логи web (ошибки миграций или Next.js):
   ```bash
   docker compose logs --tail 100 web
   ```

3. Порт 3000 слушается на хосте:
   ```bash
   ss -tlnp | grep 3000
   # или: netstat -tlnp | grep 3000
   ```
   Должна быть строка с `*:3000` или `0.0.0.0:3000`.

4. Фаервол (Debian/Ubuntu) — откройте порты:
   ```bash
   sudo ufw status
   sudo ufw allow 3000
   sudo ufw allow 4000
   sudo ufw reload
   ```

5. После правок перезапуск:
   ```bash
   docker compose up -d --build web
   ```

**Если сборка падает с ошибкой загрузки с registry.npmjs.org** — на сервере должен быть доступ в интернет по HTTPS (для установки pnpm и зависимостей). Проверьте: `docker run --rm node:20-alpine npm ping` или откройте исходящий доступ к `registry.npmjs.org`. Альтернатива: соберите образ на машине с интернетом (`docker compose build`), сохраните (`docker save`), перенесите на сервер и загрузите (`docker load`).

Для сервера по IP задайте в `.env`:
```env
PAYLOAD_PUBLIC_SERVER_URL=http://155.117.46.144
NEXT_PUBLIC_API_URL=http://155.117.46.144:4000
CORS_ORIGIN=http://155.117.46.144
```
и пересоберите: `docker compose up -d --build`.

---

## Вариант 2: Без Docker (локально или на сервере)

После того как заполнены `apps/web/.env` и `apps/api/.env`:

1. **Postgres:** `pnpm docker:up` или `docker compose up -d` (только postgres).
2. **Зависимости:** `pnpm install`
3. **Миграции:** `pnpm --filter web db:migrate`
4. **Сборка:** `pnpm build`
5. **Запуск:** в двух терминалах — `pnpm start:api` и `pnpm start:web`.

Для доступа по 80 порту без :3000 настройте nginx как reverse proxy на `localhost:3000` и при необходимости на `localhost:4000`.
