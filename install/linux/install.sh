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
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: soc_compass
      POSTGRES_USER: soc_user
      POSTGRES_PASSWORD: \${DB_PASSWORD:-change_me}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U soc_user -d soc_compass"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - soc-network

  backend:
    image: mikecybersec/soc-compass-backend:latest
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://soc_user:\${DB_PASSWORD:-change_me}@postgres:5432/soc_compass
      PORT: 3001
      FRONTEND_URL: http://localhost:3000
    volumes:
      - file_uploads:/app/uploads
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - soc-network

  frontend:
    image: mikecybersec/soc-compass-frontend:latest
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - soc-network

volumes:
  postgres_data:
  file_uploads:

networks:
  soc-network:
    driver: bridge
EOF

echo "[*] Pulling images..."
docker compose pull

echo "[*] Starting SOC-Compass..."
docker compose up -d

echo ""
echo "✅ SOC-Compass is running"
echo "🌐 UI:  http://localhost:3000"
echo "🔌 API: http://localhost:3001/api/v1"
