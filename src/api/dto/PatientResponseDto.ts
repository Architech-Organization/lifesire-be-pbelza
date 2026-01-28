import { Patient } from '@domain/entities/Patient';

/**
 * PatientResponseDto: Response DTO for patient data
 * 
 * Formats patient entity for HTTP responses.
 */
export class PatientResponseDto {
  id: string;
  medicalRecordNumber: string;
  name: string;
  dateOfBirth: string; // ISO 8601 date string
  contactInfo?: {
    email?: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;

  constructor(patient: Patient) {
    this.id = patient.id;
    this.medicalRecordNumber = patient.medicalRecordNumber;
    this.name = patient.name;
    this.dateOfBirth = patient.dateOfBirth?.toISOString().split('T')[0] || ''; // YYYY-MM-DD
    this.contactInfo = patient.contactInfo;
    this.createdAt = patient.createdAt.toISOString();
    this.updatedAt = patient.updatedAt.toISOString();
  }

  /**
   * Create array of response DTOs
   */
  static fromArray(patients: Patient[]): PatientResponseDto[] {
    return patients.map(patient => new PatientResponseDto(patient));
  }
}
