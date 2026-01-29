# Lifespire Patient Reports API

Backend API for healthcare reports management enabling clinicians to manage patient records, upload medical reports (PDF, DOCX, images), analyze reports for trends and patterns, add clinical notes, and generate comprehensive patient summaries.

## 🏗️ Architecture

This project follows **hexagonal architecture** (ports & adapters pattern):

```
┌─────────────────────────────────────────────────────────────┐
│                        API Layer                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Express  │  │  Routes  │  │   DTOs   │  │Middleware│  │
│  │  Server  │  │Controllers│  │Validation│  │  Error   │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
└───────┼─────────────┼─────────────┼─────────────┼─────────┘
        │             │             │             │
        └─────────────┼─────────────┼─────────────┘
                      │             │
┌─────────────────────┼─────────────┼─────────────────────────┐
│                  Domain Layer                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Entities   │  │   Services  │  │   Repository Ports  │ │
│  │  Patient    │  │   Patient   │  │   PatientRepo      │ │
│  │  Report     │  │   Report    │  │   ReportRepo       │ │
│  │  Analysis   │  │   Analysis  │  │   AnalysisRepo     │ │
│  │  Note       │  │   Note      │  │   NoteRepo         │ │
│  │  Summary    │  │   Summary   │  │   FileStorage      │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────┐
│                Infrastructure Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   TypeORM    │  │Local Storage │  │ Mock Analysis    │  │
│  │ Repositories │  │   Adapter    │  │    Engine        │  │
│  │  PostgreSQL  │  │  File System │  │Pattern Matching  │  │
│  │    SQLite    │  │   SHA-256    │  │  Lab/Imaging    │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Key Principles**:
- Domain logic has NO dependencies on infrastructure
- All external dependencies accessed through ports (interfaces)
- Easy to swap adapters (mock ↔ production) without touching domain code
- Business rules validated at domain entity level

## 🚀 Quick Start

### Prerequisites

- Node.js 18 LTS
- Docker and Docker Compose
- npm 9+

### Installation

```bash
# Clone and install
npm install

# Environment setup
cp .env.example .env

# Start with Docker
docker-compose up -d

# The API will be available at:
# - API: http://localhost:3000/api/v1
# - Health: http://localhost:3000/health
# - Docs: http://localhost:3000/api-docs
```

### Quick Links

- 📖 [API Documentation](http://localhost:3000/api-docs) - Interactive Swagger UI
- 📋 [API Examples](examples.md) - cURL commands and workflow examples
- 🔧 [Quickstart Guide](specs/001-patient-reports-api/quickstart.md) - Complete setup instructions
- 📐 [Architecture Plan](specs/001-patient-reports-api/plan.md) - Detailed technical design
- 📊 [Data Model](specs/001-patient-reports-api/data-model.md) - Entity relationships and schemas

## 📁 Project Structure

```
src/
├── domain/              # Core business logic (hexagonal center)
│   ├── entities/       # Domain entities (Patient, Report, Analysis, Note, Summary)
│   ├── ports/          # Repository & service interfaces
│   └── services/       # Domain services (business logic)
├── infrastructure/      # Adapters (hexagonal outer layer)
│   ├── persistence/    # Database adapters (TypeORM, InMemory)
│   │   ├── entities/   # TypeORM entities
│   │   └── repositories/ # Repository implementations
│   ├── storage/        # File storage (LocalFileStorage, MockFileStorage)
│   ├── analysis/       # Analysis engines (MockAnalysisEngine)
│   └── config/         # Configuration & database setup
└── api/                # HTTP adapter (REST API)
    ├── routes/         # API routes (patients, reports, analyses, notes)
    ├── controllers/    # Request handlers
    ├── middleware/     # Express middleware (validation, error handling, security)
    └── dto/            # Data transfer objects (request/response validation)
migrations/              # TypeORM database migrations
specs/                   # Design documentation
docker-compose.yml       # Docker configuration
```

## 🎯 Features

### User Stories (All Implemented)

- ✅ **US1**: Patient Management - Create, read, update, delete patients with demographics
- ✅ **US2**: Report Upload & Storage - Upload medical reports (PDF, DOCX, images) with metadata
- ✅ **US3**: Report Analysis & Summary - Extract findings, detect trends, identify patterns
- ✅ **US4**: Clinical Notes - Add, view, delete clinician annotations on reports
- ✅ **US5**: Patient Summary - Comprehensive timeline with reports, analyses, and notes

### Production Features

- ✅ Request logging with Pino (structured logs)
- ✅ Input sanitization (NoSQL injection prevention)
- ✅ Rate limiting (100 req/15min per IP)
- ✅ Health checks (database & storage)
- ✅ Graceful shutdown (SIGTERM/SIGINT)
- ✅ Auto-migrations on startup (production)
- ✅ Environment validation at startup
- ✅ Multi-stage Docker build
- ✅ Interactive API documentation (Swagger UI)

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production bundle
- `npm start` - Run production build
- `npm run typecheck` - Run TypeScript type checking

### Adapter Switching (T100)

The application supports switching between mock and production adapters:

**Mock Adapters** (Development):
- `InMemoryPatientRepository` - In-memory patient storage
- `MockFileStorage` - Buffer-based file storage
- `MockAnalysisEngine` - Pattern-matching analysis

**Production Adapters**:
- `TypeORMPatientRepository` - PostgreSQL/SQLite persistence
- `LocalFileStorage` - File system storage with SHA-256 hashing
- (Future: RealAnalysisEngine with ML/NLP)

**Configuration** (in `src/index.ts` and route files):
```typescript
// Development: Use InMemory adapters
const repository = new InMemoryPatientRepository();

// Production: Use TypeORM adapters
const dataSource = await getDataSource();
const repository = new TypeORMPatientRepository(dataSource);
```

Current setup uses **TypeORM adapters by default** for all environments. To switch to mock adapters, modify the repository initialization in route files.

### Environment Variables

Key configuration (see `.env.example`):
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3000)
- `DB_TYPE` - Database type (postgres/sqlite)
- `UPLOAD_PATH` - File upload directory
- `LOG_LEVEL` - Logging level (info/debug/error)


- `npm run lint` - Lint code
- `npm run lint:fix` - Fix linting issues

### Mock vs Production Adapters

The system uses **mock-first development**:

- **Database**: Switch between PostgreSQL (`DB_TYPE=postgres`) and SQLite (`DB_TYPE=sqlite`)
- **File Storage**: Use `FILE_STORAGE_TYPE=local` for local filesystem
- **Analysis Engine**: Use `ANALYSIS_ENGINE_TYPE=mock` for pattern-matching mock

See `.env.example` for all configuration options.

## Constitution Compliance

This project adheres to the LifeSpire Constitution (`.specify/memory/constitution.md`):

- ✅ **Hexagonal Architecture**: MANDATORY - domain isolated from infrastructure
- ✅ **Mock-First External Resources**: All ports have mock adapters
- ✅ **LLM Integration Preparation**: AnalysisEnginePort ready for OpenAI/Claude
- ✅ **Healthcare Domain Integrity**: Audit trails, soft deletes, explainable analysis
- ✅ **Rapid Iteration**: Tests deferred to post-MVP phase

## Documentation

- **Feature Specification**: [specs/001-patient-reports-api/spec.md](specs/001-patient-reports-api/spec.md)
- **Implementation Plan**: [specs/001-patient-reports-api/plan.md](specs/001-patient-reports-api/plan.md)
- **Data Model**: [specs/001-patient-reports-api/data-model.md](specs/001-patient-reports-api/data-model.md)
- **API Contracts**: [specs/001-patient-reports-api/contracts/openapi.yaml](specs/001-patient-reports-api/contracts/openapi.yaml)
- **Tasks**: [specs/001-patient-reports-api/tasks.md](specs/001-patient-reports-api/tasks.md)

## License

MIT
