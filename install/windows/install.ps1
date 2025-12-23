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
"@ | Out-File -Encoding utf8 docker-compose.yml

Write-Host "[*] Pulling images..."
docker compose pull

Write-Host "[*] Starting SOC-Compass..."
docker compose up -d

Write-Host ""
Write-Host "✅ SOC-Compass is running"
Write-Host "🌐 UI:  http://localhost:3000"
Write-Host "🔌 API: http://localhost:3001/api/v1"
