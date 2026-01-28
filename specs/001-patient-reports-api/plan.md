# Implementation Plan: Patient Reports Backend API

**Branch**: `001-patient-reports-api` | **Date**: 2026-01-28 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-patient-reports-api/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Backend API for healthcare reports management enabling clinicians to manage patient records, upload medical reports (PDF, DOCX, images), analyze reports for trends and patterns, add clinical notes, and generate comprehensive patient summaries. Analysis engine uses mocked responses initially with architecture designed for future LLM integration (OpenAI, Claude, etc.) following hexagonal architecture principles. System prioritizes rapid iteration with mock adapters for database, file storage, and analysis engine.

## Technical Context

**Language/Version**: Node.js 18 LTS (18.x) with TypeScript 5.x for type safety  
**Primary Dependencies**: 
- Express.js (minimal REST API framework)
- TypeORM (database abstraction, supports multiple backends)
- Multer (file upload handling)
- Docker Compose (database containerization)

**Storage**: 
- Database: PostgreSQL 15 (via Docker Compose, in-memory/SQLite mock for rapid dev)
- File Storage: Local filesystem initially (port defined for S3/Azure Blob later)

**Testing**: Jest (deferred per constitution - tests optional for MVP)  
**Target Platform**: Linux/Docker containers, cloud-agnostic (Azure-ready via containerization)  
**Project Type**: Single backend service (REST API)  
**Performance Goals**: Deferred per constitution (focus on correctness and architecture)  
**Constraints**: 
- Must support containerization (Docker)
- Must be cloud-agnostic (no cloud-specific SDKs in core logic)
- Must support demo scale (~100 patients, ~50 reports each)

**Scale/Scope**: Demo/MVP scale - 100 patients, <5000 total reports, <10 concurrent users

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Hexagonal Architecture Validation**:
- [x] Core domain logic identified and isolated from external concerns → Patient, Report, Analysis, ClinicalNote domain entities with business rules
- [x] Port interfaces defined for all external interactions (databases, APIs, LLMs, file systems) → PatientRepository, ReportRepository, FileStoragePort, AnalysisEnginePort ports planned
- [x] Adapters planned for each port (initial mock + future production implementation) → InMemoryPatientRepository + TypeORMPatientRepository, MockFileStorage + LocalFileStorage, MockAnalysisEngine + LLMAnalysisEngine
- [x] Dependency direction verified: adapters depend on ports, not vice versa → Domain defines ports, adapters in infrastructure layer
- [x] No framework coupling detected in planned core domain → Express/TypeORM isolated to API/infrastructure layers

**Rapid Iteration Alignment**:
- [x] Feature delivers demonstrable value for early validation → Full CRUD for patients/reports/notes + mocked analysis in P1-P2 user stories
- [x] Testing strategy documented: either manual validation now or TDD when production-ready → Tests deferred per constitution, manual API testing via curl/Postman
- [x] Technical debt documented if skipping tests → Tracked in technical debt section below

**Mock-First Resources**:
- [x] All external resources have mock adapter implementations planned → InMemoryRepository, MockFileStorage, MockAnalysisEngine all planned first
- [x] Mock adapters implement the same port interfaces as planned production adapters → Port interface shared by mock and production implementations
- [x] Development can proceed without external infrastructure dependencies → Can run without PostgreSQL, without real file storage, without LLM

**LLM Integration Readiness** (if applicable):
- [x] LLM interaction boundaries defined via ports → AnalysisEnginePort with analyze(reportContent) method
- [x] Prompts designed as data/configuration, not hard-coded → Prompts stored in config/prompts directory (JSON)
- [x] Multi-provider support considered in port design → Port agnostic to provider, adapter handles OpenAI vs Claude vs local

**Healthcare Domain Integrity** (if applicable):
- [x] Clinical terminology and report structures preserved → Report entity preserves original file and metadata, no lossy transforms
- [x] Privacy considerations addressed (PHI handling) → Audit trails for all operations, soft deletes preserve history
- [x] Audit trail requirements identified → createdAt, updatedAt, deletedAt timestamps on all entities
- [x] Analysis algorithms are explainable → Analysis entity stores confidence score, method used, supports partial results

**GATE STATUS**: ✅ PASSED - All constitution requirements met, proceeding to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── domain/                      # Core business logic (hexagonal center)
│   ├── entities/               # Domain entities
│   │   ├── Patient.ts
│   │   ├── Report.ts
│   │   ├── Analysis.ts
│   │   └── ClinicalNote.ts
│   ├── ports/                  # Port interfaces (dependency inversion)
│   │   ├── PatientRepository.ts
│   │   ├── ReportRepository.ts
│   │   ├── NoteRepository.ts
│   │   ├── FileStoragePort.ts
│   │   └── AnalysisEnginePort.ts
│   └── services/               # Domain services (business rules)
│       ├── PatientService.ts
│       ├── ReportService.ts
│       ├── AnalysisService.ts
│       └── SummaryService.ts
│
├── infrastructure/             # Adapters (hexagonal outer layer)
│   ├── database/
│   │   ├── repositories/      # Database adapters
│   │   │   ├── InMemoryPatientRepository.ts    # Mock
│   │   │   ├── TypeORMPatientRepository.ts      # Production
│   │   │   ├── InMemoryReportRepository.ts     # Mock
│   │   │   ├── TypeORMReportRepository.ts       # Production
│   │   │   └── TypeORMNoteRepository.ts
│   │   └── entities/          # TypeORM entities (separate from domain)
│   │       ├── PatientEntity.ts
│   │       ├── ReportEntity.ts
│   │       ├── AnalysisEntity.ts
│   │       └── NoteEntity.ts
│   ├── storage/
│   │   ├── MockFileStorage.ts         # Mock adapter
│   │   └── LocalFileStorage.ts        # Production adapter
│   ├── analysis/
│   │   ├── MockAnalysisEngine.ts      # Mock adapter
│   │   └── LLMAnalysisEngine.ts       # Future: OpenAI/Claude adapter
│   └── config/
│       ├── database.ts
│       └── prompts/           # LLM prompts as data
│           └── analysis-prompts.json
│
├── api/                        # HTTP adapter (hexagonal outer layer)
│   ├── routes/
│   │   ├── patients.ts
│   │   ├── reports.ts
│   │   ├── analyses.ts
│   │   └── notes.ts
│   ├── middleware/
│   │   ├── errorHandler.ts
│   │   ├── validation.ts
│   │   └── fileUpload.ts
│   └── app.ts                 # Express app setup
│
├── shared/                     # Cross-cutting concerns
│   ├── types/
│   └── utils/
│
└── index.ts                    # Application entry point

docker/
├── docker-compose.yml          # PostgreSQL service
└── Dockerfile                  # Application container

config/
├── default.json                # Default configuration
└── production.json             # Production overrides

tests/                          # Deferred per constitution
└── .gitkeep

.env.example                    # Environment template
package.json
tsconfig.json
.dockerignore
.gitignore
README.md
```

**Structure Decision**: Single backend project using hexagonal architecture (ports & adapters pattern). Domain layer at center contains entities, ports (interfaces), and services. Infrastructure layer implements ports with both mock and production adapters. API layer provides HTTP interface. TypeORM entities kept separate from domain entities to prevent ORM coupling in core logic. Structure supports constitution requirements: mock-first development, swappable adapters, framework isolation.

## Phase 1: Design Artifacts Completed

**Generated Artifacts**:
- ✅ [research.md](research.md) - 8 technical research areas documented
- ✅ [data-model.md](data-model.md) - 4 entities with PostgreSQL schema and TypeORM migrations
- ✅ [contracts/openapi.yaml](contracts/openapi.yaml) - Complete OpenAPI 3.0 specification with 15 endpoints
- ✅ [quickstart.md](quickstart.md) - Developer setup guide with examples
- ✅ [.specify/memory/agent-file.md](../../.specify/memory/agent-file.md) - Agent context for consistent implementation

**Post-Design Constitution Check**:
- [x] Data model respects hexagonal boundaries → Entities in domain/, TypeORM entities in infrastructure/
- [x] API contracts follow REST conventions → Resource-based URLs, standard HTTP methods, proper status codes
- [x] Mock adapters specified in architecture → InMemoryRepository, MockFileStorage, MockAnalysisEngine all documented
- [x] LLM integration remains flexible → AnalysisEnginePort allows swapping MockAnalysisEngine for real LLM
- [x] Healthcare audit trails present → All entities have created_at, updated_at, deleted_at timestamps

**GATE STATUS**: ✅ PASSED - Phase 1 design maintains constitution compliance

## Complexity Tracking

**No constitution violations** - All gates passed.

**Technical Debt Accepted**:
1. **Testing Deferred**: No automated tests in MVP per constitution. Manual API testing via curl/Postman. Will add Jest tests when production-ready.
2. **Mock Analysis Engine**: Pattern-matching mock initially. Real LLM integration deferred to post-MVP.
3. **Local File Storage**: Files stored on local filesystem. Cloud storage (S3/Azure Blob) via adapter swap later.
4. **No Authentication**: Clinician ID passed via header (X-Clinician-ID). Real auth system deferred.
5. **Demo Scale Only**: No pagination, no rate limiting, no performance optimization yet.

## Next Steps

**Implementation Ready**: This implementation plan is complete. Proceed with:

1. **Execute Tasks**: Run `/speckit.tasks` to generate detailed implementation tasks from this plan
2. **Setup Environment**: Follow [quickstart.md](quickstart.md) for development environment setup
3. **Review Contracts**: Study [contracts/openapi.yaml](contracts/openapi.yaml) for API design
4. **Understand Data Model**: Review [data-model.md](data-model.md) for database schema
5. **Consult Agent Context**: Reference [.specify/memory/agent-file.md](../../.specify/memory/agent-file.md) during implementation

**Implementation Order** (recommended):
1. Project scaffolding (package.json, tsconfig.json, docker-compose.yml)
2. Domain entities (Patient, Report, Analysis, ClinicalNote)
3. Port interfaces (repositories, file storage, analysis engine)
4. Mock adapters (InMemory*, Mock*)
5. Domain services (PatientService, ReportService)
6. API layer (routes, controllers, middleware)
7. Database migrations (TypeORM)
8. Production adapters (TypeORM repositories, LocalFileStorage)

**Success Criteria**:
- ✅ All endpoints in OpenAPI spec functional
- ✅ Hexagonal architecture verified (domain has no external deps)
- ✅ Mock adapters allow development without database
- ✅ PostgreSQL integration working via TypeORM
- ✅ File uploads working with hash-based duplicate detection
- ✅ Analysis engine produces mocked results
- ✅ Patient summary endpoint aggregates all data

## Deployment Considerations (Future)

**Containerization**:
```dockerfile
# Multi-stage Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/index.js"]
```

**Azure Deployment**:
- Use Azure Container Apps for serverless containers
- Azure Database for PostgreSQL for managed database
- Azure Blob Storage adapter for file storage (swap LocalFileStorage)
- Azure Key Vault for secrets (API keys, connection strings)
- Application Insights for monitoring

**Cloud-Agnostic Strategy**:
- All cloud services accessed via port interfaces
- No Azure SDK in domain layer
- Environment variables for all external config
- Docker Compose for local development parity

## Monitoring & Observability (Future)

**Metrics** (deferred to post-MVP):
- Request latency per endpoint
- File upload sizes and durations
- Analysis engine processing times
- Database query performance

**Logging**:
- Structured JSON logs (winston/pino)
- Request/response logging middleware
- Error stack traces with context
- Audit trail for all data modifications

**Health Checks**:
- `/api/v1/health` endpoint (already specified)
- Database connectivity check
- File storage availability check
- Analysis engine status

---

**Plan Generated**: 2026-01-28  
**Branch**: `001-patient-reports-api`  
**Constitution**: v1.0.1  
**Status**: ✅ COMPLETE - Ready for `/speckit.tasks`
