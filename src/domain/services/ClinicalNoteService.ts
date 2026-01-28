import { ClinicalNote } from '@domain/entities/ClinicalNote';
import { ClinicalNoteRepositoryPort } from '@domain/ports/ClinicalNoteRepository';
import { ReportRepositoryPort } from '@domain/ports/ReportRepository';
import { randomUUID } from 'crypto';

/**
 * ClinicalNoteService: Domain service for clinical note operations
 * 
 * Handles creation, retrieval, and soft deletion of clinical notes on reports.
 * Notes are immutable after creation and ordered newest first.
 */
export class ClinicalNoteService {
  constructor(
    private readonly noteRepository: ClinicalNoteRepositoryPort,
    private readonly reportRepository: ReportRepositoryPort
  ) {}

  /**
   * Create a new clinical note on a report
   * 
   * @throws Error if report not found or validation fails
   */
  async create(
    reportId: string,
    content: string,
    authorIdentifier: string
  ): Promise<ClinicalNote> {
    // Verify report exists
    const report = await this.reportRepository.findById(reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    // Create note
    const note = new ClinicalNote(
      randomUUID(),
      reportId,
      content,
      authorIdentifier,
      new Date(),
      null
    );

    // Validate
    const errors = note.validate();
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Save
    return await this.noteRepository.create(note);
  }

  /**
   * Find all notes for a report (newest first, excluding deleted)
   */
  async findByReport(reportId: string): Promise<ClinicalNote[]> {
    const notes = await this.noteRepository.findByReport(reportId);
    
    // Filter out deleted notes
    const activeNotes = notes.filter(note => !note.isDeleted());
    
    // Sort newest first (descending by createdAt)
    return activeNotes.sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  /**
   * Find note by ID
   */
  async findById(id: string): Promise<ClinicalNote | null> {
    const note = await this.noteRepository.findById(id);
    
    // Return null if deleted
    if (note && note.isDeleted()) {
      return null;
    }
    
    return note;
  }

  /**
   * Soft delete a clinical note (preserve for audit trail)
   */
  async softDelete(id: string): Promise<void> {
    const note = await this.noteRepository.findById(id);
    if (!note) {
      throw new Error('Clinical note not found');
    }

    if (note.isDeleted()) {
      throw new Error('Clinical note already deleted');
    }

    // Soft delete via repository
    await this.noteRepository.softDelete(id);
  }
}
