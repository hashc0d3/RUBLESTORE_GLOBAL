#!/bin/bash

# ============================================================================
# 🔒 Скрипт проверки безопасности Ruble Store перед развёртыванием
# ============================================================================

set -e

echo "🔍 Проверка безопасности Ruble Store..."
echo ""

ISSUES=0
WARNINGS=0

# ============================================================================
# 1. Проверка .env файла
# ============================================================================
echo "📋 Проверка конфигурации .env..."

if [ ! -f ".env" ]; then
    echo "❌ Ошибка: файл .env не найден"
    echo "   Создайте .env на основе .env.example"
    ISSUES=$((ISSUES+1))
else
    # Проверка DB_PASSWORD
    if grep -q "DB_PASSWORD=" .env; then
        DB_PASSWORD=$(grep "DB_PASSWORD=" .env | cut -d= -f2)
        if [ -z "$DB_PASSWORD" ] || [ "$DB_PASSWORD" = "change-me-in-production-very-secure-password" ]; then
            echo "❌ Ошибка: DB_PASSWORD пустой или не изменён"
            echo "   Установите сильный пароль (минимум 32 символа)"
            ISSUES=$((ISSUES+1))
        elif [ ${#DB_PASSWORD} -lt 32 ]; then
            echo "⚠️  Предупреждение: DB_PASSWORD короче 32 символов (текущая длина: ${#DB_PASSWORD})"
            WARNINGS=$((WARNINGS+1))
        else
            echo "✅ DB_PASSWORD: надёжный пароль установлен"
        fi
    else
        echo "❌ Ошибка: DB_PASSWORD не найден в .env"
        ISSUES=$((ISSUES+1))
    fi

    # Проверка PAYLOAD_SECRET
    if grep -q "PAYLOAD_SECRET=" .env; then
        PAYLOAD_SECRET=$(grep "PAYLOAD_SECRET=" .env | cut -d= -f2)
        if [ -z "$PAYLOAD_SECRET" ] || [ "$PAYLOAD_SECRET" = "your-secret-key-min-32-chars-change-in-production" ]; then
            echo "❌ Ошибка: PAYLOAD_SECRET пустой или не изменён"
            ISSUES=$((ISSUES+1))
        elif [ ${#PAYLOAD_SECRET} -lt 32 ]; then
            echo "⚠️  Предупреждение: PAYLOAD_SECRET короче 32 символов"
            WARNINGS=$((WARNINGS+1))
        else
            echo "✅ PAYLOAD_SECRET: установлен"
        fi
    else
        echo "❌ Ошибка: PAYLOAD_SECRET не найден в .env"
        ISSUES=$((ISSUES+1))
    fi
fi

echo ""

# ============================================================================
# 2. Проверка docker-compose.yml
# ============================================================================
echo "🐳 Проверка docker-compose.yml..."

if grep -q "ports:.*5432" docker-compose.yml || grep -q "ports:.*5433" docker-compose.yml; then
    echo "❌ Ошибка: PostgreSQL порт открыт в интернет!"
    echo "   Замените 'ports' на 'expose' в конфигурации postgres"
    ISSUES=$((ISSUES+1))
else
    echo "✅ PostgreSQL порт защищен (используется expose)"
fi

if grep -q 'POSTGRES_PASSWORD: postgres' docker-compose.yml; then
    echo "❌ Ошибка: жёсткий пароль 'postgres' в docker-compose.yml"
    echo "   Используйте переменную окружения: \${DB_PASSWORD}"
    ISSUES=$((ISSUES+1))
else
    echo "✅ Пароли PostgreSQL используют переменные окружения"
fi

echo ""

# ============================================================================
# 3. Проверка миграций на SQL Injection
# ============================================================================
echo "🛡️  Проверка миграций на SQL Injection уязвимости..."

UNSAFE_MIGRATIONS=0

# Проверка на использование sql.raw() с конкатенацией
if grep -r "sql\.raw\(\`.*\${" apps/web/src/migrations/ 2>/dev/null | grep -v node_modules; then
    echo "❌ Найдены потенциальные SQL Injection уязвимости (sql.raw с конкатенацией)"
    UNSAFE_MIGRATIONS=$((UNSAFE_MIGRATIONS+1))
fi

# Проверка на использование функции esc()
if grep -r "function esc" apps/web/src/migrations/ 2>/dev/null | grep -v node_modules; then
    echo "⚠️  Найдены старые функции экранирования (используйте параметризованные запросы)"
    WARNINGS=$((WARNINGS+1))
fi

if [ $UNSAFE_MIGRATIONS -eq 0 ]; then
    echo "✅ Миграции используют параметризованные запросы"
fi

echo ""

# ============================================================================
# 4. Проверка зависимостей на CVE
# ============================================================================
echo "🔐 Проверка уязвимостей в зависимостях..."

if command -v npm &> /dev/null; then
    AUDIT_OUTPUT=$(npm audit --json 2>/dev/null || echo "{}")
    VULNS=$(echo "$AUDIT_OUTPUT" | grep -o '"vulnerabilities"' || echo "")
    if [ ! -z "$VULNS" ]; then
        echo "⚠️  Найдены уязвимости в зависимостях"
        echo "   Запустите: npm audit fix"
        WARNINGS=$((WARNINGS+1))
    else
        echo "✅ Нет критических уязвимостей в зависимостях"
    fi
else
    echo "⚠️  npm не найден, пропуск проверки уязвимостей"
fi

echo ""

# ============================================================================
# 5. Проверка Firewall правил
# ============================================================================
echo "🔥 Рекомендации для Firewall..."

echo "Необходимо открыть только следующие порты:"
echo "  ✓ 80 (HTTP)"
echo "  ✓ 443 (HTTPS)"
echo "  ✓ 3001 (Frontend)"
echo "  ✓ 4000 (API - только если нужен внешний доступ)"
echo ""
echo "⚠️  ЗАКРЫТЬ порты:"
echo "  ✗ 5432 / 5433 (PostgreSQL)"
echo "  ✗ 3000 (локальный Next.js)"
echo ""

# ============================================================================
# 6. Итоговый отчёт
# ============================================================================
echo "════════════════════════════════════════════════════════════════"

if [ $ISSUES -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ - ГОТОВО К РАЗВЁРТЫВАНИЮ"
    echo "════════════════════════════════════════════════════════════════"
    exit 0
elif [ $ISSUES -eq 0 ]; then
    echo "⚠️  ПРЕДУПРЕЖДЕНИЯ: $WARNINGS"
    echo "Приложение может работать, но рекомендуется исправить предупреждения"
    echo "════════════════════════════════════════════════════════════════"
    exit 0
else
    echo "❌ КРИТИЧЕСКИЕ ОШИБКИ: $ISSUES"
    echo "⚠️  ПРЕДУПРЕЖДЕНИЯ: $WARNINGS"
    echo ""
    echo "ИСПРАВЬТЕ КРИТИЧЕСКИЕ ОШИБКИ ПЕРЕД РАЗВЁРТЫВАНИЕМ!"
    echo "════════════════════════════════════════════════════════════════"
    exit 1
fi

