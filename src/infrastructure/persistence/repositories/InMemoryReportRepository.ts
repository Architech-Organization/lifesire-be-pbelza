import { Report } from '@domain/entities/Report';

import { ReportRepositoryPort } from '@domain/ports/ReportRepository';

/**
 * InMemoryReportRepository: Mock repository for testing
 * 
 * Stores reports in memory using Map.
 * Useful for development and testing without database.
 */
export class InMemoryReportRepository implements ReportRepositoryPort {
  private reports: Map<string, Report> = new Map();

  async create(report: Report): Promise<Report> {
    this.reports.set(report.id, report);
    return report;
  }

  async findById(id: string): Promise<Report | null> {
    const report = this.reports.get(id);
    return report && !report.isDeleted() ? report : null;
  }

  async findByPatient(patientId: string): Promise<Report[]> {
    return Array.from(this.reports.values()).filter(
      (report) => report.patientId === patientId && !report.isDeleted()
    );
  }

  async existsByHashAndPatient(fileHash: string, patientId: string): Promise<boolean> {
    for (const report of this.reports.values()) {
      if (
        report.fileHash === fileHash &&
        report.patientId === patientId &&
        !report.isDeleted()
      ) {
        return true;
      }
    }
    return false;
  }

  async update(report: Report): Promise<Report> {
    this.reports.set(report.id, report);
    return report;
  }

  async softDelete(id: string): Promise<void> {
    const report = this.reports.get(id);
    if (report) {
      report.softDelete();
      this.reports.set(id, report);
    }
  }

  /**
   * Clear all reports (test utility)
   */
  clear(): void {
    this.reports.clear();
  }
}
