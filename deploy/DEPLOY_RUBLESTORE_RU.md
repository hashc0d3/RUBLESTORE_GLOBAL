# Развёртывание на www.rublestore.ru (HTTPS)

Сервер: `root@debian-for-tests`, проект: `/opt/RUBLESTORE_GLOBAL`.

По аналогии с **vegan-skupka**: Docker Compose + Nginx reverse proxy + Certbot.

---

## 0. DNS (у регистратора домена)

| Тип | Имя | Значение |
|-----|-----|----------|
| A | `@` | IP вашего сервера (например `155.117.46.144`) |
| A | `www` | тот же IP |

Проверка с вашего ПК:

```bash
dig +short www.rublestore.ru
dig +short rublestore.ru
```

Оба должны вернуть IP сервера.

---

## 1. Подключиться к серверу

```bash
ssh root@debian-for-tests
cd /opt/RUBLESTORE_GLOBAL
```

---

## 2. Обновить код из GitHub

```bash
git fetch origin
git pull origin main
```

Если репозиторий ещё не клонирован:

```bash
apt-get update && apt-get install -y git
mkdir -p /opt/RUBLESTORE_GLOBAL
cd /opt
git clone https://github.com/hashc0d3/RUBLESTORE_GLOBAL.git RUBLESTORE_GLOBAL
cd /opt/RUBLESTORE_GLOBAL
```

---

## 3. Файл `.env` (обязательно перед сборкой)

Если `.env` уже был — **обновите URL на HTTPS** (без `:3001`):

```bash
nano /opt/RUBLESTORE_GLOBAL/.env
```

Минимум для домена (подставьте свои секреты, не копируйте примеры буквально):

```env
DB_PASSWORD=<ваш-существующий-или-новый-пароль-32+>

PAYLOAD_PUBLIC_SERVER_URL=https://www.rublestore.ru
NEXT_PUBLIC_API_URL=https://www.rublestore.ru/store-api
CORS_ORIGIN=https://www.rublestore.ru

PAYLOAD_SECRET=<минимум-32-символа>
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=<base64-32-байта>
```

Шаблон: `deploy/env.production.example`.

**Важно:** `NEXT_PUBLIC_*` и build-args зашиваются при `docker compose build`. После смены URL нужен пересбор:

```bash
docker compose up -d --build
```

Если меняете только `DB_PASSWORD` и том Postgres уже создан — см. [docs/ENV_SETUP.md](../docs/ENV_SETUP.md) (смена пароля в БД).

Проверка:

```bash
bash scripts/security-check.sh
```

---

## 4. Docker: сборка и запуск

```bash
cd /opt/RUBLESTORE_GLOBAL
docker compose down
docker compose up -d --build
docker compose ps
docker compose logs -f web
```

Дождитесь статуса `Up` у `ruble-store-web` (первый запуск 5–15 минут).

Локально на сервере:

```bash
curl -sI http://127.0.0.1:3001 | head -5
```

---

## 5. Nginx (как у vegan-skupka)

```bash
apt-get update
apt-get install -y nginx certbot python3-certbot-nginx

cp /opt/RUBLESTORE_GLOBAL/deploy/nginx/rublestore.ru.conf /etc/nginx/sites-available/rublestore.ru

ln -sf /etc/nginx/sites-available/rublestore.ru /etc/nginx/sites-enabled/rublestore.ru
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl reload nginx
```

Проверка по HTTP (до сертификата):

```bash
curl -sI -H "Host: www.rublestore.ru" http://127.0.0.1/ | head -5
```

---

## 6. SSL (Let's Encrypt)

```bash
certbot --nginx -d www.rublestore.ru -d rublestore.ru
```

Следуйте подсказкам (email, согласие). Certbot сам добавит `listen 443 ssl` в конфиг.

Проверка автообновления:

```bash
certbot renew --dry-run
```

---

## 7. Firewall

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
ufw status
```

Порты **3001** и **4000** наружу можно не открывать — доступ только через Nginx (80/443). Контейнеры слушают `127.0.0.1` (см. `docker-compose.yml`).

---

## 8. Проверка в браузере

- https://www.rublestore.ru — витрина  
- https://www.rublestore.ru/admin — админка Payload  

При ошибке «Application error»:

```bash
docker compose logs web --tail 150
docker compose logs postgres --tail 50
```

Миграции вручную:

```bash
docker compose exec web pnpm --filter web db:migrate
```

---

## 9. Обновление после изменений в репозитории

```bash
cd /opt/RUBLESTORE_GLOBAL
git pull origin main
docker compose up -d --build
```

Или:

```bash
bash deploy/redeploy.sh
```

---

## Сверка с vegan-skupka на том же сервере

```bash
ls -la /etc/nginx/sites-enabled/
cat /etc/nginx/sites-enabled/*vegan*   # или sites-available
ls /opt/ | grep -i vegan
```

Обычно та же схема: `/opt/<проект>`, `docker compose`, конфиг в `/etc/nginx/sites-available/`, `certbot --nginx`.

---

## Частые проблемы

| Симптом | Решение |
|---------|---------|
| 502 Bad Gateway | `docker compose ps`, логи `web`, `curl http://127.0.0.1:3001` |
| Сертификат не выдаётся | DNS, порты 80/443, `ufw`, нет другого веб-сервера на 80 |
| Админка / Server Actions | задайте `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`, пересоберите web |
| Картинки пропали | том `web_media` — не делайте `docker compose down -v` на production |
| CORS / API | `CORS_ORIGIN` = `https://www.rublestore.ru`, пересборка после смены |
