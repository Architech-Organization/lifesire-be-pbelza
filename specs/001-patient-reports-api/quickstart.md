# LifeSpire Patient Reports API - Developer Quickstart

**Version**: 1.0.0  
**Last Updated**: 2026-01-28

## Overview

This quickstart guide will get you up and running with the Patient Reports API backend in under 10 minutes. The API enables healthcare report management, automated analysis, and clinical note tracking.

## Prerequisites

Ensure you have the following installed:

- **Node.js**: 18 LTS or higher
  ```bash
  node --version  # Should be v18.x or v20.x
  ```

- **npm**: 8.x or higher (comes with Node.js)
  ```bash
  npm --version
  ```

- **Docker**: For PostgreSQL database
  ```bash
  docker --version
  docker compose version  # Note: modern syntax, not docker-compose
  ```

- **Git**: For version control
  ```bash
  git --version
  ```

## Initial Setup

### 1. Clone Repository (or initialize if new)

```bash
# If starting from scratch
mkdir lifespire && cd lifespire
git init
```

### 2. Install Dependencies

```bash
npm install
```

**Expected minimal dependencies**:
- `express` - Web framework
- `typescript` - Type safety
- `typeorm` - Database ORM
- `pg` - PostgreSQL driver
- `sqlite3` - Mock database driver
- `multer` - File upload handling
- `reflect-metadata` - TypeORM requirement
- `dotenv` - Environment configuration
- `class-validator` - Input validation
- `class-transformer` - DTO transformation

**Dev dependencies**:
- `@types/*` - TypeScript definitions
- `ts-node` - TypeScript execution
- `nodemon` - Development hot reload
- `tsx` - Fast TypeScript execution

### 3. Environment Configuration

Create `.env` file in project root:

```bash
cp .env.example .env
```

**`.env.example` contents**:
```env
# Server
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database
DB_TYPE=postgres  # Use 'sqlite' for mock adapter
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lifespire_dev
DB_USERNAME=lifespire
DB_PASSWORD=lifespire_dev_password
DB_SYNCHRONIZE=false  # Use migrations, not auto-sync
DB_LOGGING=true

# File Storage
UPLOAD_DIR=./data/uploads
MAX_FILE_SIZE_MB=50
ALLOWED_FORMATS=pdf,docx,jpg,jpeg,png

# Analysis Engine
ANALYSIS_ENGINE=mock  # Options: mock, openai-gpt4, anthropic-claude
ANALYSIS_TIMEOUT_MS=30000

# Clinician Auth (Mocked)
DEFAULT_CLINICIAN_ID=Dr. System
```

### 4. Start Database

```bash
docker compose up -d
```

**`docker-compose.yml` structure** (will be in project root):
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: lifespire_dev
      POSTGRES_USER: lifespire
      POSTGRES_PASSWORD: lifespire_dev_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U lifespire"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

Verify database is running:
```bash
docker compose ps
docker compose logs postgres  # Check for "database system is ready"
```

### 5. Run Migrations

```bash
npm run migration:run
```

This will create all tables from [data-model.md](data-model.md):
- `patients`
- `reports`
- `analyses`
- `clinical_notes`

Verify migrations:
```bash
npm run migration:show  # Should show all applied migrations
```

## Running the Application

### Development Mode (Hot Reload)

```bash
npm run dev
```

Output:
```
[INFO] Starting LifeSpire Patient Reports API...
[INFO] Environment: development
[INFO] Database: Connected to PostgreSQL (lifespire_dev)
[INFO] Adapters: Using MockAnalysisEngine, LocalFileStorage
[INFO] Server listening on http://localhost:3000
[INFO] API Base URL: http://localhost:3000/api/v1
[INFO] Health check: http://localhost:3000/api/v1/health
```

### Production Mode

```bash
npm run build
npm start
```

### Using Mock Adapters (No Database)

For rapid prototyping without Docker:

```bash
DB_TYPE=sqlite npm run dev
```

This uses:
- **InMemoryPatientRepository** - Patients stored in-memory
- **InMemoryReportRepository** - Reports metadata in-memory
- **MockFileStorage** - Files stored in `/tmp`
- **MockAnalysisEngine** - Pattern-matching analysis

## Testing the API

### Health Check

```bash
curl http://localhost:3000/api/v1/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-28T10:30:00.000Z",
  "version": "1.0.0"
}
```

### Create a Patient

```bash
curl -X POST http://localhost:3000/api/v1/patients \
  -H "Content-Type: application/json" \
  -H "X-Clinician-ID: Dr. Smith" \
  -d '{
    "medicalRecordNumber": "MRN-001",
    "name": "John Doe",
    "dateOfBirth": "1980-05-15",
    "contactInfo": {
      "email": "john.doe@example.com",
      "phone": "+1-555-0123"
    }
  }'
```

Response:
```json
{
  "data": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "medicalRecordNumber": "MRN-001",
    "name": "John Doe",
    "dateOfBirth": "1980-05-15",
    "contactInfo": {
      "email": "john.doe@example.com",
      "phone": "+1-555-0123"
    },
    "createdAt": "2026-01-28T10:35:00.000Z",
    "updatedAt": "2026-01-28T10:35:00.000Z"
  }
}
```

### Upload a Report

```bash
PATIENT_ID="f47ac10b-58cc-4372-a567-0e02b2c3d479"

curl -X POST "http://localhost:3000/api/v1/patients/${PATIENT_ID}/reports" \
  -H "X-Clinician-ID: Dr. Smith" \
  -F "file=@./test-data/lab-results.pdf" \
  -F "reportDate=2024-01-15" \
  -F "description=Annual blood work results"
```

Response:
```json
{
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "patientId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "reportDate": "2024-01-15",
    "description": "Annual blood work results",
    "fileName": "lab-results.pdf",
    "fileFormat": "application/pdf",
    "fileSize": 524288,
    "uploadTimestamp": "2026-01-28T10:40:00.000Z",
    "createdAt": "2026-01-28T10:40:00.000Z",
    "updatedAt": "2026-01-28T10:40:00.000Z"
  }
}
```

### Get Analysis Results

```bash
REPORT_ID="a1b2c3d4-e5f6-7890-abcd-ef1234567890"

curl "http://localhost:3000/api/v1/reports/${REPORT_ID}/analysis" \
  -H "X-Clinician-ID: Dr. Smith"
```

Response:
```json
{
  "data": {
    "id": "z9y8x7w6-v5u4-t3s2-r1q0-p9o8n7m6l5k4",
    "reportId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "extractedData": {
      "labValues": [
        {
          "name": "Hemoglobin",
          "value": 14.5,
          "unit": "g/dL",
          "referenceRange": "13.5-17.5",
          "flag": "normal"
        }
      ]
    },
    "confidenceScore": 0.85,
    "summaryText": "Lab results within normal range. Hemoglobin stable.",
    "analysisMethod": "mock",
    "completionStatus": "complete",
    "analysisTimestamp": "2026-01-28T10:40:05.000Z"
  }
}
```

### Add Clinical Note

```bash
curl -X POST "http://localhost:3000/api/v1/reports/${REPORT_ID}/notes" \
  -H "Content-Type: application/json" \
  -H "X-Clinician-ID: Dr. Smith" \
  -d '{
    "content": "Reviewed results with patient. No concerns. Continue current treatment plan."
  }'
```

### Get Patient Summary

```bash
curl "http://localhost:3000/api/v1/patients/${PATIENT_ID}/summary" \
  -H "X-Clinician-ID: Dr. Smith"
```

## API Documentation

### Interactive Swagger UI

Once the server is running:

```bash
open http://localhost:3000/api-docs
```

Or use the OpenAPI spec directly:

```bash
# Validate spec
npx swagger-cli validate specs/001-patient-reports-api/contracts/openapi.yaml

# Generate interactive docs
npx swagger-ui-watcher specs/001-patient-reports-api/contracts/openapi.yaml
```

### Generate SDK Clients

**TypeScript Client**:
```bash
npx @openapitools/openapi-generator-cli generate \
  -i specs/001-patient-reports-api/contracts/openapi.yaml \
  -g typescript-axios \
  -o clients/typescript
```

**Python Client**:
```bash
npx @openapitools/openapi-generator-cli generate \
  -i specs/001-patient-reports-api/contracts/openapi.yaml \
  -g python \
  -o clients/python
```

## Switching Adapters

### Mock → Production Adapters

The hexagonal architecture allows swapping implementations without domain changes.

**File Storage**: Local → Azure Blob
```typescript
// infrastructure/storage/AzureBlobStorage.ts
export class AzureBlobStorage implements FileStoragePort {
  // Implements same interface as LocalFileStorage
}

// api/bootstrap.ts
const fileStorage = process.env.STORAGE_TYPE === 'azure'
  ? new AzureBlobStorage(config)
  : new LocalFileStorage(config);
```

**Analysis Engine**: Mock → OpenAI
```typescript
// infrastructure/analysis/OpenAIAnalysisEngine.ts
export class OpenAIAnalysisEngine implements AnalysisEnginePort {
  // Implements same interface as MockAnalysisEngine
}

// api/bootstrap.ts
const analysisEngine = process.env.ANALYSIS_ENGINE === 'openai-gpt4'
  ? new OpenAIAnalysisEngine(config)
  : new MockAnalysisEngine();
```

**Database**: SQLite → PostgreSQL

Just change `.env`:
```env
DB_TYPE=postgres  # Was: sqlite
```

## Project Structure

```
lifespire/
├── src/
│   ├── domain/              # Core business logic
│   │   ├── entities/        # Patient, Report, Analysis, ClinicalNote
│   │   ├── ports/           # Repository, FileStorage, AnalysisEngine interfaces
│   │   └── services/        # Business use cases
│   ├── infrastructure/      # External adapters
│   │   ├── persistence/     # TypeORM repositories
│   │   ├── storage/         # File storage adapters
│   │   └── analysis/        # Analysis engine adapters
│   └── api/                 # HTTP layer
│       ├── controllers/     # Express route handlers
│       ├── middleware/      # Validation, error handling
│       └── dto/             # Request/response types
├── migrations/              # TypeORM database migrations
├── specs/                   # Feature specifications
├── .specify/                # Project constitution and memory
├── docker-compose.yml
├── tsconfig.json
└── package.json
```

## Common Commands

```bash
# Development
npm run dev              # Start with hot reload
npm run build            # Compile TypeScript
npm start                # Run compiled code

# Database
npm run migration:generate -- -n CreatePatients
npm run migration:run
npm run migration:revert
npm run migration:show

# Code Quality
npm run lint             # ESLint check
npm run lint:fix         # Auto-fix issues
npm run format           # Prettier formatting
npm run typecheck        # TypeScript validation

# Docker
docker compose up -d     # Start database
docker compose down      # Stop database
docker compose logs -f   # View logs
docker compose ps        # List containers
```

## Troubleshooting

### Database connection failed

```bash
# Check if PostgreSQL is running
docker compose ps

# Check logs
docker compose logs postgres

# Restart
docker compose restart postgres
```

### Port 3000 already in use

```bash
# Find process
lsof -ti:3000

# Kill process
kill -9 $(lsof -ti:3000)

# Or change port in .env
PORT=3001
```

### TypeORM migration errors

```bash
# Drop all tables and re-run
npm run schema:drop
npm run migration:run

# Or reset database
docker compose down -v
docker compose up -d
npm run migration:run
```

### File upload fails (413 Payload Too Large)

Check `.env`:
```env
MAX_FILE_SIZE_MB=50  # Increase if needed
```

## Next Steps

1. **Read the Specification**: [specs/001-patient-reports-api/spec.md](spec.md)
2. **Review Data Model**: [specs/001-patient-reports-api/data-model.md](data-model.md)
3. **Explore API Contracts**: [specs/001-patient-reports-api/contracts/openapi.yaml](contracts/openapi.yaml)
4. **Implement Features**: Follow the implementation plan tasks
5. **Add LLM Analysis**: Swap MockAnalysisEngine for OpenAIAnalysisEngine
6. **Deploy to Azure**: Use Dockerfile with Azure Container Apps

## Support

- **Constitution**: [.specify/memory/constitution.md](../.specify/memory/constitution.md)
- **Implementation Plan**: [plan.md](plan.md)
- **Research Decisions**: [research.md](research.md)

---

**Ready to build!** 🚀 Start with `npm run dev` and hit the health check endpoint.
