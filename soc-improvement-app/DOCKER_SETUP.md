# Docker Setup Guide for SOC Compass

## Quick Start

```bash
# 1. Navigate to the application directory
cd soc-improvement-app

# 2. Create environment file
cp env.example .env

# 3. Edit .env and set a secure password
# DB_PASSWORD=your_secure_password_here

# 4. Build and start all services
docker-compose up --build

# 5. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# Health Check: http://localhost:3001/health
```

## What Gets Created

### Services
- **postgres**: PostgreSQL 15 database
- **backend**: Express.js API server (Node.js)
- **frontend**: React SPA served by Nginx

### Volumes
- **postgres_data**: Database files (persists between restarts)
- **file_uploads**: Uploaded assessment files

### Network
- **soc-network**: Internal Docker network for service communication

## Common Commands

### Start services
```bash
docker-compose up
```

### Start in background
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f frontend
```

### Rebuild after code changes
```bash
docker-compose up --build
```

### Reset everything (⚠️ DESTROYS ALL DATA)
```bash
docker-compose down -v
```

## Database Management

### Access PostgreSQL shell
```bash
docker-compose exec postgres psql -U soc_user -d soc_compass
```

### Backup database
```bash
docker-compose exec postgres pg_dump -U soc_user soc_compass > backup_$(date +%Y%m%d).sql
```

### Restore database
```bash
docker-compose exec -T postgres psql -U soc_user soc_compass < backup.sql
```

### View database size
```bash
docker-compose exec postgres psql -U soc_user -d soc_compass -c "SELECT pg_size_pretty(pg_database_size('soc_compass'));"
```

## Troubleshooting

### Port already in use
If ports 3000 or 3001 are already in use, edit `docker-compose.yml`:
```yaml
ports:
  - "8080:80"  # Change 3000 to 8080 for frontend
  - "8081:3001"  # Change 3001 to 8081 for backend
```

### Database won't start
Check logs:
```bash
docker-compose logs postgres
```

Common issues:
- Insufficient disk space
- Corrupted volume (solution: `docker-compose down -v` and restart)

### Backend can't connect to database
1. Check if postgres is healthy:
```bash
docker-compose ps
```

2. Verify DATABASE_URL in docker-compose.yml matches postgres credentials

### Frontend can't reach backend
1. Check backend is running:
```bash
curl http://localhost:3001/health
```

2. Check Nginx configuration in `nginx.conf`

### Clear all Docker resources
```bash
# Stop all containers
docker-compose down

# Remove all volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Clean up Docker system
docker system prune -a
```

## Production Considerations

### Security
1. **Change default password**: Never use default DB password in production
2. **Use environment variables**: Don't commit `.env` to version control
3. **Enable HTTPS**: Use a reverse proxy (Nginx/Traefik) with SSL certificates
4. **Add authentication**: Implement user auth if exposing publicly

### Performance
1. **Resource limits**: Add resource constraints in docker-compose.yml
```yaml
services:
  postgres:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

2. **Database tuning**: Adjust PostgreSQL settings for your workload
3. **Nginx caching**: Enable caching for static assets

### Monitoring
1. **Health checks**: Already configured for postgres
2. **Logging**: Use Docker logging drivers
3. **Metrics**: Consider adding Prometheus/Grafana

### Backups
1. **Automated backups**: Set up cron job for database dumps
2. **Volume backups**: Backup Docker volumes regularly
3. **Off-site storage**: Store backups in S3/cloud storage

## Development vs Production

### Development (current setup)
- Exposed ports for direct access
- Verbose logging
- No resource limits
- Local volumes

### Production recommendations
- Use Docker secrets for passwords
- Add rate limiting
- Enable HTTPS
- Use managed PostgreSQL (AWS RDS, etc.)
- Add monitoring and alerting
- Implement backup strategy
- Use container orchestration (Kubernetes, Docker Swarm)

## File Structure

```
soc-improvement-app/
├── backend/
│   ├── db/
│   │   ├── index.js          # Database connection
│   │   ├── schema.sql        # Database schema
│   │   └── init.js           # Schema initialization
│   ├── routes/
│   │   ├── workspaces.js     # Workspace endpoints
│   │   ├── assessments.js    # Assessment endpoints
│   │   ├── files.js          # File upload/download
│   │   └── migration.js      # Data migration
│   ├── server.js             # Express app
│   ├── package.json
│   └── Dockerfile
├── src/
│   ├── api/                  # Frontend API clients
│   ├── components/
│   │   └── MigrationModal.jsx
│   └── hooks/
│       └── useAssessmentStore.js  # State management
├── docker-compose.yml        # Service orchestration
├── Dockerfile                # Frontend build
├── nginx.conf                # Nginx configuration
└── .env                      # Environment variables
```

