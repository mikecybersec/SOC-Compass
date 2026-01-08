Write-Host "[*] Installing SOC-Compass..."

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker is not installed."
    exit 1
}

if (-not (docker compose version)) {
    Write-Error "Docker Compose v2 is required."
    exit 1
}

$AppDir = "soc-compass"
New-Item -ItemType Directory -Force -Path $AppDir | Out-Null
Set-Location $AppDir

if (-not (Test-Path ".env")) {
@"
DB_PASSWORD=change_me
"@ | Out-File -Encoding utf8 .env
    Write-Host "[+] Created .env (edit for production)"
}

@"
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: soc_compass
      POSTGRES_USER: soc_user
      POSTGRES_PASSWORD: `${DB_PASSWORD:-change_me}
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
      DATABASE_URL: postgresql://soc_user:`${DB_PASSWORD:-change_me}@postgres:5432/soc_compass
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
"@ | Out-File -Encoding utf8 docker-compose.yml

Write-Host "[*] Pulling images..."
docker compose pull

Write-Host "[*] Starting SOC-Compass..."
docker compose up -d

Write-Host ""
Write-Host "✅ SOC-Compass is running"
Write-Host "🌐 UI:  http://localhost:3000"
Write-Host "🔌 API: http://localhost:3001/api/v1"
