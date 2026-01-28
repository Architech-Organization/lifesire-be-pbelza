import { ClinicalNote } from '@domain/entities/ClinicalNote';
import { ClinicalNoteRepositoryPort } from '@domain/ports/ClinicalNoteRepository';

/**
 * InMemoryClinicalNoteRepository: Mock adapter for clinical note storage
 * 
 * Stores notes in memory for testing without database dependency.
 */
export class InMemoryClinicalNoteRepository implements ClinicalNoteRepositoryPort {
  private notes: Map<string, ClinicalNote> = new Map();

  async create(note: ClinicalNote): Promise<ClinicalNote> {
    this.notes.set(note.id, note);
    return note;
  }

  async findById(id: string): Promise<ClinicalNote | null> {
    return this.notes.get(id) || null;
  }

  async findByReport(reportId: string): Promise<ClinicalNote[]> {
    const allNotes = Array.from(this.notes.values());
    return allNotes.filter(note => note.reportId === reportId);
  }

  async softDelete(id: string): Promise<void> {
    const note = this.notes.get(id);
    if (note) {
      const deletedNote = new ClinicalNote(
        note.id,
        note.reportId,
        note.content,
        note.authorIdentifier,
        note.createdAt,
        new Date()
      );
      this.notes.set(id, deletedNote);
    }
  }

  // Test helper
  clear(): void {
    this.notes.clear();
  }
}
