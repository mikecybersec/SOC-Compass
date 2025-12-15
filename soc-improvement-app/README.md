# SOC Compass

SOC Compass is a comprehensive Security Operations Center (SOC) assessment platform that helps SOC leaders and consultants deliver capability maturity assessments with AI-powered insights.

## Quick Start with Docker

### Prerequisites

- Docker and Docker Compose installed
- At least 2GB of available RAM
- Ports 3000 and 3001 available

### Setup Instructions

1. **Clone the repository** (if you haven't already)

2. **Configure environment variables**:
   ```bash
   cd soc-improvement-app
   cp env.example .env
   ```

3. **Edit `.env` file** and set a secure database password:
   ```
   DB_PASSWORD=your_secure_password_here
   VITE_API_URL=http://localhost:3001/api/v1
   ```

4. **Start the application**:
   ```bash
   docker-compose up --build
   ```

5. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Health check: http://localhost:3001/health

### First Time Setup

On first launch, the database will be automatically initialized with the required schema.

## 📦 Architecture

The application consists of three services:

- **PostgreSQL Database**: Stores workspaces, assessments, and file metadata
- **Express Backend API**: RESTful API for data operations and file uploads
- **React Frontend**: Single-page application built with Vite

```
┌─────────────┐      ┌─────────────┐      ┌──────────────┐
│   Browser   │─────▶│   Nginx     │─────▶│   Express    │
│  (React)    │◀─────│  (Frontend) │◀─────│   (Backend)  │
└─────────────┘      └─────────────┘      └──────┬───────┘
                                                  │
                                                  ▼
                                           ┌──────────────┐
                                           │  PostgreSQL  │
                                           └──────────────┘
```

## 🔄 Migrating from localStorage Version

If you're upgrading from the browser-only version:

### Option 1: Automatic Migration (Recommended)

1. **Before upgrading**: Your data is safe in localStorage
2. **Start the new Docker version** as described above
3. **Open http://localhost:3000** - you'll see a migration prompt
4. **Click "Import from Browser Storage"** to automatically migrate
5. **Verify** that all workspaces and assessments appear correctly

### Option 2: Manual Export/Import

1. **In the old version**:
   - The migration modal will offer a "Download Backup" button
   - Save the JSON file to a safe location

2. **In the new version**:
   - Use the "Import from File" option
   - Select your exported JSON file
   - Wait for confirmation

### What Gets Migrated

- ✅ All workspaces
- ✅ All assessments (answers, notes, metadata)
- ✅ Action plans
- ✅ Aspect recommendations
- ✅ Timestamps and history

## 🛠️ Development

### Running Locally (without Docker)

**Backend**:
```bash
cd backend
npm install
export DATABASE_URL="postgresql://soc_user:password@localhost:5432/soc_compass"
npm start
```

**Frontend**:
```bash
npm install
export VITE_API_URL="http://localhost:3001/api/v1"
npm run dev
```

### Environment Variables

**Backend** (`backend/.env`):
- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Backend server port (default: 3001)
- `FRONTEND_URL`: Frontend origin for CORS (default: http://localhost:3000)

**Frontend** (build-time):
- `VITE_API_URL`: Backend API base URL

## 📊 Database Schema

### Workspaces
- Organize multiple assessments
- Track creation and update timestamps

### Assessments
- Store framework-based evaluations
- JSONB fields for flexible data (answers, notes, metadata, action plans)
- Linked to workspaces with cascade delete

### Uploaded Files
- File metadata and paths
- Linked to assessments
- Support for PDFs, images, documents

## 🔒 Data Persistence

- **Database**: All data persisted in PostgreSQL with Docker volumes
- **File Uploads**: Stored in Docker volume at `/app/uploads`
- **Backups**: Use `docker-compose exec postgres pg_dump` for database backups

### Backup Commands

**Database backup**:
```bash
docker-compose exec postgres pg_dump -U soc_user soc_compass > backup.sql
```

**Restore from backup**:
```bash
docker-compose exec -T postgres psql -U soc_user soc_compass < backup.sql
```

## 🐛 Troubleshooting

### Database Connection Issues

Check if PostgreSQL is healthy:
```bash
docker-compose ps
docker-compose logs postgres
```

### Backend API Errors

View backend logs:
```bash
docker-compose logs backend
```

### Frontend Build Issues

Rebuild frontend with correct API URL:
```bash
docker-compose build --no-cache frontend
```

### Reset Everything

To start fresh (⚠️ destroys all data):
```bash
docker-compose down -v
docker-compose up --build
```

## 📝 API Documentation

### Workspaces

- `GET /api/v1/workspaces` - List all workspaces
- `POST /api/v1/workspaces` - Create workspace
- `PATCH /api/v1/workspaces/:id` - Update workspace
- `DELETE /api/v1/workspaces/:id` - Delete workspace

### Assessments

- `GET /api/v1/assessments/workspace/:workspaceId` - List assessments
- `GET /api/v1/assessments/:id` - Get assessment
- `POST /api/v1/assessments` - Create assessment
- `PATCH /api/v1/assessments/:id` - Update assessment
- `DELETE /api/v1/assessments/:id` - Delete assessment

### Files

- `POST /api/v1/files/assessment/:assessmentId` - Upload file
- `GET /api/v1/files/:fileId` - Download file
- `GET /api/v1/files/assessment/:assessmentId` - List files
- `DELETE /api/v1/files/:fileId` - Delete file

### Migration

- `POST /api/v1/migration/import` - Import localStorage data
- `GET /api/v1/migration/status` - Check database status

## 🔐 Security Notes

- Change the default database password in production
- API currently has no authentication (single-user deployment)
- File uploads limited to 50MB
- CORS configured for localhost by default

## 📚 Documentation

Full documentation available at: https://soc-compass.readthedocs.io/en/latest/

## 🤝 Contributing

This is an open-source project. Contributions welcome!

## 📄 License

[Your License Here]

## 🆘 Support

For issues and questions:
- GitHub Issues: [Your Repo URL]
- Documentation: https://soc-compass.readthedocs.io/en/latest/
