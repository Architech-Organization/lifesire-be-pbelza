import { Analysis } from '@domain/entities/Analysis';

/**
 * AnalysisRepositoryPort: Interface for analysis persistence operations
 * 
 * Defines contract for storing and retrieving report analyses.
 * Implementations: InMemoryAnalysisRepository (mock), TypeORMAnalysisRepository (production)
 */
export interface AnalysisRepositoryPort {
  /**
   * Create new analysis
   */
  create(analysis: Analysis): Promise<Analysis>;

  /**
   * Find analysis by unique ID
   */
  findById(id: string): Promise<Analysis | null>;

  /**
   * Find analysis for specific report
   */
  findByReport(reportId: string): Promise<Analysis | null>;

  /**
   * Find all analyses for a patient (via their reports)
   */
  findByPatient(patientId: string): Promise<Analysis[]>;

  /**
   * Update existing analysis
   */
  update(analysis: Analysis): Promise<Analysis>;
}
