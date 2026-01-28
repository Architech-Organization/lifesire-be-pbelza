import { BaseEntity } from './BaseEntity';

/**
 * ClinicalNote domain entity (placeholder for Phase 6)
 * 
 * This is a minimal stub to satisfy port interfaces.
 * Full implementation in T066 (User Story 4).
 */
export class ClinicalNote extends BaseEntity {
  reportId: string;
  content: string;
  authorIdentifier: string;

  constructor(
    id: string,
    reportId: string,
    content: string,
    authorIdentifier: string
  ) {
    super(id);
    this.reportId = reportId;
    this.content = content;
    this.authorIdentifier = authorIdentifier;
  }
}
