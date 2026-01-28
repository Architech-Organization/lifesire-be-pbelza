import { Report } from '@domain/entities/Report';
import { FileReference } from '@domain/entities/FileReference';
import { ReportRepositoryPort } from '@domain/ports/ReportRepository';
import { PatientRepositoryPort } from '@domain/ports/PatientRepository';
import { FileStoragePort } from '@domain/ports/FileStoragePort';
import { randomUUID } from 'crypto';

/**
 * ReportService: Domain service for report business logic
 * 
 * Orchestrates report upload, storage, and retrieval operations.
 * Implements duplicate detection using file hashes.
 */
export class ReportService {
  constructor(
    private readonly reportRepository: ReportRepositoryPort,
    private readonly patientRepository: PatientRepositoryPort,
    private readonly fileStorage: FileStoragePort
  ) {}

  /**
   * Upload new report for patient
   */
  async upload(
    patientId: string,
    reportDate: Date,
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    fileSize: number,
    description?: string
  ): Promise<Report> {
    // Verify patient exists
    const patient = await this.patientRepository.findById(patientId);
    if (!patient) {
      throw new Error('Patient not found');
    }

    // Store file and get hash
    const { fileReference, fileHash } = await this.fileStorage.store(fileBuffer, {
      fileName,
      fileSize,
      mimeType,
    });

    // Check for duplicate (same file hash + same patient)
    const isDuplicate = await this.reportRepository.existsByHashAndPatient(fileHash, patientId);
    if (isDuplicate) {
      // Delete the uploaded file since it's a duplicate
      await this.fileStorage.delete(fileReference);
      throw new Error('Duplicate file detected. This file has already been uploaded for this patient.');
    }

    // Create report entity
    const report = new Report(
      randomUUID(),
      patientId,
      reportDate,
      fileName,
      new FileReference(fileReference),
      fileHash,
      mimeType,
      fileSize,
      new Date(),
      description
    );

    // Validate business rules
    const errors = report.validate();
    if (errors.length > 0) {
      // Clean up uploaded file on validation failure
      await this.fileStorage.delete(fileReference);
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Persist report
    return await this.reportRepository.create(report);
  }

  /**
   * Find report by ID
   */
  async findById(id: string): Promise<Report | null> {
    return await this.reportRepository.findById(id);
  }

  /**
   * Find all reports for a patient
   */
  async findByPatient(patientId: string): Promise<Report[]> {
    return await this.reportRepository.findByPatient(patientId);
  }

  /**
   * Download report file
   */
  async downloadFile(reportId: string): Promise<{ buffer: Buffer; fileName: string; mimeType: string }> {
    const report = await this.reportRepository.findById(reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    const buffer = await this.fileStorage.retrieve(report.fileReference.path);

    return {
      buffer,
      fileName: report.fileName,
      mimeType: report.fileFormat,
    };
  }

  /**
   * Check if file is duplicate for patient
   */
  async checkDuplicate(fileHash: string, patientId: string): Promise<boolean> {
    return await this.reportRepository.existsByHashAndPatient(fileHash, patientId);
  }

  /**
   * Soft delete report
   */
  async delete(id: string): Promise<void> {
    const report = await this.reportRepository.findById(id);
    if (!report) {
      throw new Error('Report not found');
    }

    await this.reportRepository.softDelete(id);
    // Note: File remains in storage for audit trail (soft delete concept)
  }
}
