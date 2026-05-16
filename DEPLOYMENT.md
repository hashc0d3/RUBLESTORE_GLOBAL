# 🚀 Инструкция развёртывания на сервер

## Подготовка сервера

### 1. Установить Docker и Docker Compose

```bash
# Для Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Проверить версию
docker --version
docker compose version
```

### 2. Создать директорию проекта

```bash
sudo mkdir -p /opt/RUBLESTORE_GLOBAL
sudo chown -R $(whoami):$(whoami) /opt/RUBLESTORE_GLOBAL
cd /opt/RUBLESTORE_GLOBAL
```

### 3. Установить Git и клонировать репозиторий

```bash
git clone https://github.com/your-org/ruble-store.git .
cd /opt/RUBLESTORE_GLOBAL
```

## Конфигурация безопасности

### 4. Генерировать надёжные пароли

```bash
# Генерируем три надёжных пароля (32+ символа)
DB_PASSWORD=$(openssl rand -base64 32)
PAYLOAD_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -base64 32)

echo "=== СОХРАНИТЕ ЭТИ ЗНАЧЕНИЯ В БЕЗОПАСНОЕ МЕСТО ==="
echo "DB_PASSWORD=$DB_PASSWORD"
echo "PAYLOAD_SECRET=$PAYLOAD_SECRET"
echo "NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=$ENCRYPTION_KEY"
echo "=================================================="
```

### 5. Создать файл .env

```bash
cat > /opt/RUBLESTORE_GLOBAL/.env << EOF
# ========== БЕЗОПАСНОСТЬ ==========
# Пароль БД (ЗАМЕНИТЕ на сгенерированный выше!)
DB_PASSWORD=$DB_PASSWORD

# ========== ДОМЕННЫЕ ИМЕНА ==========
# Замените на реальный адрес вашего сервера
PAYLOAD_PUBLIC_SERVER_URL=http://your-domain.com:3001
NEXT_PUBLIC_API_URL=http://your-domain.com:4000
CORS_ORIGIN=http://your-domain.com:3001

# ========== СЕКРЕТЫ ==========
# Замените на сгенерированные выше!
PAYLOAD_SECRET=$PAYLOAD_SECRET
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=$ENCRYPTION_KEY
EOF

# Проверить содержимое (ВАЖНО!)
cat .env
```

**⚠️ ВАЖНО:** Если вы видите `change-me-in-production` или пустые значения — ИСПРАВЬТЕ ЭТО перед запуском!

### 6. Проверить безопасность перед развёртыванием

```bash
bash scripts/security-check.sh
```

Скрипт должен выдать: `✅ ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ - ГОТОВО К РАЗВЁРТЫВАНИЮ`

## Развёртывание

### 7. Запустить приложение

```bash
cd /opt/RUBLESTORE_GLOBAL

# Собрать и запустить контейнеры
docker compose up -d --build

# Проверить статус
docker compose ps

# Проверить логи (первый запуск может занять 5-10 минут)
docker compose logs -f web
```

Готово! Приложение доступно по адресам:
- **Сайт:** http://your-domain.com:3001
- **Админ-панель:** http://your-domain.com:3001/admin
- **API:** http://your-domain.com:4000

### 8. Создать администратора (первый запуск)

Откройте в браузере: http://your-domain.com:3001/admin

Система предложит создать первого администратора.

## Настройка резервного копирования

### 9. Создать скрипт резервного копирования

```bash
mkdir -p /backup
cat > /opt/RUBLESTORE_GLOBAL/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backup"
TIMESTAMP=$(date +\%Y\%m\%d-\%H\%M\%S)
BACKUP_FILE="$BACKUP_DIR/postgres-backup-$TIMESTAMP.sql.gz"

docker exec ruble-store-postgres pg_dump -U postgres -d ruble_store | \
    gzip > "$BACKUP_FILE"

# Оставить только последние 7 резервных копий
cd "$BACKUP_DIR"
ls -t postgres-backup-*.sql.gz 2>/dev/null | tail -n +8 | xargs rm -f

echo "✅ Резервная копия: $BACKUP_FILE"
EOF

chmod +x /opt/RUBLESTORE_GLOBAL/backup-db.sh
```

### 10. Добавить в crontab (ежедневный бекап в 2:00 AM)

```bash
# Отредактировать crontab от root
sudo crontab -e

# Добавить строку:
0 2 * * * /opt/RUBLESTORE_GLOBAL/backup-db.sh >> /var/log/postgres-backup.log 2>&1

# Проверить
sudo crontab -l
```

## Настройка Nginx + HTTPS (production)

### 11. Домен rublestore.ru

Пошаговая инструкция для **www.rublestore.ru**: [deploy/DEPLOY_RUBLESTORE_RU.md](./deploy/DEPLOY_RUBLESTORE_RU.md).

Готовый конфиг Nginx: [deploy/nginx/rublestore.ru.conf](./deploy/nginx/rublestore.ru.conf).

**Важно:** маршрут `/api` обслуживает **Payload** внутри контейнера web. Не проксируйте `/api` на NestJS (порт 4000). NestJS при необходимости выносите на префикс `/store-api/` (см. конфиг в `deploy/nginx/`).

Кратко:

```bash
sudo apt-get update && sudo apt-get install -y nginx certbot python3-certbot-nginx
sudo cp deploy/nginx/rublestore.ru.conf /etc/nginx/sites-available/rublestore.ru
sudo ln -sf /etc/nginx/sites-available/rublestore.ru /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d www.rublestore.ru -d rublestore.ru
```

## Мониторинг

### 12. Настроить мониторинг (опционально)

```bash
# Простой скрипт для проверки здоровья
cat > /opt/RUBLESTORE_GLOBAL/health-check.sh << 'EOF'
#!/bin/bash

# Проверить контейнеры
if docker compose ps | grep -q "Exited"; then
    echo "⚠️  Некоторые контейнеры остановлены!"
    docker compose ps
fi

# Проверить свободное место на диске
DISK_USAGE=$(df /opt/RUBLESTORE_GLOBAL | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 85 ]; then
    echo "⚠️  Критически низко место на диске: $DISK_USAGE%"
fi

# Проверить размер базы данных
DB_SIZE=$(docker exec ruble-store-postgres psql -U postgres -d ruble_store -t -c "SELECT pg_size_pretty(pg_database.datsize) FROM pg_database WHERE datname = 'ruble_store';")
echo "📊 Размер БД: $DB_SIZE"

echo "✅ Проверка здоровья завершена"
EOF

chmod +x /opt/RUBLESTORE_GLOBAL/health-check.sh

# Добавить в crontab (ежечасно)
sudo crontab -e
# 0 * * * * /opt/RUBLESTORE_GLOBAL/health-check.sh >> /var/log/ruble-store-health.log 2>&1
```

## Обновление приложения

### 13. Обновить код и перезапустить

```bash
cd /opt/RUBLESTORE_GLOBAL

# Получить последние изменения
git pull origin main

# Пересобрать и перезапустить
docker compose down
docker compose up -d --build

# Проверить логи
docker compose logs -f web
```

## Диагностика проблем

### Проверить статус контейнеров

```bash
docker compose ps
docker compose logs --tail 50
```

### Проверить подключение к БД

```bash
docker exec ruble-store-postgres psql -U postgres -d ruble_store -c "SELECT version();"
```

### Проверить использование памяти

```bash
docker stats
```

### Очистить неиспользуемые данные Docker

```bash
docker system prune -a --volumes
```

## Быстрая ссылка на важные файлы

- **Безопасность:** [SECURITY.md](./SECURITY.md)
- **Восстановление при атаке:** [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md)
- **Настройка переменных окружения:** [docs/ENV_SETUP.md](./docs/ENV_SETUP.md)
- **Проверка безопасности перед запуском:** `bash scripts/security-check.sh`

---

## Поддержка

Если что-то не работает:

1. Проверьте логи: `docker compose logs -f`
2. Прочитайте [ENV_SETUP.md](./docs/ENV_SETUP.md) - раздел "Ошибка Application error"
3. Убедитесь, что все переменные в `.env` установлены корректно
4. Проверьте firewall правила

