# Feature Specification: Patient Reports Backend API

**Feature Branch**: `001-patient-reports-api`  
**Created**: 2026-01-28  
**Status**: Draft  
**Input**: User description: "Build backend API for patient reports management: listing patients, uploading medical reports per patient, analyzing reports (mocked initially, LLM later), viewing reports per patient, adding clinical notes, storing patient information, and generating report summaries with trend analysis"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Patient Management (Priority: P1)

Clinicians need to create and retrieve patient records to organize medical reports by individual patient. This is the foundational capability - without patients, there are no reports to manage.

**Why this priority**: Core entity management. All other features depend on having patients in the system. Delivers immediate value by establishing the patient registry.

**Independent Test**: Can be fully tested by creating patients via API, listing them, and retrieving individual patient details. Delivers a working patient directory.

**Acceptance Scenarios**:

1. **Given** no patients exist, **When** clinician creates a patient with basic demographics (name, date of birth, medical record number), **Then** system assigns unique patient ID and stores patient information
2. **Given** multiple patients exist in system, **When** clinician requests patient list, **Then** system returns all patients with basic information
3. **Given** a patient exists, **When** clinician requests specific patient by ID, **Then** system returns complete patient details including demographics and metadata

---

### User Story 2 - Report Upload & Storage (Priority: P1)

Clinicians need to upload medical reports (lab results, imaging reports, pathology reports) for each patient to build their medical history. Reports are the core data asset for analysis.

**Why this priority**: Primary data ingestion. Without reports, there's nothing to analyze. This is equally critical as patient management for MVP.

**Independent Test**: Can be fully tested by uploading various report files (PDF, DOCX, images) to a patient and retrieving the list of uploaded reports. Delivers working document management per patient.

**Acceptance Scenarios**:

1. **Given** a patient exists, **When** clinician uploads a medical report file with metadata (date, optional description), **Then** system stores file, assigns report ID, links to patient, and queues for analysis to determine report type
2. **Given** a patient has multiple reports, **When** clinician requests patient's reports, **Then** system returns list of all reports with metadata (type, date, file info)
3. **Given** a report exists, **When** clinician requests specific report, **Then** system returns report file and all associated metadata
4. **Given** a patient exists, **When** clinician uploads multiple reports over time, **Then** system maintains chronological order and allows querying by date range

---

### User Story 3 - Report Analysis & Summary (Priority: P2)

Clinicians need automated analysis of medical reports to identify trends, patterns, and anomalies in patient results over time. This reduces manual review time and highlights important changes.

**Why this priority**: Core differentiator for the application, but can be mocked initially to prove the workflow. Real LLM integration can come later.

**Independent Test**: Can be fully tested by triggering analysis on patient reports and receiving structured analysis results (mocked or LLM-generated). Delivers working analysis pipeline.

**Acceptance Scenarios**:

1. **Given** a patient has one or more reports, **When** clinician requests analysis for a specific report, **Then** system extracts key medical findings and structured data (lab values, diagnoses, medications)
2. **Given** a patient has multiple reports over time, **When** clinician requests trend analysis, **Then** system identifies patterns (improving/declining values, recurring conditions, medication changes)
3. **Given** analysis completes, **When** clinician views results, **Then** system presents summary with key findings, trends, and anomalies highlighted
4. **Given** analysis encounters ambiguous data, **When** processing completes, **Then** system flags uncertain findings for manual review

---

### User Story 4 - Clinical Notes (Priority: P3)

Clinicians need to add contextual notes to individual reports to document their interpretations, observations, or follow-up actions. Multiple notes can be added over time to track evolving understanding. These notes supplement the automated analysis.

**Why this priority**: Valuable for clinician workflow but not critical for initial MVP. The system works without notes; they enhance usability.

**Independent Test**: Can be fully tested by adding multiple clinical notes to reports and viewing them chronologically. Delivers annotation capability.

**Acceptance Scenarios**:

1. **Given** a report exists, **When** clinician adds a clinical note with text content, **Then** system stores note linked to report with timestamp and clinician identifier
2. **Given** a report has multiple notes, **When** clinician views report, **Then** system displays all notes with newest on top, showing author and timestamp for each
3. **Given** a report has notes, **When** clinician adds another note, **Then** system appends to note list and displays newest first
4. **Given** a clinical note exists, **When** clinician deletes note, **Then** system marks note as deleted but preserves audit trail

---

### User Story 5 - Comprehensive Patient Summary (Priority: P3)

Clinicians need a consolidated view of all patient data including demographics, report history, analysis summaries, and clinical notes to get complete patient picture quickly.

**Why this priority**: Enhances user experience by aggregating data, but each component works independently. This is a convenience feature for later optimization.

**Independent Test**: Can be fully tested by requesting patient summary and receiving aggregated data. Delivers comprehensive reporting capability.

**Acceptance Scenarios**:

1. **Given** a patient has reports, analyses, and notes, **When** clinician requests patient summary, **Then** system returns consolidated view with timeline of all activities
2. **Given** a patient summary is requested, **When** generating summary, **Then** system includes latest analysis trends and highlights critical findings
3. **Given** a patient has extensive history, **When** clinician filters summary by date range or report type, **Then** system returns filtered view

---

### Edge Cases

- What happens when uploaded report file is corrupted or unreadable?
- **How does system handle duplicate report uploads (same file, same patient)?** → System detects duplicate via file hash match, rejects upload, and returns reference to existing report with clear message.
- **What happens when analysis fails or times out?** → System returns partial results if any extraction succeeded, flags analysis as incomplete/failed with error details. Clinician can view partial data and understand what failed.
- How does system handle patients with no reports (empty medical history)?
- What happens when attempting to add notes to non-existent reports?
- How does system handle very large report files (e.g., high-resolution medical imaging)?
- **What happens when patient has hundreds of reports (pagination, performance)?** → Patient listing returns all for demo scale. Report listing per patient may need pagination in future if performance degrades.
- How does system handle concurrent report uploads for same patient?
- **What happens when analysis service is unavailable (mock or LLM)?** → Treated as analysis failure: return partial results if any, flag as incomplete, store error state for debugging.

## Requirements *(mandatory)*

### Functional Requirements

**Patient Management:**
- **FR-001**: System MUST allow creating patients with basic demographics (name, date of birth, medical record number, optional contact info)
- **FR-002**: System MUST assign unique patient identifier (ID) upon creation
- **FR-003**: System MUST support listing all patients (pagination deferred - return all for demo scale ~100 patients)
- **FR-004**: System MUST allow retrieving individual patient details by ID
- **FR-005**: System MUST support searching patients by name or medical record number

**Report Management:**
- **FR-006**: System MUST allow uploading medical report files for specific patients
- **FR-007**: System MUST support multiple file formats (PDF, DOCX, image formats: JPEG, PNG)
- **FR-008**: System MUST store report metadata (date, optional description, file size, upload timestamp) and auto-populate report type via analysis
- **FR-009**: System MUST assign unique report identifier (ID) upon upload
- **FR-010**: System MUST link each report to exactly one patient
- **FR-011**: System MUST detect duplicate uploads (same file hash for same patient) and reject with reference to existing report
- **FR-012**: System MUST allow listing all reports for a specific patient
- **FR-013**: System MUST allow retrieving individual report file and metadata by ID
- **FR-014**: System MUST support chronological ordering of reports by report date

**Report Analysis:**
- **FR-015**: System MUST provide analysis capability for individual medical reports
- **FR-016**: System MUST extract structured medical data from reports (lab values, diagnoses, medications, findings)
- **FR-017**: System MUST support mocked analysis responses initially (no LLM dependency)
- **FR-018**: System MUST detect trends across multiple reports for same patient (improving/declining values, patterns)
- **FR-019**: System MUST generate human-readable summary of analysis findings
- **FR-020**: System MUST flag low-confidence or ambiguous analysis results
- **FR-021**: Analysis implementation MUST be replaceable (mock → LLM) without changing API contract
- **FR-022**: System MUST handle analysis failures gracefully by returning partial results if any extraction succeeded, flagging analysis as incomplete/failed with error details

**Clinical Notes:**
- **FR-023**: System MUST allow adding clinical notes to individual reports
- **FR-024**: System MUST store note content with timestamp and author identifier
- **FR-025**: System MUST support retrieving all notes for a specific report ordered by creation time (newest first)
- **FR-026**: System MUST allow deleting clinical notes with audit trail preservation (soft delete)

**Patient Summary:**
- **FR-027**: System MUST generate comprehensive patient summary including demographics, reports, analyses, and notes
- **FR-028**: System MUST present patient data in chronological timeline format
- **FR-029**: System MUST support filtering patient summary by date range and report type
- **FR-030**: System MUST highlight critical findings in patient summary

**Data Integrity & Audit:**
- **FR-031**: System MUST maintain audit trails for all data modifications (creates, deletes)
- **FR-032**: System MUST prevent orphaned data (reports without patients, notes without reports)
- **FR-033**: System MUST validate all input data (file types, required fields, data formats)
- **FR-034**: System MUST handle concurrent operations safely (multiple uploads, simultaneous note additions)

### Key Entities

- **Patient**: Represents an individual receiving medical care. Attributes include unique ID, name, date of birth, medical record number, contact information, creation timestamp. Contains multiple Reports.

- **Report**: Represents a medical document for a patient. Attributes include unique ID, patient ID (foreign reference), report type (auto-populated by analysis: lab, imaging, pathology, consultation, other), report date, optional description, file reference, file hash (for duplicate detection), file format, file size, upload timestamp. Contains multiple ClinicalNotes and may have associated Analysis.

- **Analysis**: Represents automated analysis results for a report. Attributes include unique ID, report ID (foreign reference), determined report type (classification output), extracted structured data (JSON of findings, values, diagnoses, medications), trend indicators, confidence score, summary text, analysis timestamp, analysis method (mock/LLM provider), completion status (complete/partial/failed), error details if applicable. One-to-one with Report.

- **ClinicalNote**: Represents clinician-added annotation on a report. Multiple notes can exist per report forming a chronological list. Attributes include unique ID, report ID (foreign reference), note content, author identifier, creation timestamp, deletion flag (soft delete). Notes are immutable after creation (append-only).

- **Timeline Event**: Aggregate view entity representing chronological patient history. Combines reports, analyses, and notes into unified timeline for patient summary views. Not persisted separately but generated from other entities.

## Clarifications

### Session 2026-01-28

- Q: When analysis fails (mock or future LLM timeout/error), how should the system respond to the clinician? → A: Return partial results if any extraction succeeded, flag analysis as incomplete/failed with error details
- Q: For patient pagination (FR-003), what page size should the API use by default? → A: Show all (no pagination initially for demo scale)
- Q: What specific report types should the system recognize and support in the "report type" field (FR-008)? → A: Type auto-populated by analysis (LLM/mock), not user input
- Q: When a clinician updates a clinical note (FR-025), how should the edit history be maintained? → A: Multiple notes per report, newest on top
- Q: For duplicate report uploads (same file, same patient), what should the system do? → A: Detect duplicate (file hash) and reject, return reference to existing report

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Clinicians can create a patient and upload their first medical report in under 2 minutes
- **SC-002**: System successfully processes and stores 100% of valid file uploads without data loss
- **SC-003**: Analysis results (mock or LLM) return within 30 seconds for typical reports (under 10 pages)
- **SC-004**: Patient summary generation completes within 5 seconds for patients with up to 50 reports
- **SC-005**: System handles at least 10 concurrent report uploads without errors or conflicts
- **SC-006**: API responses for listing and retrieval operations complete in under 1 second for datasets up to 100 patients
- **SC-007**: Zero data integrity violations (no orphaned records, no lost files) during normal operations
- **SC-008**: Mock analysis can be replaced with LLM implementation without changing client-facing API contracts
- **SC-009**: Clinical notes are immediately visible after creation with correct timestamps and attribution
- **SC-010**: Patient search returns relevant results within 2 seconds for database of 100 patients

## Assumptions

- Demo/development environment using synthetic or anonymized data (not production PHI)
- Single-tenant deployment initially (no multi-tenancy requirements)
- File storage will use local filesystem or mock adapter initially (S3/blob storage later)
- Database will use in-memory or local file-based implementation initially (PostgreSQL later)
- Analysis mock will use simple pattern matching or fixture data (LLM integration planned but not MVP blocker)
- Authentication/authorization handled externally or mocked (clinician identity provided in requests)
- No concurrent editing conflicts expected in demo phase (basic concurrency handling sufficient)
- Report files are reasonably sized (under 50MB typically) for demo purposes
- English language content only for initial version
- Standard medical report formats (lab results, imaging reports, pathology reports)

## Out of Scope

- **Frontend UI**: This is backend API only; no web interface included
- **EHR Integration**: No connections to existing Electronic Health Record systems
- **Real-time Data**: No integration with medical devices, wearables, or live data streams
- **Clinical Decision Support**: No diagnostic recommendations or treatment suggestions
- **Multi-LLM Consensus**: Simplified single-analysis approach; consensus engine deferred to later phase
- **Production PHI Handling**: No HIPAA compliance, encryption, or production security measures in initial version
- **Claims Processing**: No insurance, billing, or reimbursement features
- **User Management**: No clinician accounts, permissions, or role-based access control in MVP
- **Advanced Search**: Basic search only; no full-text search across report contents initially
- **Document OCR**: No optical character recognition for scanned images in initial version (may be part of LLM analysis later)
- **Report Versioning**: No support for updating/replacing existing reports (only add new ones)
- **Bulk Operations**: No bulk upload or batch processing in initial version
- **Export Functionality**: No PDF generation, report export, or data download features initially

## Dependencies

- **Constitution Alignment**: Feature follows hexagonal architecture (all external resources via ports/adapters)
- **Mock Adapters**: File storage, database, and analysis engine will start as mock implementations
- **LLM Integration**: Analysis port defined to support future LLM implementation without breaking changes

## Notes for Implementation

Per project constitution:
- All external dependencies (file storage, database, LLM) MUST be accessed via port interfaces
- Mock adapters MUST be implemented first for rapid iteration
- No tests required initially (deferred testing phase)
- Focus on demonstrable API functionality over optimization
- Analysis logic MUST be swappable (mock → LLM) without affecting core domain
