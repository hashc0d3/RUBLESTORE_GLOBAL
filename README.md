# Ruble Store

Интернет-магазин: Next.js + NestJS + Payload CMS + PostgreSQL + FSD + MobX.

## Стек

- **Frontend:** Next.js 15 (App Router), Payload CMS (админка и контент), Tailwind CSS, MobX, Feature-Sliced Design
- **API:** NestJS, TypeORM, PostgreSQL
- **БД:** PostgreSQL (один инстанс; Payload и NestJS используют свои таблицы)

## Структура монорепозитория

```
├── apps/
│   ├── web/          # Next.js + Payload (FSD в src/)
│   └── api/          # NestJS REST API
├── packages/
│   └── shared/       # Общие типы и константы
├── docker-compose.yml
└── pnpm-workspace.yaml
```

### FSD в `apps/web/src`

- `app-layer` — провайдеры, инициализация приложения
- `pages` — страницы (композиция виджетов и фич)
- `widgets` — крупные блоки UI
- `features` — фичи (корзина, авторизация и т.д.)
- `entities` — сущности (Product и т.д.)
- `shared` — конфиг, утилиты, UI-кит

## Быстрый старт

### 1. Установка зависимостей

```bash
pnpm install
```

### 2. PostgreSQL

```bash
pnpm docker:up
```

Или установи PostgreSQL локально и создай БД `ruble_store`.

### 3. Переменные окружения

```bash
cp .env.example .env
# Отредактируй .env (PAYLOAD_SECRET и при необходимости DATABASE_URL)
```

### 4. Запуск

**Вариант A — всё сразу (корень монорепо):**

```bash
pnpm dev
```

**Вариант B — по отдельности:**

```bash
# Терминал 1: Next.js + Payload (порт 3000)
pnpm dev:web

# Терминал 2: NestJS API (порт 4000)
pnpm dev:api
```

### 5. Таблицы Payload (если админка отдаёт 404 при 200 в Network)

Если `/admin` возвращает 200 в Network, но на экране видна страница 404, чаще всего нет таблиц в БД. Создай миграции и примени их:

```bash
cd apps/web
pnpm db:migrate:create   # создать миграцию (имя можно не указывать)
pnpm db:migrate         # применить миграции
```

Либо в dev Payload сам создаёт схему при первом запросе (push) — убедись, что PostgreSQL запущен и `DATABASE_URL` в `.env` верный.

### 6. Сидирование (после перезапуска БД)

Если после перезапуска PostgreSQL категории и товары пропали, заполни БД начальными данными:

```bash
cd apps/web
# По умолчанию ключ: ruble-store-seed-dev-do-not-use-in-production
curl "http://localhost:3000/api/seed?key=ruble-store-seed-dev-do-not-use-in-production"
```

Либо задай в `.env` переменную `SEED_SECRET` и передай её в параметре `key`. Маршрут создаёт категории iPhone, AirPods, Аксессуары и несколько тестовых товаров (товары добавляются только если в БД их ещё нет).

### 7. Открыть в браузере

- Сайт и админка Payload: [http://localhost:3000](http://localhost:3000)
- Админ-панель Payload: [http://localhost:3000/admin](http://localhost:3000/admin)
- API (health): [http://localhost:4000/health](http://localhost:4000/health)

При первом заходе в `/admin` создай пользователя админки.

## Полезные команды

| Команда | Описание |
|--------|----------|
| `pnpm dev` | Запуск web + api параллельно |
| `pnpm dev:web` | Только Next.js + Payload |
| `pnpm dev:api` | Только NestJS API |
| `pnpm build` | Сборка всех приложений |
| `pnpm db:studio` | Payload Admin (из корня: `pnpm --filter web db:studio`) |
| `pnpm docker:up` | Поднять PostgreSQL в Docker |
| `pnpm docker:down` | Остановить контейнеры |

## Apple UI

В проекте подключён Tailwind с системным шрифтом в стиле Apple (`-apple-system`, SF Pro). Для полноценной «Apple UI» библиотеки можно добавить позже, например:

- [react-cupertino](https://github.com/vldmrkl/react-cupertino) (архив)
- [SmoothUI](https://smoothui.dev/) — компоненты в стиле Apple
- Или кастомные компоненты на Tailwind + Framer Motion

## Дальнейшие шаги

1. Настроить коллекции Payload под каталог товаров и заказы.
2. Добавить страницы каталога и карточки товара в `apps/web` (FSD).
3. Подключить MobX-сторы к страницам и виджетам.
4. Реализовать заказы и оплату в NestJS API.
5. Добавить авторизацию (JWT/Cookies) между фронтом и API.
