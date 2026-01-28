# Tasks: Patient Reports Backend API

**Input**: Design documents from `/specs/001-patient-reports-api/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Per constitution, tests are DEFERRED - no test tasks included in this implementation

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions

Single backend project at repository root:
- `src/domain/` - Core business logic (entities, ports, services)
- `src/infrastructure/` - Adapters (database, storage, analysis)
- `src/api/` - HTTP layer (routes, controllers, middleware)
- `migrations/` - TypeORM database migrations
- `docker/` - Docker Compose configuration

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create package.json with Node.js 18 LTS, TypeScript 5.x, Express, TypeORM, Multer dependencies
- [ ] T002 Create tsconfig.json with strict mode, path aliases (@domain, @infrastructure, @api)
- [ ] T003 [P] Create docker-compose.yml with PostgreSQL 15 service per research.md
- [ ] T004 [P] Create .env.example with all configuration variables per quickstart.md
- [ ] T005 [P] Create .gitignore for node_modules, dist, .env, data/uploads
- [ ] T006 [P] Create ESLint configuration with TypeScript rules and hexagonal architecture checks
- [ ] T007 Create directory structure per plan.md (src/domain, src/infrastructure, src/api, migrations, docker)
- [ ] T008 [P] Create README.md with quickstart instructions reference

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T009 Create domain entity base class in src/domain/entities/BaseEntity.ts with id, createdAt, updatedAt, deletedAt
- [X] T010 [P] Define PatientRepositoryPort interface in src/domain/ports/PatientRepository.ts
- [X] T011 [P] Define ReportRepositoryPort interface in src/domain/ports/ReportRepository.ts
- [X] T012 [P] Define AnalysisRepositoryPort interface in src/domain/ports/AnalysisRepository.ts
- [X] T013 [P] Define ClinicalNoteRepositoryPort interface in src/domain/ports/ClinicalNoteRepository.ts
- [X] T014 [P] Define FileStoragePort interface in src/domain/ports/FileStoragePort.ts
- [X] T015 [P] Define AnalysisEnginePort interface in src/domain/ports/AnalysisEnginePort.ts
- [X] T016 Create TypeORM DataSource configuration in src/infrastructure/config/database.ts
- [X] T017 Create Express application bootstrap in src/api/app.ts with middleware setup
- [X] T018 Create main entry point in src/index.ts with server startup and adapter wiring
- [X] T019 [P] Create error handler middleware in src/api/middleware/errorHandler.ts
- [X] T020 [P] Create validation middleware using class-validator in src/api/middleware/validation.ts
- [X] T021 [P] Create file upload middleware using Multer in src/api/middleware/fileUpload.ts with 50MB limit
- [X] T022 Create health check endpoint in src/api/routes/health.ts per openapi.yaml
- [X] T023 Configure environment loading with dotenv in src/infrastructure/config/Config.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Patient Management (Priority: P1) 🎯 MVP

**Goal**: Clinicians can create, list, search, and retrieve patient records

**Independent Test**: Create patients via API POST /patients, list with GET /patients, search with GET /patients/search, retrieve with GET /patients/:id

### Domain Layer for User Story 1

- [X] T024 [P] [US1] Create Patient domain entity in src/domain/entities/Patient.ts with id, medicalRecordNumber, name, dateOfBirth, contactInfo per data-model.md
- [X] T025 [US1] Implement PatientService in src/domain/services/PatientService.ts with create, findById, findByMRN, search, listAll methods

### Infrastructure Layer for User Story 1

- [X] T026 [P] [US1] Create PatientEntity TypeORM entity in src/infrastructure/persistence/entities/PatientEntity.ts per data-model.md schema
- [X] T027 [US1] Generate TypeORM migration CreatePatientsTable in migrations/ per data-model.md
- [X] T028 [US1] Implement InMemoryPatientRepository mock adapter in src/infrastructure/persistence/repositories/InMemoryPatientRepository.ts
- [X] T029 [US1] Implement TypeORMPatientRepository production adapter in src/infrastructure/persistence/repositories/TypeORMPatientRepository.ts

### API Layer for User Story 1

- [X] T030 [P] [US1] Create CreatePatientDto in src/api/dto/CreatePatientDto.ts with class-validator decorators
- [X] T031 [P] [US1] Create PatientResponseDto in src/api/dto/PatientResponseDto.ts
- [X] T032 [US1] Implement PatientController in src/api/controllers/PatientController.ts with create, list, search, getById handlers
- [X] T033 [US1] Create patient routes in src/api/routes/patients.ts per openapi.yaml endpoints

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Report Upload & Storage (Priority: P1) 🎯 MVP

**Goal**: Clinicians can upload medical reports (PDF, DOCX, images) for patients and retrieve report lists

**Independent Test**: Upload files via POST /patients/:id/reports, list with GET /patients/:id/reports, download with GET /reports/:id/file

### Domain Layer for User Story 2

- [X] T034 [P] [US2] Create Report domain entity in src/domain/entities/Report.ts with id, patientId, reportDate, fileName, fileHash, fileSize per data-model.md
- [X] T035 [P] [US2] Create FileReference value object in src/domain/entities/FileReference.ts
- [X] T036 [US2] Implement ReportService in src/domain/services/ReportService.ts with upload, findByPatient, findById, downloadFile, checkDuplicate methods

### Infrastructure Layer for User Story 2

- [X] T037 [P] [US2] Create ReportEntity TypeORM entity in src/infrastructure/persistence/entities/ReportEntity.ts per data-model.md schema
- [X] T038 [US2] Generate TypeORM migration CreateReportsTable in migrations/ per data-model.md with file_hash unique index
- [X] T039 [US2] Implement InMemoryReportRepository mock adapter in src/infrastructure/persistence/repositories/InMemoryReportRepository.ts
- [X] T040 [US2] Implement TypeORMReportRepository production adapter in src/infrastructure/persistence/repositories/TypeORMReportRepository.ts
- [X] T041 [P] [US2] Implement MockFileStorage adapter in src/infrastructure/storage/MockFileStorage.ts with in-memory buffer storage
- [X] T042 [US2] Implement LocalFileStorage production adapter in src/infrastructure/storage/LocalFileStorage.ts with SHA-256 hash calculation

### API Layer for User Story 2

- [X] T043 [P] [US2] Create UploadReportDto in src/api/dto/UploadReportDto.ts with multipart validation
- [X] T044 [P] [US2] Create ReportResponseDto in src/api/dto/ReportResponseDto.ts
- [X] T045 [US2] Implement ReportController in src/api/controllers/ReportController.ts with upload, listByPatient, getById, downloadFile handlers
- [X] T046 [US2] Create report routes in src/api/routes/reports.ts per openapi.yaml with Multer middleware for file uploads
- [X] T047 [US2] Add duplicate detection logic in ReportService using fileHash comparison
- [X] T048 [US2] Add file type validation (PDF, DOCX, JPEG, PNG) in file upload middleware

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - patients can be created and reports uploaded

---

## Phase 5: User Story 3 - Report Analysis & Summary (Priority: P2)

**Goal**: Automated analysis of medical reports with trend detection and summary generation

**Independent Test**: Trigger analysis via POST /reports/:id/analyze, retrieve with GET /reports/:id/analysis

### Domain Layer for User Story 3

- [ ] T049 [P] [US3] Create Analysis domain entity in src/domain/entities/Analysis.ts with id, reportId, extractedData, trendIndicators, confidenceScore, summaryText per data-model.md
- [ ] T050 [P] [US3] Create AnalysisResult value object in src/domain/entities/AnalysisResult.ts for structured findings
- [ ] T051 [US3] Implement AnalysisService in src/domain/services/AnalysisService.ts with analyzeReport, findByReport, compareTrends methods

### Infrastructure Layer for User Story 3

- [ ] T052 [P] [US3] Create AnalysisEntity TypeORM entity in src/infrastructure/persistence/entities/AnalysisEntity.ts per data-model.md schema
- [ ] T053 [US3] Generate TypeORM migration CreateAnalysesTable in migrations/ per data-model.md
- [ ] T054 [US3] Implement InMemoryAnalysisRepository mock adapter in src/infrastructure/persistence/repositories/InMemoryAnalysisRepository.ts
- [ ] T055 [US3] Implement TypeORMAnalysisRepository production adapter in src/infrastructure/persistence/repositories/TypeORMAnalysisRepository.ts
- [ ] T056 [US3] Implement MockAnalysisEngine adapter in src/infrastructure/analysis/MockAnalysisEngine.ts with pattern-matching logic per research.md
- [ ] T057 [US3] Add mock analysis patterns for lab reports (hemoglobin, glucose, cholesterol values) in MockAnalysisEngine
- [ ] T058 [P] [US3] Add mock analysis patterns for imaging reports (findings, impressions) in MockAnalysisEngine
- [ ] T059 [P] [US3] Add mock analysis patterns for pathology reports (diagnoses, specimen info) in MockAnalysisEngine
- [ ] T060 [US3] Add trend detection logic in AnalysisService comparing multiple analyses for same patient
- [ ] T061 [US3] Add partial result handling for failed analyses per clarifications in spec.md

### API Layer for User Story 3

- [ ] T062 [P] [US3] Create AnalysisResponseDto in src/api/dto/AnalysisResponseDto.ts
- [ ] T063 [US3] Implement AnalysisController in src/api/controllers/AnalysisController.ts with analyzeReport, getAnalysis handlers
- [ ] T064 [US3] Create analysis routes in src/api/routes/analyses.ts per openapi.yaml
- [ ] T065 [US3] Add automatic analysis trigger on report upload in ReportService

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work - full report analysis pipeline functional

---

## Phase 6: User Story 4 - Clinical Notes (Priority: P3)

**Goal**: Clinicians can add, list, and delete clinical notes on reports

**Independent Test**: Add notes via POST /reports/:id/notes, list with GET /reports/:id/notes, delete with DELETE /notes/:id

### Domain Layer for User Story 4

- [ ] T066 [P] [US4] Create ClinicalNote domain entity in src/domain/entities/ClinicalNote.ts with id, reportId, content, authorIdentifier per data-model.md
- [ ] T067 [US4] Implement ClinicalNoteService in src/domain/services/ClinicalNoteService.ts with create, findByReport, softDelete methods

### Infrastructure Layer for User Story 4

- [ ] T068 [P] [US4] Create ClinicalNoteEntity TypeORM entity in src/infrastructure/persistence/entities/ClinicalNoteEntity.ts per data-model.md schema
- [ ] T069 [US4] Generate TypeORM migration CreateClinicalNotesTable in migrations/ per data-model.md
- [ ] T070 [US4] Implement InMemoryClinicalNoteRepository mock adapter in src/infrastructure/persistence/repositories/InMemoryClinicalNoteRepository.ts
- [ ] T071 [US4] Implement TypeORMClinicalNoteRepository production adapter in src/infrastructure/persistence/repositories/TypeORMClinicalNoteRepository.ts

### API Layer for User Story 4

- [ ] T072 [P] [US4] Create CreateNoteDto in src/api/dto/CreateNoteDto.ts with class-validator decorators
- [ ] T073 [P] [US4] Create ClinicalNoteResponseDto in src/api/dto/ClinicalNoteResponseDto.ts
- [ ] T074 [US4] Implement ClinicalNoteController in src/api/controllers/ClinicalNoteController.ts with create, listByReport, delete handlers
- [ ] T075 [US4] Create clinical notes routes in src/api/routes/notes.ts per openapi.yaml
- [ ] T076 [US4] Add ordering logic to return newest notes first in ClinicalNoteService

**Checkpoint**: At this point, all user stories 1-4 should work - clinicians can annotate reports

---

## Phase 7: User Story 5 - Comprehensive Patient Summary (Priority: P3)

**Goal**: Generate consolidated timeline view of all patient data (demographics, reports, analyses, notes)

**Independent Test**: Request summary via GET /patients/:id/summary with optional filters

### Domain Layer for User Story 5

- [ ] T077 [P] [US5] Create PatientSummary value object in src/domain/entities/PatientSummary.ts with timeline structure per openapi.yaml
- [ ] T078 [P] [US5] Create TimelineEvent value object in src/domain/entities/TimelineEvent.ts
- [ ] T079 [US5] Implement SummaryService in src/domain/services/SummaryService.ts with generateSummary, applyFilters, highlightCriticalFindings methods

### API Layer for User Story 5

- [ ] T080 [P] [US5] Create PatientSummaryResponseDto in src/api/dto/PatientSummaryResponseDto.ts
- [ ] T081 [P] [US5] Create SummaryQueryDto in src/api/dto/SummaryQueryDto.ts with date range filters
- [ ] T082 [US5] Implement summary handler in PatientController using SummaryService
- [ ] T083 [US5] Add summary route GET /patients/:id/summary to src/api/routes/patients.ts per openapi.yaml
- [ ] T084 [US5] Add critical findings highlighting logic in SummaryService based on analysis confidence scores

**Checkpoint**: All user stories should now be independently functional - complete MVP delivered

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T085 [P] Add request logging middleware with pino structured logging in src/api/middleware/requestLogger.ts
- [ ] T086 [P] Add OpenAPI documentation serving with Swagger UI at /api-docs endpoint
- [ ] T087 [P] Create Dockerfile with multi-stage build per plan.md deployment considerations
- [ ] T088 Add database connection health check in health endpoint
- [ ] T089 Add file storage health check in health endpoint
- [ ] T090 [P] Add input sanitization for all string fields to prevent injection attacks [Maps to FR-033]
- [ ] T091 [P] Add rate limiting middleware for API endpoints (basic express-rate-limit)
- [ ] T092 Validate all environment variables at startup in Config.ts
- [ ] T093 [P] Add graceful shutdown handling in index.ts for SIGTERM/SIGINT
- [ ] T094 Run database migrations automatically on startup in production mode
- [ ] T095 [P] Add API versioning support (v1 prefix) consistently across all routes
- [ ] T096 Create example requests file (curl/Postman) based on quickstart.md examples
- [ ] T097 Validate hexagonal architecture boundaries with ESLint (domain has no infrastructure imports)
- [ ] T098 Run quickstart.md validation with Docker Compose setup
- [ ] T099 [P] Update README.md with architecture diagram and quick links
- [ ] T100 Add mock-to-production adapter switching documentation in quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - **BLOCKS all user stories**
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order: US1 → US2 → US3 → US4 → US5
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - **Depends on US1 Patient entity** but should reference via ID only
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - **Depends on US2 Report entity** but should reference via ID only
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - **Depends on US2 Report entity** but should reference via ID only
- **User Story 5 (P3)**: **Depends on completion of US1, US2, US3, US4** as it aggregates all data

**Critical Path**: Phase 1 → Phase 2 → US1 → US2 → US3 → US5 (for full feature)

**MVP Path**: Phase 1 → Phase 2 → US1 → US2 (patient management + report upload = minimal viable demo)

### Within Each User Story

Standard execution order within a story:
1. Domain entities and value objects (can be parallel if no dependencies)
2. Port interfaces (already done in Foundational phase)
3. Domain services (depend on entities)
4. Infrastructure adapters - mock first, then production (can be parallel)
5. TypeORM migrations (after TypeORM entities)
6. API DTOs (can be parallel with services)
7. API controllers (depend on services and DTOs)
8. API routes (depend on controllers)

### Parallel Opportunities Per Story

**User Story 1 (Patient Management)**:
- T024 Patient entity + T026 PatientEntity TypeORM + T030 CreatePatientDto + T031 ResponseDto can run in parallel
- T028 InMemoryRepository + T029 TypeORMRepository can run in parallel

**User Story 2 (Report Upload)**:
- T034 Report entity + T035 FileReference + T037 ReportEntity TypeORM + T043 UploadDto + T044 ResponseDto can run in parallel
- T039 InMemoryRepository + T040 TypeORMRepository can run in parallel
- T041 MockFileStorage + T042 LocalFileStorage can run in parallel

**User Story 3 (Analysis)**:
- T049 Analysis entity + T050 AnalysisResult + T052 AnalysisEntity TypeORM + T062 ResponseDto can run in parallel
- T054 InMemoryRepository + T055 TypeORMRepository can run in parallel
- T057, T058, T059 (different pattern sets) can run in parallel

**User Story 4 (Clinical Notes)**:
- T066 ClinicalNote entity + T068 NoteEntity TypeORM + T072 CreateDto + T073 ResponseDto can run in parallel
- T070 InMemoryRepository + T071 TypeORMRepository can run in parallel

**User Story 5 (Summary)**:
- T077 PatientSummary + T078 TimelineEvent + T080 ResponseDto + T081 QueryDto can run in parallel

**Polish Phase**:
- T085, T086, T087, T090, T091, T093, T095, T099, T100 can all run in parallel (different concerns)

---

## Parallel Example: User Story 2 (Report Upload)

```bash
# Launch all parallelizable entity/DTO tasks together:
Task: "Create Report domain entity in src/domain/entities/Report.ts"
Task: "Create FileReference value object in src/domain/entities/FileReference.ts"
Task: "Create ReportEntity TypeORM entity in src/infrastructure/persistence/entities/ReportEntity.ts"
Task: "Create UploadReportDto in src/api/dto/UploadReportDto.ts"
Task: "Create ReportResponseDto in src/api/dto/ReportResponseDto.ts"

# After ReportService is complete, launch both repository adapters:
Task: "Implement InMemoryReportRepository in src/infrastructure/persistence/repositories/"
Task: "Implement TypeORMReportRepository in src/infrastructure/persistence/repositories/"

# Launch both storage adapters in parallel:
Task: "Implement MockFileStorage adapter in src/infrastructure/storage/MockFileStorage.ts"
Task: "Implement LocalFileStorage adapter in src/infrastructure/storage/LocalFileStorage.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1-2 Only)

**Goal**: Minimal demo with patient management and report upload

1. Complete Phase 1: Setup ✅
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories) ✅
3. Complete Phase 3: User Story 1 (Patient Management) ✅
4. Complete Phase 4: User Story 2 (Report Upload & Storage) ✅
5. **STOP and VALIDATE**: Test patient creation + report upload flow
6. Deploy/demo if ready

**Estimated Tasks**: ~48 tasks (T001-T048)  
**Value Delivered**: Working patient registry with document management

### Incremental Delivery (Recommended)

1. **Foundation** (Phase 1-2): ~23 tasks → Environment ready
2. **MVP** (Phase 3-4): ~25 tasks → Patient + Report management working
3. **Analysis** (Phase 5): ~17 tasks → Add automated analysis
4. **Annotations** (Phase 6): ~11 tasks → Add clinical notes
5. **Summary** (Phase 7): ~8 tasks → Add comprehensive patient view
6. **Production Ready** (Phase 8): ~16 tasks → Add polish + deployment

Each milestone delivers independently testable value.

### Parallel Team Strategy

With 3 developers after Foundational phase:

- **Developer A**: User Story 1 (Patient Management) → T024-T033
- **Developer B**: User Story 2 (Report Upload) → T034-T048 (⚠️ needs Patient entity reference)
- **Developer C**: Setup Phase 8 Polish infrastructure → T085-T100

Then:
- **Developer A**: User Story 4 (Clinical Notes) → T066-T076
- **Developer B**: User Story 3 (Analysis) → T049-T065
- **Developer C**: User Story 5 (Summary) → T077-T084 (waits for others)

---

## Constitution Compliance Checklist

✅ **Hexagonal Architecture**: Domain entities (Phase 3-7) → Port interfaces (Phase 2) → Adapters (Infrastructure layer)  
✅ **Mock-First**: Every port has InMemory/Mock adapter before production adapter  
✅ **No Tests**: Tests deferred per constitution - no test tasks included  
✅ **Healthcare Integrity**: Audit trails (createdAt, updatedAt, deletedAt) in all entities  
✅ **LLM Ready**: AnalysisEnginePort allows swapping MockAnalysisEngine for real LLM  
✅ **Rapid Iteration**: Can run with all mock adapters (no PostgreSQL, no real storage)

---

## Task Statistics

- **Total Tasks**: 100
- **Setup Phase**: 8 tasks
- **Foundational Phase**: 15 tasks (BLOCKING)
- **User Story 1 (P1)**: 10 tasks
- **User Story 2 (P1)**: 15 tasks
- **User Story 3 (P2)**: 17 tasks
- **User Story 4 (P3)**: 11 tasks
- **User Story 5 (P3)**: 8 tasks
- **Polish Phase**: 16 tasks

**Parallel Tasks**: 47 tasks marked [P] (47% parallelizable)  
**Critical Path Length**: ~53 sequential tasks (with optimal parallelization)  
**MVP Tasks (US1+US2)**: 48 tasks (48% of total)

---

## Notes

- Each task specifies exact file path for implementation
- [P] tasks work on different files and can run in parallel
- [Story] labels enable tracking which features are complete
- Stop at any checkpoint to validate story works independently
- Constitution mandates: domain has NO infrastructure imports (enforce with ESLint in T097)
- All external dependencies accessed via port interfaces (T010-T015)
- TypeORM entities separate from domain entities to prevent ORM coupling
- Mock adapters enable development without Docker/PostgreSQL
- Real LLM integration: swap MockAnalysisEngine for OpenAIAnalysisEngine/ClaudeAnalysisEngine (no domain changes)
- FR-034 (concurrent operations): Handled by TypeORM transaction isolation in repository implementations (T029, T040, T055, T071)

---

**Generated**: 2026-01-28  
**Feature**: 001-patient-reports-api  
**Constitution**: v1.0.1  
**Status**: ✅ Ready for Implementation
