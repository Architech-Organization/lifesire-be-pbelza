import { Patient } from '@domain/entities/Patient';
import { PatientRepositoryPort } from '@domain/ports/PatientRepository';
import { randomUUID } from 'crypto';

/**
 * PatientService: Domain service for patient business logic
 * 
 * Orchestrates patient operations following hexagonal architecture.
 * No framework dependencies - pure business logic.
 */
export class PatientService {
  constructor(private readonly patientRepository: PatientRepositoryPort) {}

  /**
   * Create new patient
   */
  async create(
    medicalRecordNumber: string,
    name: string,
    dateOfBirth: Date,
    contactInfo?: { email?: string; phone?: string }
  ): Promise<Patient> {
    // Check for duplicate MRN
    const existing = await this.patientRepository.findByMRN(medicalRecordNumber);
    if (existing) {
      throw new Error('Patient with this medical record number already exists');
    }

    // Create patient entity
    const patient = new Patient(
      randomUUID(),
      medicalRecordNumber,
      name,
      dateOfBirth,
      contactInfo
    );

    // Validate business rules
    const errors = patient.validate();
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Persist
    return await this.patientRepository.create(patient);
  }

  /**
   * Find patient by ID
   */
  async findById(id: string): Promise<Patient | null> {
    return await this.patientRepository.findById(id);
  }

  /**
   * Find patient by medical record number
   */
  async findByMRN(medicalRecordNumber: string): Promise<Patient | null> {
    return await this.patientRepository.findByMRN(medicalRecordNumber);
  }

  /**
   * Search patients by name
   */
  async search(nameQuery: string): Promise<Patient[]> {
    if (!nameQuery || nameQuery.trim().length < 2) {
      throw new Error('Search query must be at least 2 characters');
    }
    return await this.patientRepository.search(nameQuery.trim());
  }

  /**
   * List all patients
   */
  async listAll(): Promise<Patient[]> {
    return await this.patientRepository.findAll();
  }

  /**
   * Update patient
   */
  async update(
    id: string,
    name: string,
    dateOfBirth: Date,
    contactInfo?: { email?: string; phone?: string }
  ): Promise<Patient> {
    const patient = await this.patientRepository.findById(id);
    if (!patient) {
      throw new Error('Patient not found');
    }

    patient.update(name, dateOfBirth, contactInfo);

    const errors = patient.validate();
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    return await this.patientRepository.update(patient);
  }

  /**
   * Soft delete patient
   */
  async delete(id: string): Promise<void> {
    const patient = await this.patientRepository.findById(id);
    if (!patient) {
      throw new Error('Patient not found');
    }

    await this.patientRepository.softDelete(id);
  }
}
