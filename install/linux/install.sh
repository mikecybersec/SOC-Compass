#!/usr/bin/env bash
set -e

APP_DIR="soc-compass"

echo "[*] Installing SOC-Compass..."

# Check Docker
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed. Install Docker first."
  exit 1
fi

# Check Docker Compose
if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose v2 is required."
  exit 1
fi

mkdir -p "$APP_DIR"
cd "$APP_DIR"

# Create .env if missing
if [ ! -f .env ]; then
  cat <<EOF > .env
DB_PASSWORD=change_me
EOF
  echo "[+] Created .env (edit this file for production)"
fi

# Create docker-compose.yml
cat <<EOF > docker-compose.yml
services:
  frontend:
    image: mikecybersec/soc-compass-frontend:latest
    ports:
      - "3000:3000"
    depends_on:
      - backend

  backend:
    image: mikecybersec/soc-compass-backend:latest
    ports:
      - "3001:3001"
    env_file:
      - .env
EOF

echo "[*] Pulling images..."
docker compose pull

echo "[*] Starting SOC-Compass..."
docker compose up -d

echo ""
echo "✅ SOC-Compass is running"
echo "🌐 UI:  http://localhost:3000"
echo "🔌 API: http://localhost:3001/api/v1"
