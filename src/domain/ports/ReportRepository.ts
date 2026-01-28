import { Report } from '@domain/entities/Report';

/**
 * ReportRepositoryPort: Interface for report persistence operations
 * 
 * Defines contract for storing and retrieving medical reports.
 * Implementations: InMemoryReportRepository (mock), TypeORMReportRepository (production)
 */
export interface ReportRepositoryPort {
  /**
   * Create new report
   */
  create(report: Report): Promise<Report>;

  /**
   * Find report by unique ID
   */
  findById(id: string): Promise<Report | null>;

  /**
   * Find all reports for a specific patient
   */
  findByPatient(patientId: string): Promise<Report[]>;

  /**
   * Check if file hash already exists for patient (duplicate detection)
   */
  existsByHashAndPatient(fileHash: string, patientId: string): Promise<boolean>;

  /**
   * Update existing report
   */
  update(report: Report): Promise<Report>;

  /**
   * Soft delete report
   */
  softDelete(id: string): Promise<void>;
}
