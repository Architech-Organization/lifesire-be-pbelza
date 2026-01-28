# Data Model: Patient Reports Backend API

**Feature**: 001-patient-reports-api  
**Date**: 2026-01-28  
**Phase**: 1 - Design

## Overview

This document defines the data model for the patient reports system, including domain entities, relationships, database schema, and validation rules. Design follows hexagonal architecture principles with domain entities separate from persistence entities.

## Domain Entities

### Patient

**Purpose**: Represents an individual receiving medical care in the system.

**Attributes**:
- `id`: string (UUID) - Unique identifier, generated on creation
- `medicalRecordNumber`: string - External medical record identifier (unique)
- `name`: string - Patient full name
- `dateOfBirth`: Date - Patient date of birth
- `contactInfo`: object (optional) - Contact details
  - `email`: string (optional)
  - `phone`: string (optional)
- `createdAt`: Date - Timestamp of creation
- `updatedAt`: Date - Timestamp of last update
- `deletedAt`: Date | null - Timestamp of soft delete

**Relationships**:
- Has many Reports (one-to-many)

**Business Rules**:
- Medical record number must be unique across all patients
- Name is required, minimum 2 characters
- Date of birth must be in the past
- Contact info is optional but if provided, email must be valid format
- Soft delete: When patient is deleted, all associated reports remain accessible but flagged

**Validation**:
```typescript
- medicalRecordNumber: required, unique, alphanumeric, 3-50 chars
- name: required, 2-200 chars
- dateOfBirth: required, valid date, must be < today
- email: optional, valid email format
- phone: optional, valid phone format (flexible international)
```

---

### Report

**Purpose**: Represents a medical document uploaded for a patient.

**Attributes**:
- `id`: string (UUID) - Unique identifier
- `patientId`: string (UUID, foreign key) - Reference to Patient

- `reportDate`: Date - Date the medical report was created/issued
- `description`: string (optional) - Clinician-provided description
- `fileName`: string - Original uploaded filename
- `fileReference`: string - Storage reference/path to file
- `fileHash`: string - SHA-256 hash for duplicate detection
- `fileFormat`: string - File MIME type
- `fileSize`: number - File size in bytes
- `uploadTimestamp`: Date - When file was uploaded
- `createdAt`: Date - Entity creation timestamp
- `updatedAt`: Date - Entity update timestamp
- `deletedAt`: Date | null - Soft delete timestamp

**Relationships**:
- Belongs to one Patient (many-to-one)
- Has one Analysis (one-to-one, optional)
- Has many ClinicalNotes (one-to-many)

**Business Rules**:
- Report must be linked to existing patient
- File hash is calculated on upload for duplicate detection
- Duplicate detection: Same file hash + same patient = duplicate (rejected)
- Report type starts as "other", updated by analysis engine
- File format must be in allowed list: PDF, DOCX, JPEG, PNG
- Maximum file size: 50MB (configurable)
- Report date cannot be in the future
- Soft delete: Report remains in storage, marked as deleted in database

**Validation**:
```typescript
- patientId: required, must reference existing patient
- reportDate: required, valid date, must be <= today
- description: optional, max 1000 chars
- fileName: required, 1-255 chars
- fileFormat: required, must be in ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']
- fileSize: required, must be > 0 and <= 52428800 (50MB)
- fileHash: required, SHA-256 hex string (64 chars)
```

---

### Analysis

**Purpose**: Represents automated analysis results for a medical report.

**Attributes**:
- `id`: string (UUID) - Unique identifier
- `reportId`: string (UUID, foreign key) - Reference to Report
- `reportType`: string - Determined report classification
  - Values: "lab", "imaging", "pathology", "consultation", "other"
- `extractedData`: object (JSON) - Structured medical findings
  - `labValues`: array of { name, value, unit, referenceRange, flag }
  - `diagnoses`: array of { code, description, confidence }
  - `medications`: array of { name, dosage, frequency }
  - `findings`: array of { category, description, severity }
- `trendIndicators`: object (JSON) - Patterns across multiple reports
  - `improving`: array of value names
  - `declining`: array of value names
  - `stable`: array of value names
  - `recurring`: array of condition names
- `confidenceScore`: number - Overall confidence (0.0-1.0)
- `summaryText`: string - Human-readable analysis summary
- `analysisMethod`: string - Method used for analysis
  - Values: "mock", "openai-gpt4", "anthropic-claude", "local-llm"
- `completionStatus`: string - Status of analysis
  - Values: "complete", "partial", "failed"
- `errorDetails`: string (optional) - Error information if failed/partial
- `analysisTimestamp`: Date - When analysis was performed
- `createdAt`: Date - Entity creation timestamp
- `updatedAt`: Date - Entity update timestamp

**Relationships**:
- Belongs to one Report (one-to-one)

**Business Rules**:
- Analysis is created when report is analyzed
- Completion status determines whether results are reliable
- Partial results stored even on failure (per spec clarification)
- Confidence score calculated by analysis engine
- Trend indicators require multiple reports for same patient
- Mock analysis produces confidence 0.7-0.9
- LLM analysis confidence depends on model response
- Error details captured for debugging and audit

**Validation**:
```typescript
- reportId: required, must reference existing report
- reportType: required, enum values
- extractedData: required, valid JSON object
- confidenceScore: required, number between 0.0 and 1.0
- summaryText: required, 10-5000 chars
- analysisMethod: required, enum values
- completionStatus: required, enum values
- errorDetails: optional, max 2000 chars
```

---

### ClinicalNote

**Purpose**: Represents clinician-added annotation/commentary on a report.

**Attributes**:
- `id`: string (UUID) - Unique identifier
- `reportId`: string (UUID, foreign key) - Reference to Report
- `content`: string - Note text content
- `authorIdentifier`: string - Clinician who created note (mocked for MVP)
- `createdAt`: Date - When note was created
- `deletedAt`: Date | null - Soft delete timestamp (audit trail)

**Relationships**:
- Belongs to one Report (many-to-one)

**Business Rules**:
- Multiple notes can exist per report (append-only list)
- Notes are immutable after creation (no updates, per spec clarification)
- Notes displayed newest first when retrieved
- Soft delete preserves note content for audit trail
- Author identifier mocked in MVP (e.g., "clinician-1", "Dr. Smith")
- Future: Real authentication will populate actual clinician identity

**Validation**:
```typescript
- reportId: required, must reference existing report
- content: required, 1-10000 chars
- authorIdentifier: required, 1-100 chars
```

---

## Entity Relationships Diagram

```
┌─────────────────┐
│    Patient      │
│  (id, mrn,      │
│   name, dob)    │
└────────┬────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────┐
│     Report      │◄──────────┐
│  (id, patientId,│           │
│   file info,    │           │
│   hash, date)   │           │
└────────┬────────┘           │
         │                    │
         │ 1:1                │ N:1
         │                    │
         ▼                    │
┌─────────────────┐           │
│    Analysis     │           │
│  (id, reportId, │           │
│   results,      │           │
│   confidence)   │           │
└─────────────────┘           │
                              │
                    ┌─────────┴──────────┐
                    │   ClinicalNote     │
                    │  (id, reportId,    │
                    │   content, author) │
                    └────────────────────┘
```

## Database Schema (PostgreSQL)

### patients Table

```sql
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medical_record_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    date_of_birth DATE NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    CONSTRAINT chk_mrn CHECK (LENGTH(medical_record_number) >= 3),
    CONSTRAINT chk_name CHECK (LENGTH(name) >= 2),
    CONSTRAINT chk_dob CHECK (date_of_birth < CURRENT_DATE)
);

CREATE INDEX idx_patients_mrn ON patients(medical_record_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_patients_deleted ON patients(deleted_at) WHERE deleted_at IS NOT NULL;
```

### reports Table

```sql
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    report_date DATE NOT NULL,
    description TEXT,
    file_name VARCHAR(255) NOT NULL,
    file_reference VARCHAR(500) NOT NULL,
    file_hash CHAR(64) NOT NULL,
    file_format VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    upload_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    CONSTRAINT chk_report_date CHECK (report_date <= CURRENT_DATE),
    CONSTRAINT chk_file_size CHECK (file_size > 0 AND file_size <= 52428800),
    CONSTRAINT chk_file_hash CHECK (LENGTH(file_hash) = 64)
);

-- Composite unique index for duplicate detection (same file for same patient)
CREATE UNIQUE INDEX idx_reports_patient_hash ON reports(patient_id, file_hash) WHERE deleted_at IS NULL;

-- Performance indexes
CREATE INDEX idx_reports_patient ON reports(patient_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_reports_date ON reports(report_date DESC);
CREATE INDEX idx_reports_deleted ON reports(deleted_at) WHERE deleted_at IS NOT NULL;
```

### analyses Table

```sql
CREATE TABLE analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID UNIQUE NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    extracted_data JSONB NOT NULL,
    trend_indicators JSONB NOT NULL DEFAULT '{}',
    confidence_score NUMERIC(3,2) NOT NULL,
    summary_text TEXT NOT NULL,
    analysis_method VARCHAR(50) NOT NULL,
    completion_status VARCHAR(20) NOT NULL,
    error_details TEXT,
    analysis_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_confidence CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    CONSTRAINT chk_completion CHECK (completion_status IN ('complete', 'partial', 'failed')),
    CONSTRAINT chk_method CHECK (analysis_method IN ('mock', 'openai-gpt4', 'anthropic-claude', 'local-llm'))
);

CREATE INDEX idx_analyses_report ON analyses(report_id);
CREATE INDEX idx_analyses_status ON analyses(completion_status);
CREATE INDEX idx_analyses_method ON analyses(analysis_method);

-- GIN index for JSONB queries on extracted data
CREATE INDEX idx_analyses_data ON analyses USING GIN (extracted_data);
```

### clinical_notes Table

```sql
CREATE TABLE clinical_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_identifier VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    CONSTRAINT chk_content CHECK (LENGTH(content) >= 1 AND LENGTH(content) <= 10000)
);

CREATE INDEX idx_notes_report ON clinical_notes(report_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_notes_deleted ON clinical_notes(deleted_at) WHERE deleted_at IS NOT NULL;
```

## TypeORM Migration Strategy

**Migration Files** (created in `src/infrastructure/database/migrations/`):
1. `001_CreatePatients.ts` - Create patients table
2. `002_CreateReports.ts` - Create reports table with foreign keys
3. `003_CreateAnalyses.ts` - Create analyses table with foreign keys
4. `004_CreateClinicalNotes.ts` - Create clinical_notes table

**Migration Commands**:
```bash
npm run migration:generate -- -n MigrationName
npm run migration:run
npm run migration:revert
```

## Data Integrity Constraints

### Referential Integrity
- Reports must reference valid patient (FK constraint with CASCADE delete)
- Analyses must reference valid report (FK constraint with CASCADE delete)
- Notes must reference valid report (FK constraint with CASCADE delete)
- Orphan prevention: Database enforces via foreign key constraints

### Data Quality Constraints
- All string fields: No leading/trailing whitespace (trimmed on input)
- Dates: Validated to be parseable and within reasonable ranges
- File hashes: Always lowercase hex string, exactly 64 characters
- Enums: Strict validation against allowed values

### Concurrency Handling
- Optimistic locking via `updated_at` timestamp comparison
- Database transactions for multi-entity operations
- Unique constraints prevent duplicate inserts
- Row-level locking for critical updates (if needed)

## Mock Data Strategy

For rapid development, in-memory repositories will store data in TypeScript Maps:

```typescript
// InMemoryPatientRepository
private patients: Map<string, Patient> = new Map();

// InMemoryReportRepository  
private reports: Map<string, Report> = new Map();
private reportsByPatient: Map<string, Set<string>> = new Map();
```

Mock data characteristics:
- UUIDs generated via `crypto.randomUUID()`
- Timestamps use `new Date()`
- File hashes use actual SHA-256 from file content
- Validation rules enforced in domain entities (same for mock and production)

## Data Access Patterns

### Common Queries

1. **List all patients** (with pagination deferred)
   ```sql
   SELECT * FROM patients WHERE deleted_at IS NULL ORDER BY name;
   ```

2. **Get patient with all reports**
   ```sql
   SELECT p.*, r.* FROM patients p
   LEFT JOIN reports r ON r.patient_id = p.id AND r.deleted_at IS NULL
   WHERE p.id = $1 AND p.deleted_at IS NULL;
   ```

3. **Get report with analysis and notes**
   ```sql
   SELECT r.*, a.*, n.* FROM reports r
   LEFT JOIN analyses a ON a.report_id = r.id
   LEFT JOIN clinical_notes n ON n.report_id = r.id AND n.deleted_at IS NULL
   WHERE r.id = $1 AND r.deleted_at IS NULL;
   ```

4. **Detect duplicate report**
   ```sql
   SELECT id FROM reports 
   WHERE patient_id = $1 AND file_hash = $2 AND deleted_at IS NULL;
   ```

5. **Get patient summary timeline**
   ```sql
   SELECT 
     r.id, r.report_date, r.report_type, r.file_name,
     a.summary_text, a.confidence_score,
     COUNT(n.id) as note_count
   FROM reports r
   LEFT JOIN analyses a ON a.report_id = r.id
   LEFT JOIN clinical_notes n ON n.report_id = r.id AND n.deleted_at IS NULL
   WHERE r.patient_id = $1 AND r.deleted_at IS NULL
   GROUP BY r.id, a.id
   ORDER BY r.report_date DESC;
   ```

## Future Enhancements

**Post-MVP Considerations**:
- Full audit log table for detailed operation history
- Versioning for analysis results (store multiple analysis runs)
- Report tagging/categorization beyond type enum
- Patient grouping (cohorts, studies)
- Advanced search with full-text indexing (PostgreSQL FTS)
- Report sharing/permissions (multi-clinician access)
- Data retention policies and archival strategy

## Validation Summary

| Entity | Required Fields | Unique Constraints | Soft Delete |
|--------|----------------|-------------------|-------------|
| Patient | id, mrn, name, dob | mrn | Yes |
| Report | id, patientId, reportDate, file* | (patientId, fileHash) | Yes |
| Analysis | id, reportId, results, confidence | reportId | No |
| ClinicalNote | id, reportId, content, author | None | Yes |

**Total Tables**: 4  
**Total Indexes**: 15 (including unique constraints)  
**Total Foreign Keys**: 3  
**Total Check Constraints**: 13
