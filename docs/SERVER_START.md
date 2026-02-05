# Запуск на сервере

## Вариант 1: Всё через Docker Compose (один терминал)

Из корня репозитория. В `.env` в корне (или в `apps/web/.env` / `apps/api/.env`) можно задать переменные для хоста; в контейнерах БД доступна как `postgres:5432`.

```bash
docker compose up -d --build
```

Поднимаются: Postgres (порт 5433 на хосте), API (4000), Web (3000). Миграции Payload выполняются при старте контейнера web.

- Сайт: http://155.117.46.144:3000  
- API: http://155.117.46.144:4000  

**Если :3000 не открывается** — откройте порты на сервере (Debian/Ubuntu):
```bash
sudo ufw allow 3000
sudo ufw allow 4000
sudo ufw reload
```
Проверка логов web: `docker compose logs -f web`.

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
