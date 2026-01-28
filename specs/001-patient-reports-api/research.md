# Research: Patient Reports Backend API

**Feature**: 001-patient-reports-api  
**Date**: 2026-01-28  
**Phase**: 0 - Research & Technology Decisions

## Overview

This document captures research findings and technology decisions for implementing the patient reports backend API. All decisions align with project constitution requirements: hexagonal architecture, mock-first development, minimal dependencies, cloud-agnostic containerization.

## Research Areas

### 1. Database Selection for Healthcare Data

**Question**: Which database technology best supports healthcare report metadata with audit trails, relationships, and future scalability?

**Options Evaluated**:
- PostgreSQL: ACID compliance, JSON support, mature ecosystem
- MongoDB: Document-oriented, flexible schema
- SQLite: Embedded, zero-config, excellent for mocking
- In-Memory: Pure TypeScript, fastest for development

**Decision**: **PostgreSQL 15** (production) + **SQLite** (mock/dev)

**Rationale**:
- PostgreSQL provides ACID guarantees critical for healthcare data integrity
- JSON/JSONB columns support flexible analysis result storage
- Strong TypeORM support with migrations
- Docker Compose provides easy local setup
- SQLite serves as lightweight mock adapter during rapid iteration
- Both supported by TypeORM with minimal code changes (adapter pattern)
- PostgreSQL widely supported in cloud platforms (Azure Database, AWS RDS, GCP Cloud SQL)

**Alternatives Considered**:
- MongoDB rejected: Relations between Patient→Report→Analysis→Notes better suited to relational model
- Pure in-memory rejected: Need persistent storage for demo, but still implement InMemoryRepository for testing

---

### 2. File Storage Strategy

**Question**: How should medical report files be stored following hexagonal architecture with mock-first approach?

**Options Evaluated**:
- Local filesystem with organized directory structure
- Cloud blob storage (S3/Azure Blob) with SDK
- Database BLOB columns
- In-memory buffers for mocking

**Decision**: **Local Filesystem** (initial) behind **FileStoragePort** interface

**Rationale**:
- Port interface: `FileStoragePort` with `save(buffer, metadata)`, `retrieve(fileId)`, `delete(fileId)`
- Mock adapter: `MockFileStorage` stores files in memory (Map<id, Buffer>)
- Initial adapter: `LocalFileStorage` uses `uploads/` directory organized by patient ID
- Future adapter: `BlobStorageAdapter` for S3/Azure Blob (same interface)
- Local filesystem requires zero external dependencies for MVP
- Supports Docker volume mounting for persistence
- File hash calculated on upload for duplicate detection (crypto.createHash)
- Organized structure: `uploads/{patientId}/{reportId}.{ext}`

**Alternatives Considered**:
- Database BLOBs rejected: Poor performance for large files, hard to back up
- Immediate cloud storage rejected: Violates mock-first principle, adds complexity

---

### 3. Analysis Engine Architecture

**Question**: How to structure analysis engine for mock-first development with future LLM integration?

**Options Evaluated**:
- Direct LLM SDK calls in service layer
- Strategy pattern with provider selection
- Port/adapter with pluggable implementations
- Queue-based async processing

**Decision**: **Port/Adapter Pattern** with **MockAnalysisEngine** initial implementation

**Rationale**:
- Port interface: `AnalysisEnginePort` with `analyze(reportContent, reportType): Promise<AnalysisResult>`
- Mock implementation: Pattern matching on keywords, fixture data for report types
- Mock produces realistic structured output: lab values, diagnoses, trends, confidence scores
- Future LLM adapter: `LLMAnalysisEngine` implements same interface, delegates to OpenAI/Claude
- Prompt management: JSON files in `infrastructure/config/prompts/` directory
- Result schema defined in domain layer (framework-agnostic)
- Async by default (Promise-based) to support future LLM latency

**Mock Analysis Strategy**:
```typescript
// MockAnalysisEngine.ts
- Detect report type from content/filename patterns
- Extract key medical terms using regex/keyword matching
- Generate fixture lab values based on report type
- Return structured JSON with confidence score (0.7-0.9 for mock)
- Simulate partial failures based on configuration
```

**Alternatives Considered**:
- Direct OpenAI integration rejected: Violates mock-first, expensive for dev
- LangChain framework rejected: Heavy dependency, over-engineered for needs

---

### 4. API Design Pattern

**Question**: What REST API design pattern best supports CRUD operations with file uploads and analysis triggers?

**Options Evaluated**:
- Pure REST with nested resources
- REST with RPC-style endpoints for actions
- GraphQL for flexible queries
- CQRS with command/query separation

**Decision**: **REST with Resource Nesting** + **Action Endpoints**

**Rationale**:
- Resource structure follows domain model:
  - `/api/patients` - Patient CRUD
  - `/api/patients/:id/reports` - Reports nested under patient
  - `/api/reports/:id/analyze` - Analysis as POST action
  - `/api/reports/:id/notes` - Notes nested under report
  - `/api/patients/:id/summary` - Summary as GET action
- Standard HTTP methods: GET, POST, DELETE
- File uploads via multipart/form-data with Multer middleware
- Action endpoints for operations that aren't pure CRUD
- JSON responses with consistent error format
- OpenAPI/Swagger spec generation for documentation

**API Conventions**:
- All endpoints prefixed with `/api/v1/` for versioning
- Consistent error responses: `{ error: string, details?: any }`
- Success responses: wrap data in `{ data: ... }` or return entity directly
- Pagination: query params `?page=1&limit=50` (deferred for MVP per spec)
- File upload: POST to `/api/patients/:id/reports` with multipart form data

**Alternatives Considered**:
- GraphQL rejected: Over-engineered for backend-only demo, no frontend to benefit
- CQRS rejected: Adds complexity without clear benefit for CRUD-heavy API

---

### 5. TypeScript Configuration & Type Safety

**Question**: How to maximize type safety while supporting hexagonal architecture separation?

**Options Evaluated**:
- Strict TypeScript with no-implicit-any
- Moderate TypeScript (some implicit any allowed)
- Path aliases for clean imports
- Shared types vs per-layer types

**Decision**: **Strict TypeScript** with **Path Aliases** and **Domain-First Types**

**Rationale**:
- `tsconfig.json` with `strict: true`, `noImplicitAny: true`
- Path aliases for clean imports:
  ```json
  "@domain/*": ["src/domain/*"],
  "@infrastructure/*": ["src/infrastructure/*"],
  "@api/*": ["src/api/*"]
  ```
- Domain types defined in `src/domain/entities/` and `src/domain/ports/`
- Infrastructure/API layers import domain types (dependency inversion)
- TypeORM entities use `class-transformer` to convert from domain entities
- No domain code imports infrastructure/API code (enforced by ESLint rules)

**Type Strategy**:
- Domain entities: Pure TypeScript classes with methods
- Port interfaces: TypeScript interfaces with async signatures
- DTOs: Defined in API layer for request/response transformation
- Validation: class-validator decorators on DTOs, not domain entities

**Alternatives Considered**:
- Loose TypeScript rejected: Defeats purpose of TypeScript for safety
- No path aliases rejected: Leads to messy relative imports `../../../domain/`

---

### 6. Docker & Containerization Strategy

**Question**: How to structure Docker setup for local development and cloud deployment?

**Options Evaluated**:
- Single Dockerfile with multi-stage build
- Docker Compose for all services
- Dev containers with hot reload
- Separate dev/prod Docker configs

**Decision**: **Docker Compose for Dev** + **Multi-Stage Dockerfile for Prod**

**Rationale**:
- `docker-compose.yml` defines:
  - PostgreSQL service (postgres:15-alpine)
  - pgAdmin for database management (optional)
  - Application service with volume mounts for hot reload
- Multi-stage Dockerfile:
  - Stage 1: Builder (install deps, compile TypeScript)
  - Stage 2: Runtime (copy dist/, run node)
  - Results in slim production image
- Volume mounts in dev: `./src:/app/src`, `./uploads:/app/uploads`
- Environment variables: `.env` file for local, secrets for cloud
- Health checks: `/health` endpoint, Docker HEALTHCHECK directive

**docker-compose.yml Structure**:
```yaml
services:
  postgres:
    image: postgres:15-alpine
    ports: ["5432:5432"]
    volumes: [postgres-data:/var/lib/postgresql/data]
    environment: [POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD]
  
  app:
    build: .
    ports: ["3000:3000"]
    volumes: [./src:/app/src, ./uploads:/app/uploads]
    environment: [DATABASE_URL, NODE_ENV]
    depends_on: [postgres]
```

**Alternatives Considered**:
- Kubernetes rejected: Over-engineered for demo, Docker Compose sufficient
- Single Dockerfile rejected: Harder to optimize dev vs prod

---

### 7. Minimal Dependencies Philosophy

**Question**: Which dependencies are truly essential vs nice-to-have?

**Essential Dependencies** (Included):
- `express` - HTTP server (minimal, well-understood)
- `typeorm` - Database abstraction (supports mocking)
- `pg` - PostgreSQL driver (TypeORM peer dependency)
- `multer` - File upload handling (standard Express middleware)
- `typescript` - Type safety
- `ts-node` - Dev execution
- `dotenv` - Environment configuration
- `crypto` (built-in) - File hashing

**Development Dependencies**:
- `nodemon` - Hot reload in development
- `@types/*` - TypeScript definitions
- `eslint` + `@typescript-eslint` - Linting
- `prettier` - Code formatting

**Explicitly Avoided** (Adds Complexity):
- ORMs other than TypeORM (Prisma, Sequelize): TypeORM sufficient, great mock support
- Validation libraries beyond class-validator: Keep validation simple
- Logger frameworks (Winston, Pino): Use console.log initially, port interface later
- Authentication libraries: Mocked clinician identity per spec
- Swagger/OpenAPI generators: Manually write contracts initially
- Rate limiting, caching: Defer until performance requirements defined
- Testing frameworks: Jest deferred per constitution

---

### 8. Audit Trail Implementation

**Question**: How to implement audit trails for all operations per healthcare requirements?

**Decision**: **Timestamps + Soft Deletes** on all entities

**Rationale**:
- All entities have: `createdAt`, `updatedAt`, `deletedAt` (nullable)
- TypeORM decorators: `@CreateDateColumn()`, `@UpdateDateColumn()`, `@DeleteDateColumn()`
- Soft deletes via TypeORM: `repository.softDelete(id)` sets `deletedAt`
- Query filtering: Automatically exclude soft-deleted unless `.withDeleted()` used
- Notes are append-only (per spec clarification) - no updates needed
- Future enhancement: Audit log table for detailed operation history

**Implementation Pattern**:
```typescript
@Entity()
export class BaseEntity {
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
```

---

## Research Summary

### Technologies Selected

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Language | Node.js 18 LTS + TypeScript 5 | Modern, type-safe, excellent ecosystem |
| Framework | Express.js | Minimal, flexible, well-understood |
| Database (Prod) | PostgreSQL 15 | ACID, JSON support, cloud-ready |
| Database (Mock) | SQLite / In-Memory | Lightweight, no external dependencies |
| ORM | TypeORM | Mock-friendly, supports multiple databases |
| File Storage (Initial) | Local Filesystem | Zero dependencies, port-based architecture |
| File Upload | Multer | Standard Express middleware |
| Analysis (Mock) | Pattern matching | Fixture-based, fast, deterministic |
| Containerization | Docker + Docker Compose | Dev consistency, cloud deployment |

### Architecture Decisions

1. **Hexagonal Architecture**: Domain at center, infrastructure and API as adapters
2. **Mock-First**: All external dependencies have mock implementations first
3. **Port Interfaces**: TypeScript interfaces define contracts between layers
4. **Dependency Inversion**: Domain defines interfaces, infrastructure implements
5. **Cloud-Agnostic**: No cloud-specific SDKs, ready for any container platform
6. **Minimal Dependencies**: Only essential packages, avoid framework bloat

### Unknowns Resolved

All "NEEDS CLARIFICATION" items from Technical Context resolved:
- ✅ Language: Node.js 18 LTS with TypeScript 5.x
- ✅ Dependencies: Express, TypeORM, Multer, minimal set
- ✅ Storage: PostgreSQL (production), SQLite (mock)
- ✅ Testing: Deferred per constitution
- ✅ Performance: Deferred per constitution
- ✅ Scale: Demo scale ~100 patients

### Next Steps

Proceed to **Phase 1: Design** to generate:
1. `data-model.md` - Entity relationships and database schema
2. `contracts/` - OpenAPI specification for REST endpoints
3. `quickstart.md` - Setup and development instructions
4. Agent context update with technology stack
