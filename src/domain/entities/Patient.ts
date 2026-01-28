import { BaseEntity } from './BaseEntity';

/**
 * Patient domain entity
 * 
 * Represents an individual receiving medical care.
 * Part of hexagonal architecture - no framework dependencies.
 */

export interface ContactInfo {
  email?: string;
  phone?: string;
}

export class Patient extends BaseEntity {
  medicalRecordNumber: string;
  name: string;
  dateOfBirth: Date;
  contactInfo?: ContactInfo;

  constructor(
    id: string,
    medicalRecordNumber: string,
    name: string,
    dateOfBirth: Date,
    contactInfo?: ContactInfo,
    createdAt?: Date,
    updatedAt?: Date,
    deletedAt?: Date | null
  ) {
    super(id, createdAt, updatedAt, deletedAt);
    this.medicalRecordNumber = medicalRecordNumber;
    this.name = name;
    this.dateOfBirth = dateOfBirth;
    this.contactInfo = contactInfo;
  }

  /**
   * Update patient information
   */
  update(
    name: string,
    dateOfBirth: Date,
    contactInfo?: ContactInfo
  ): void {
    this.name = name;
    this.dateOfBirth = dateOfBirth;
    this.contactInfo = contactInfo;
    this.markAsUpdated();
  }

  /**
   * Validate business rules
   */
  validate(): string[] {
    const errors: string[] = [];

    // Medical record number validation
    if (!this.medicalRecordNumber || this.medicalRecordNumber.length < 3 || this.medicalRecordNumber.length > 50) {
      errors.push('Medical record number must be 3-50 characters');
    }
    if (!/^[a-zA-Z0-9\-_]+$/.test(this.medicalRecordNumber)) {
      errors.push('Medical record number must be alphanumeric with optional hyphens or underscores');
    }

    // Name validation
    if (!this.name || this.name.length < 2 || this.name.length > 200) {
      errors.push('Name must be 2-200 characters');
    }

    // Date of birth validation
    if (!this.dateOfBirth) {
      errors.push('Date of birth is required');
    } else if (this.dateOfBirth >= new Date()) {
      errors.push('Date of birth must be in the past');
    }

    // Contact info validation (if provided)
    if (this.contactInfo?.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.contactInfo.email)) {
        errors.push('Invalid email format');
      }
    }

    return errors;
  }

  /**
   * Check if patient is valid
   */
  isValid(): boolean {
    return this.validate().length === 0;
  }
}
