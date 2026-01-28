import { ClinicalNote } from '@domain/entities/ClinicalNote';

/**
 * ClinicalNoteRepositoryPort: Interface for clinical note persistence operations
 * 
 * Defines contract for storing and retrieving clinical notes on reports.
 * Implementations: InMemoryClinicalNoteRepository (mock), TypeORMClinicalNoteRepository (production)
 */
export interface ClinicalNoteRepositoryPort {
  /**
   * Create new clinical note
   */
  create(note: ClinicalNote): Promise<ClinicalNote>;

  /**
   * Find note by unique ID
   */
  findById(id: string): Promise<ClinicalNote | null>;

  /**
   * Find all notes for a specific report (newest first)
   */
  findByReport(reportId: string): Promise<ClinicalNote[]>;

  /**
   * Soft delete note (audit trail preservation)
   */
  softDelete(id: string): Promise<void>;
}
