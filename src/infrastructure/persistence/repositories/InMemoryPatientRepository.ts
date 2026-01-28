import { Patient } from '@domain/entities/Patient';
import { PatientRepositoryPort } from '@domain/ports/PatientRepository';

/**
 * InMemoryPatientRepository: Mock repository for testing
 * 
 * Stores patients in memory using Map.
 * Useful for development and testing without database.
 */
export class InMemoryPatientRepository implements PatientRepositoryPort {
  private patients: Map<string, Patient> = new Map();

  async create(patient: Patient): Promise<Patient> {
    this.patients.set(patient.id, patient);
    return patient;
  }

  async findById(id: string): Promise<Patient | null> {
    const patient = this.patients.get(id);
    return patient && !patient.isDeleted() ? patient : null;
  }

  async findByMRN(medicalRecordNumber: string): Promise<Patient | null> {
    for (const patient of this.patients.values()) {
      if (
        patient.medicalRecordNumber === medicalRecordNumber &&
        !patient.isDeleted()
      ) {
        return patient;
      }
    }
    return null;
  }

  async search(nameQuery: string): Promise<Patient[]> {
    const query = nameQuery.toLowerCase();
    return Array.from(this.patients.values()).filter(
      (patient) =>
        patient.name.toLowerCase().includes(query) && !patient.isDeleted()
    );
  }

  async findAll(): Promise<Patient[]> {
    return Array.from(this.patients.values()).filter(
      (patient) => !patient.isDeleted()
    );
  }

  async update(patient: Patient): Promise<Patient> {
    this.patients.set(patient.id, patient);
    return patient;
  }

  async softDelete(id: string): Promise<void> {
    const patient = this.patients.get(id);
    if (patient) {
      patient.softDelete();
      this.patients.set(id, patient);
    }
  }

  /**
   * Clear all patients (test utility)
   */
  clear(): void {
    this.patients.clear();
  }
}
