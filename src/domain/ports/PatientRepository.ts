import { Patient } from '@domain/entities/Patient';

/**
 * PatientRepositoryPort: Interface for patient persistence operations
 * 
 * Defines contract for storing and retrieving patients.
 * Implementations: InMemoryPatientRepository (mock), TypeORMPatientRepository (production)
 */
export interface PatientRepositoryPort {
  /**
   * Create new patient
   */
  create(patient: Patient): Promise<Patient>;

  /**
   * Find patient by unique ID
   */
  findById(id: string): Promise<Patient | null>;

  /**
   * Find patient by medical record number (unique identifier)
   */
  findByMRN(medicalRecordNumber: string): Promise<Patient | null>;

  /**
   * Search patients by name (partial match, case-insensitive)
   */
  search(nameQuery: string): Promise<Patient[]>;

  /**
   * List all patients (excludes soft-deleted)
   */
  findAll(): Promise<Patient[]>;

  /**
   * Update existing patient
   */
  update(patient: Patient): Promise<Patient>;

  /**
   * Soft delete patient
   */
  softDelete(id: string): Promise<void>;
}
