import { BaseEntity } from './BaseEntity';

/**
 * ClinicalNote: Domain entity representing clinician-added annotation on a report
 * 
 * Notes are immutable after creation (append-only), support soft delete for audit trail,
 * and displayed newest first when retrieved.
 */
export class ClinicalNote extends BaseEntity {
  constructor(
    id: string,
    public readonly reportId: string,
    public readonly content: string,
    public readonly authorIdentifier: string,
    createdAt: Date,
    deletedAt: Date | null = null
  ) {
    super(id, createdAt, createdAt, deletedAt);
  }

  /**
   * Validate clinical note according to business rules
   * Returns array of validation errors (empty if valid)
   */
  validate(): string[] {
    const errors: string[] = [];

    // Report ID validation
    if (!this.reportId || this.reportId.length === 0) {
      errors.push('Report ID is required');
    }

    // Content validation
    if (!this.content || this.content.trim().length === 0) {
      errors.push('Note content is required');
    } else if (this.content.length < 1) {
      errors.push('Note content must be at least 1 character');
    } else if (this.content.length > 10000) {
      errors.push('Note content must not exceed 10000 characters');
    }

    // Author identifier validation
    if (!this.authorIdentifier || this.authorIdentifier.trim().length === 0) {
      errors.push('Author identifier is required');
    } else if (this.authorIdentifier.length < 1 || this.authorIdentifier.length > 100) {
      errors.push('Author identifier must be 1-100 characters');
    }

    return errors;
  }

  /**
   * Check if note is deleted (soft delete)
   */
  override isDeleted(): boolean {
    return this.deletedAt !== null;
  }
}

