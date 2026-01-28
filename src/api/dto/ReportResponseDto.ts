import { Report } from '@domain/entities/Report';

/**
 * ReportResponseDto: Response DTO for report data
 * 
 * Formats report entity for HTTP responses.
 */
export class ReportResponseDto {
  id: string;
  patientId: string;
  reportDate: string; // ISO 8601 date string
  description?: string;
  fileName: string;
  fileFormat: string;
  fileSize: number;
  uploadTimestamp: string;
  createdAt: string;
  updatedAt: string;

  constructor(report: Report) {
    this.id = report.id;
    this.patientId = report.patientId;
    this.reportDate = report.reportDate?.toISOString().split('T')[0] || ''; // YYYY-MM-DD
    this.description = report.description;
    this.fileName = report.fileName;
    this.fileFormat = report.fileFormat;
    this.fileSize = report.fileSize;
    this.uploadTimestamp = report.uploadTimestamp.toISOString();
    this.createdAt = report.createdAt.toISOString();
    this.updatedAt = report.updatedAt.toISOString();
  }

  /**
   * Create array of response DTOs
   */
  static fromArray(reports: Report[]): ReportResponseDto[] {
    return reports.map(report => new ReportResponseDto(report));
  }
}
