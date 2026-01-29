# API Examples

Example API requests for the Lifespire Patient Reports API.

Base URL: `http://localhost:3000`

## Health Check

```bash
curl http://localhost:3000/health
```

## Patient Management (US1)

### Create Patient

```bash
curl -X POST http://localhost:3000/api/v1/patients \
  -H "Content-Type: application/json" \
  -d '{
    "medicalRecordNumber": "MRN-001",
    "name": "John Doe",
    "dateOfBirth": "1980-05-15",
    "contactInfo": {
      "email": "john.doe@example.com",
      "phone": "+1-555-0100"
    }
  }'
```

### List All Patients

```bash
curl http://localhost:3000/api/v1/patients
```

### Search Patients by Name

```bash
curl "http://localhost:3000/api/v1/patients/search?name=John"
```

### Get Patient by ID

```bash
curl http://localhost:3000/api/v1/patients/{patientId}
```

### Update Patient

```bash
curl -X PUT http://localhost:3000/api/v1/patients/{patientId} \
  -H "Content-Type: application/json" \
  -d '{
    "medicalRecordNumber": "MRN-001",
    "name": "John Doe Updated",
    "dateOfBirth": "1980-05-15",
    "contactInfo": {
      "email": "john.updated@example.com",
      "phone": "+1-555-0100"
    }
  }'
```

### Delete Patient (Soft Delete)

```bash
curl -X DELETE http://localhost:3000/api/v1/patients/{patientId}
```

## Report Upload & Storage (US2)

### Upload Report

```bash
curl -X POST http://localhost:3000/api/v1/patients/{patientId}/reports \
  -F "reportDate=2026-01-15" \
  -F "description=Lab Results" \
  -F "file=@/path/to/report.pdf"
```

### List Patient Reports

```bash
curl http://localhost:3000/api/v1/patients/{patientId}/reports
```

### Get Report Details

```bash
curl http://localhost:3000/api/v1/reports/{reportId}
```

### Download Report File

```bash
curl http://localhost:3000/api/v1/reports/{reportId}/file --output report.pdf
```

## Report Analysis & Summary (US3)

### Analyze Report

```bash
curl -X POST http://localhost:3000/api/v1/reports/{reportId}/analyze
```

### Get Analysis Results

```bash
curl http://localhost:3000/api/v1/reports/{reportId}/analysis
```

## Clinical Notes (US4)

### Add Clinical Note

```bash
curl -X POST http://localhost:3000/api/v1/reports/{reportId}/notes \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Patient shows significant improvement. Continue current treatment plan.",
    "authorIdentifier": "Dr. Smith"
  }'
```

### List Report Notes

```bash
curl http://localhost:3000/api/v1/reports/{reportId}/notes
```

### Delete Note (Soft Delete)

```bash
curl -X DELETE http://localhost:3000/api/v1/notes/{noteId}
```

## Patient Summary (US5)

### Get Comprehensive Patient Summary

```bash
curl http://localhost:3000/api/v1/patients/{patientId}/summary
```

### Get Summary with Date Filters

```bash
curl "http://localhost:3000/api/v1/patients/{patientId}/summary?startDate=2026-01-01&endDate=2026-01-31"
```

## API Documentation

Interactive Swagger UI documentation:

```bash
# Open in browser
open http://localhost:3000/api-docs
```

## Complete Workflow Example

```bash
#!/bin/bash

# 1. Create patient
PATIENT_ID=$(curl -s -X POST http://localhost:3000/api/v1/patients \
  -H "Content-Type: application/json" \
  -d '{
    "medicalRecordNumber": "MRN-DEMO-001",
    "name": "Alice Johnson",
    "dateOfBirth": "1985-07-22",
    "contactInfo": {
      "email": "alice.j@example.com"
    }
  }' | jq -r '.data.id')

echo "Created patient: $PATIENT_ID"

# 2. Upload report
REPORT_ID=$(curl -s -X POST "http://localhost:3000/api/v1/patients/$PATIENT_ID/reports" \
  -F "reportDate=2026-01-20" \
  -F "description=Annual Physical Exam" \
  -F "file=@report.pdf" | jq -r '.data.id')

echo "Uploaded report: $REPORT_ID"

# 3. Analyze report
curl -s -X POST "http://localhost:3000/api/v1/reports/$REPORT_ID/analyze" | jq '.'

# 4. Add clinical note
curl -s -X POST "http://localhost:3000/api/v1/reports/$REPORT_ID/notes" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "All vitals normal. Schedule follow-up in 6 months.",
    "authorIdentifier": "Dr. Williams"
  }' | jq '.'

# 5. Get comprehensive summary
curl -s "http://localhost:3000/api/v1/patients/$PATIENT_ID/summary" | jq '.'
```

## Error Handling

All error responses follow this format:

```json
{
  "error": {
    "message": "Error description",
    "statusCode": 400
  }
}
```

Common status codes:
- 200: Success
- 201: Created
- 204: No Content (successful delete)
- 400: Bad Request (validation error)
- 404: Not Found
- 429: Too Many Requests (rate limit exceeded)
- 500: Internal Server Error
