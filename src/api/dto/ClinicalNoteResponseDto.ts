import { ClinicalNote } from '@domain/entities/ClinicalNote';

/**
 * ClinicalNoteResponseDto: API response format for clinical notes
 */
export class ClinicalNoteResponseDto {
  id: string;
  reportId: string;
  content: string;
  authorIdentifier: string;
  createdAt: string;

  constructor(note: ClinicalNote) {
    this.id = note.id;
    this.reportId = note.reportId;
    this.content = note.content;
    this.authorIdentifier = note.authorIdentifier;
    this.createdAt = note.createdAt.toISOString();
  }
}
