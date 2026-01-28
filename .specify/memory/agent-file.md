# LifeSpire Agent Context

**Project**: Patient Reports Backend API  
**Version**: 1.0.0  
**Last Updated**: 2026-01-28

---

## Technology Stack

### Core Runtime
- **Language**: Node.js 18 LTS
- **Type System**: TypeScript 5.x (strict mode)
- **Package Manager**: npm 8+

### Backend Framework
- **Web Framework**: Express.js (minimal REST API)
- **Database ORM**: TypeORM with migrations
- **Validation**: class-validator + class-transformer

### Data Layer
- **Production Database**: PostgreSQL 15
- **Mock Database**: SQLite (in-memory)
- **File Upload**: Multer middleware
- **File Storage**: Local filesystem (port-based for future S3/Azure Blob)

### Development Tools
- **Runtime**: tsx / ts-node
- **Hot Reload**: nodemon
- **Containerization**: Docker + Docker Compose
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier

### Testing (Deferred)
- **Framework**: Jest (not implemented in MVP per constitution)
- **Strategy**: Mock-first adapters enable testing without external dependencies

---

## Architecture: Hexagonal (Ports & Adapters)

**MANDATORY** per constitution. All external dependencies must use port interfaces.

### Layer Structure

```
src/
├── domain/              ← CORE (no external dependencies)
│   ├── entities/        ← Business objects (Patient, Report, Analysis, ClinicalNote)
│   ├── ports/           ← Interface definitions for external systems
│   └── services/        ← Business logic use cases
├── infrastructure/      ← ADAPTERS (implements ports)
│   ├── persistence/     ← Database adapters (TypeORM repositories)
│   ├── storage/         ← File storage adapters
│   └── analysis/        ← Analysis engine adapters
└── api/                 ← HTTP LAYER (Express controllers)
    ├── controllers/
    ├── middleware/
    └── dto/
```

### Dependency Rules

1. **Domain** depends on NOTHING external
2. **Infrastructure** implements domain ports
3. **API** uses domain services (never touches adapters directly)
4. All dependencies point INWARD toward domain

### Example Port Definition

```typescript
// domain/ports/AnalysisEnginePort.ts
export interface AnalysisEnginePort {
  analyzeReport(fileBuffer: Buffer, reportType: string): Promise<AnalysisResult>;
}

// infrastructure/analysis/MockAnalysisEngine.ts
export class MockAnalysisEngine implements AnalysisEnginePort {
  async analyzeReport(fileBuffer: Buffer, reportType: string): Promise<AnalysisResult> {
    // Mock implementation with pattern matching
  }
}

// infrastructure/analysis/OpenAIAnalysisEngine.ts (future)
export class OpenAIAnalysisEngine implements AnalysisEnginePort {
  async analyzeReport(fileBuffer: Buffer, reportType: string): Promise<AnalysisResult> {
    // Real LLM implementation
  }
}
```

---

## Port Interface Catalog

### Repository Ports (Data Persistence)

**PatientRepositoryPort**
- `create(patient: Patient): Promise<Patient>`
- `findById(id: string): Promise<Patient | null>`
- `findByMRN(mrn: string): Promise<Patient | null>`
- `search(query: string): Promise<Patient[]>`
- `listAll(): Promise<Patient[]>`
- `update(id: string, data: Partial<Patient>): Promise<Patient>`
- `softDelete(id: string): Promise<void>`

**ReportRepositoryPort**
- `create(report: Report): Promise<Report>`
- `findById(id: string): Promise<Report | null>`
- `findByPatientId(patientId: string): Promise<Report[]>`
- `findByFileHash(hash: string): Promise<Report | null>`
- `update(id: string, data: Partial<Report>): Promise<Report>`
- `softDelete(id: string): Promise<void>`

**AnalysisRepositoryPort**
- `create(analysis: Analysis): Promise<Analysis>`
- `findById(id: string): Promise<Analysis | null>`
- `findByReportId(reportId: string): Promise<Analysis | null>`
- `update(id: string, data: Partial<Analysis>): Promise<Analysis>`

**ClinicalNoteRepositoryPort**
- `create(note: ClinicalNote): Promise<ClinicalNote>`
- `findById(id: string): Promise<ClinicalNote | null>`
- `findByReportId(reportId: string): Promise<ClinicalNote[]>`
- `softDelete(id: string): Promise<void>`

### External System Ports

**FileStoragePort**
- `upload(fileBuffer: Buffer, metadata: FileMetadata): Promise<FileReference>`
- `download(fileReference: FileReference): Promise<Buffer>`
- `delete(fileReference: FileReference): Promise<void>`
- `calculateHash(fileBuffer: Buffer): Promise<string>`

**AnalysisEnginePort**
- `analyzeReport(fileBuffer: Buffer, reportType: string): Promise<AnalysisResult>`
- `extractEntities(text: string): Promise<ExtractedEntities>`
- `compareTrends(analyses: Analysis[]): Promise<TrendIndicators>`

---

## Development Workflow

### 1. Feature Implementation

```
1. Update domain entities if needed (domain/entities/)
2. Define port interface if external dependency needed (domain/ports/)
3. Implement mock adapter first (infrastructure/*/Mock*.ts)
4. Implement business logic (domain/services/)
5. Create API controller (api/controllers/)
6. Add routes (api/routes/)
7. Create DTOs (api/dto/)
8. Add validation (class-validator decorators)
```

### 2. Database Changes

```
1. Update TypeORM entity (infrastructure/persistence/entities/)
2. Generate migration: npm run migration:generate -- -n DescriptiveName
3. Review migration SQL
4. Run migration: npm run migration:run
5. Update domain entity if schema differs
```

### 3. Adding External Service

```
1. Define port interface (domain/ports/NewServicePort.ts)
2. Create mock adapter (infrastructure/new-service/MockNewService.ts)
3. Update bootstrap.ts to inject adapter
4. Use port in domain service
5. Later: swap mock for real implementation (no domain changes)
```

### 4. API Endpoint

```
1. Define DTO (api/dto/CreateResourceDto.ts)
2. Add validation decorators (@IsString(), @IsNotEmpty())
3. Create controller method (api/controllers/ResourceController.ts)
4. Use domain service (injected via constructor)
5. Add route (api/routes/resourceRoutes.ts)
6. Update OpenAPI spec (specs/.../contracts/openapi.yaml)
```

---

## Common Patterns

### Entity vs. DTO Separation

```typescript
// domain/entities/Patient.ts (business logic)
export class Patient {
  constructor(
    public id: string,
    public medicalRecordNumber: string,
    public name: string,
    public dateOfBirth: Date
  ) {}
  
  getAge(): number {
    // Business logic method
  }
}

// infrastructure/persistence/entities/PatientEntity.ts (database)
@Entity('patients')
export class PatientEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column({ unique: true })
  medicalRecordNumber: string;
  
  // TypeORM decorators only
}

// api/dto/CreatePatientDto.ts (HTTP request)
export class CreatePatientDto {
  @IsString()
  @IsNotEmpty()
  medicalRecordNumber: string;
  
  // Validation decorators only
}
```

### Service Dependency Injection

```typescript
// domain/services/PatientService.ts
export class PatientService {
  constructor(
    private patientRepo: PatientRepositoryPort,
    private reportRepo: ReportRepositoryPort
  ) {}
  
  async createPatient(data: CreatePatientData): Promise<Patient> {
    // Use ports, never concrete adapters
  }
}

// api/bootstrap.ts
const patientRepo = new TypeORMPatientRepository(dataSource);
const reportRepo = new TypeORMReportRepository(dataSource);
const patientService = new PatientService(patientRepo, reportRepo);
```

### Error Handling

```typescript
// domain/errors/DomainError.ts
export class PatientNotFoundError extends Error {
  constructor(id: string) {
    super(`Patient not found: ${id}`);
  }
}

// api/middleware/errorHandler.ts
export function errorHandler(err: Error, req, res, next) {
  if (err instanceof PatientNotFoundError) {
    return res.status(404).json({ error: err.message });
  }
  // ...
}
```

### File Upload Handling

```typescript
// api/middleware/uploadMiddleware.ts
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// api/controllers/ReportController.ts
router.post('/patients/:patientId/reports', upload.single('file'), async (req, res) => {
  const fileBuffer = req.file.buffer;
  // Pass to service
});
```

---

## TypeScript Configuration

### Path Aliases (tsconfig.json)

```json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@domain/*": ["domain/*"],
      "@infrastructure/*": ["infrastructure/*"],
      "@api/*": ["api/*"]
    }
  }
}
```

Usage:
```typescript
import { Patient } from '@domain/entities/Patient';
import { PatientRepositoryPort } from '@domain/ports/PatientRepositoryPort';
import { TypeORMPatientRepository } from '@infrastructure/persistence/TypeORMPatientRepository';
```

### Strict Mode Enabled

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

---

## Environment Configuration

### Required Variables (.env)

```env
# Server
NODE_ENV=development|production
PORT=3000

# Database
DB_TYPE=postgres|sqlite
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lifespire_dev
DB_USERNAME=lifespire
DB_PASSWORD=***
DB_SYNCHRONIZE=false  # Always use migrations

# File Storage
UPLOAD_DIR=./data/uploads
MAX_FILE_SIZE_MB=50

# Analysis Engine
ANALYSIS_ENGINE=mock|openai-gpt4|anthropic-claude
OPENAI_API_KEY=***  # If using OpenAI
```

### Configuration Loading

```typescript
// infrastructure/config/Config.ts
export class Config {
  static load(): AppConfig {
    dotenv.config();
    
    return {
      server: {
        port: Number(process.env.PORT) || 3000,
        env: process.env.NODE_ENV || 'development'
      },
      database: {
        type: process.env.DB_TYPE as 'postgres' | 'sqlite',
        host: process.env.DB_HOST,
        // ...
      }
    };
  }
}
```

---

## Database Conventions

### Entity Naming
- Table names: snake_case, plural (`patients`, `clinical_notes`)
- Column names: snake_case (`medical_record_number`, `report_date`)
- Foreign keys: `{entity}_id` (`patient_id`, `report_id`)

### Timestamps & Audit
All entities MUST have:
```sql
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
deleted_at TIMESTAMPTZ NULL  -- Soft delete
```

### Indexes
- Primary keys: UUID (`id UUID PRIMARY KEY DEFAULT gen_random_uuid()`)
- Foreign keys: Always indexed
- Search fields: `medical_record_number`, `name` (GIN for full-text)
- Date filters: `report_date`, `created_at`

---

## API Conventions

### REST Resource Structure

```
GET    /api/v1/patients               - List all
POST   /api/v1/patients               - Create
GET    /api/v1/patients/:id           - Get one
GET    /api/v1/patients/:id/reports   - Nested resource
POST   /api/v1/patients/:id/reports   - Create nested
```

### Response Format

**Success (200/201)**:
```json
{
  "data": { /* resource or array */ }
}
```

**Error (4xx/5xx)**:
```json
{
  "error": "Human-readable message",
  "details": { /* optional field errors */ }
}
```

### Headers
- `Content-Type: application/json` (except file uploads)
- `X-Clinician-ID: Dr. Smith` (mocked auth)

---

## Mock Adapter Strategy

**ALWAYS implement mock adapter FIRST** per constitution.

### Mock Adapter Characteristics

1. **No External Dependencies**: Works offline, no API keys
2. **Deterministic**: Same input → same output
3. **Fast**: In-memory, no I/O delays
4. **Simple Logic**: Pattern matching, hardcoded rules

### Example: MockAnalysisEngine

```typescript
export class MockAnalysisEngine implements AnalysisEnginePort {
  async analyzeReport(fileBuffer: Buffer, reportType: string): Promise<AnalysisResult> {
    const text = this.extractText(fileBuffer);
    
    return {
      extractedData: {
        labValues: this.findLabValues(text),
        diagnoses: this.findDiagnoses(text),
      },
      confidenceScore: 0.85,
      summaryText: this.generateSummary(text),
      analysisMethod: 'mock',
      completionStatus: 'complete'
    };
  }
  
  private findLabValues(text: string): LabValue[] {
    // Simple regex patterns
    if (text.includes('hemoglobin')) {
      return [{ name: 'Hemoglobin', value: 14.5, unit: 'g/dL', flag: 'normal' }];
    }
    return [];
  }
}
```

### Swapping Mock → Real

```typescript
// api/bootstrap.ts
const analysisEngine = 
  process.env.ANALYSIS_ENGINE === 'openai-gpt4'
    ? new OpenAIAnalysisEngine(config.openai)
    : process.env.ANALYSIS_ENGINE === 'anthropic-claude'
    ? new AnthropicAnalysisEngine(config.anthropic)
    : new MockAnalysisEngine();

// Domain services don't change at all
const reportService = new ReportService(reportRepo, analysisEngine, fileStorage);
```

---

## Troubleshooting Guide

### Import Path Errors

**Problem**: `Cannot find module '@domain/entities/Patient'`

**Solution**:
1. Check `tsconfig.json` has correct `paths` config
2. Restart TypeScript server: `Cmd+Shift+P → TypeScript: Restart TS Server`
3. If using tsx: ensure `tsconfig-paths/register` is loaded

### TypeORM Entity Not Found

**Problem**: `EntityMetadataNotFoundError: No metadata for "PatientEntity"`

**Solution**:
1. Ensure `reflect-metadata` is imported at entry point
2. Check `entities: ['src/infrastructure/persistence/entities/**/*.ts']` in DataSource config
3. Verify entity has `@Entity()` decorator

### Circular Dependency

**Problem**: `ReferenceError: Cannot access 'X' before initialization`

**Solution**:
1. Likely violating hexagonal architecture (infrastructure importing from domain that imports infrastructure)
2. Check dependency direction: domain → infrastructure is FORBIDDEN
3. Use dependency injection, not direct imports

### Migration Fails

**Problem**: `QueryFailedError: column "x" does not exist`

**Solution**:
1. Check migration was actually run: `npm run migration:show`
2. Verify TypeORM entity matches migration SQL
3. If stuck: `npm run schema:drop && npm run migration:run`

### File Upload 413 Payload Too Large

**Problem**: Large PDF upload fails

**Solution**:
1. Check `MAX_FILE_SIZE_MB` in `.env`
2. Ensure Multer limits match: `limits: { fileSize: MAX_SIZE }`
3. If behind proxy: adjust nginx `client_max_body_size`

### Mock Analysis Returns Empty Results

**Problem**: `extractedData: {}`

**Solution**:
1. MockAnalysisEngine uses pattern matching on text
2. Check file text extraction works: log `extractText(fileBuffer)`
3. Add more patterns to mock logic or use real LLM

---

## Quick Reference

### Generate New Migration
```bash
npm run migration:generate -- -n CreateReportsTable
```

### Check Migration Status
```bash
npm run migration:show
```

### Revert Last Migration
```bash
npm run migration:revert
```

### Validate TypeScript
```bash
npm run typecheck
```

### Lint & Format
```bash
npm run lint:fix
npm run format
```

### Start with Logs
```bash
npm run dev | npx pino-pretty
```

---

## Constitution Compliance Checklist

When implementing features, ensure:

- [ ] Hexagonal architecture maintained (domain has no external deps)
- [ ] External dependencies use port interfaces
- [ ] Mock adapter implemented first
- [ ] No tests written (deferred per constitution)
- [ ] Healthcare data integrity rules enforced (audit trails, soft deletes)
- [ ] TypeScript strict mode compliance
- [ ] Migrations used (not TypeORM auto-sync)
- [ ] Environment config externalized
- [ ] API follows REST conventions
- [ ] OpenAPI spec updated

---

**Last Constitution Review**: 2026-01-28  
**Constitution Version**: 1.0.1
