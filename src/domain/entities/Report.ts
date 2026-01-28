import { BaseEntity } from './BaseEntity';
import { FileReference } from './FileReference';

/**
 * Report domain entity
 * 
 * Represents a medical document uploaded for a patient.
 * Part of hexagonal architecture - no framework dependencies.
 */
export class Report extends BaseEntity {
  patientId: string;
  reportDate: Date;
  description?: string;
  fileName: string;
  fileReference: FileReference;
  fileHash: string;
  fileFormat: string;
  fileSize: number;
  uploadTimestamp: Date;

  constructor(
    id: string,
    patientId: string,
    reportDate: Date,
    fileName: string,
    fileReference: FileReference,
    fileHash: string,
    fileFormat: string,
    fileSize: number,
    uploadTimestamp: Date,
    description?: string,
    createdAt?: Date,
    updatedAt?: Date,
    deletedAt?: Date | null
  ) {
    super(id, createdAt, updatedAt, deletedAt);
    this.patientId = patientId;
    this.reportDate = reportDate;
    this.description = description;
    this.fileName = fileName;
    this.fileReference = fileReference;
    this.fileHash = fileHash;
    this.fileFormat = fileFormat;
    this.fileSize = fileSize;
    this.uploadTimestamp = uploadTimestamp;
  }

  /**
   * Validate business rules
   */
  validate(): string[] {
    const errors: string[] = [];

    // Patient ID validation
    if (!this.patientId) {
      errors.push('Patient ID is required');
    }

    // Report date validation
    if (!this.reportDate) {
      errors.push('Report date is required');
    } else if (this.reportDate > new Date()) {
      errors.push('Report date cannot be in the future');
    }

    // File name validation
    if (!this.fileName || this.fileName.length < 1 || this.fileName.length > 255) {
      errors.push('File name must be 1-255 characters');
    }

    // File format validation
    const allowedFormats = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'text/plain', // For testing analysis with lab reports
    ];
    if (!allowedFormats.includes(this.fileFormat)) {
      errors.push('Invalid file format. Allowed: PDF, DOCX, JPEG, PNG, TXT');
    }

    // File size validation
    const maxSize = 52428800; // 50MB
    if (this.fileSize <= 0 || this.fileSize > maxSize) {
      errors.push('File size must be between 1 byte and 50MB');
    }

    // File hash validation
    if (!this.fileHash || this.fileHash.length !== 64) {
      errors.push('File hash must be a valid SHA-256 hex string (64 characters)');
    }

    // Description validation (optional)
    if (this.description && this.description.length > 1000) {
      errors.push('Description must not exceed 1000 characters');
    }

    return errors;
  }

  /**
   * Check if report is valid
   */
  isValid(): boolean {
    return this.validate().length === 0;
  }
}
