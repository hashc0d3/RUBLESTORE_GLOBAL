#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> Pull latest"
git pull origin main

echo "==> Security check"
bash scripts/security-check.sh

echo "==> Rebuild and start"
docker compose up -d --build

echo "==> Status"
docker compose ps
