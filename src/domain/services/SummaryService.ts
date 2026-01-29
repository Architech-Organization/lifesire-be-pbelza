import { PatientRepositoryPort } from '@domain/ports/PatientRepository';
import { ReportRepositoryPort } from '@domain/ports/ReportRepository';
import { AnalysisRepositoryPort } from '@domain/ports/AnalysisRepository';
import { ClinicalNoteRepositoryPort } from '@domain/ports/ClinicalNoteRepository';
import { PatientSummary, CriticalFinding } from '@domain/entities/PatientSummary';
import { TimelineEvent } from '@domain/entities/TimelineEvent';

/**
 * SummaryService: Domain service for patient summary generation
 * 
 * Aggregates data from multiple sources to create comprehensive patient views.
 * Part of hexagonal architecture - pure business logic.
 */
export class SummaryService {
  constructor(
    private readonly patientRepository: PatientRepositoryPort,
    private readonly reportRepository: ReportRepositoryPort,
    private readonly analysisRepository: AnalysisRepositoryPort,
    private readonly clinicalNoteRepository: ClinicalNoteRepositoryPort
  ) {}

  /**
   * Generate comprehensive patient summary
   */
  async generateSummary(
    patientId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<PatientSummary> {
    // Get patient
    const patient = await this.patientRepository.findById(patientId);
    if (!patient) {
      throw new Error(`Patient not found: ${patientId}`);
    }

    // Get all reports for patient
    const reports = await this.reportRepository.findByPatient(patientId);

    // Build timeline events
    const timelinePromises = reports.map(async report => {
      // Get analysis for report (if exists)
      const analysis = await this.analysisRepository.findByReport(report.id);

      // Get notes for report
      const notes = await this.clinicalNoteRepository.findByReport(report.id);

      return TimelineEvent.fromReport(report, analysis, notes);
    });

    const timeline = await Promise.all(timelinePromises);

    // Sort timeline by date (newest first)
    timeline.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Apply date filters if provided
    const filteredTimeline = this.applyFilters(timeline, startDate, endDate);

    // Extract critical findings
    const criticalFindings = this.highlightCriticalFindings(filteredTimeline);

    return new PatientSummary(patient, filteredTimeline, criticalFindings);
  }

  /**
   * Apply date range filters to timeline
   */
  private applyFilters(
    timeline: TimelineEvent[],
    startDate?: Date,
    endDate?: Date
  ): TimelineEvent[] {
    let filtered = timeline;

    if (startDate) {
      filtered = filtered.filter(event => event.date >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter(event => event.date <= endDate);
    }

    return filtered;
  }

  /**
   * Extract critical findings from timeline events
   * 
   * Highlights analyses with high confidence scores as critical findings.
   * Uses confidence >= 0.9 for critical, >= 0.8 for high, >= 0.7 for moderate.
   */
  private highlightCriticalFindings(timeline: TimelineEvent[]): CriticalFinding[] {
    const findings: CriticalFinding[] = [];

    for (const event of timeline) {
      if (event.type === 'report' && event.data.analysis) {
        const analysis = event.data.analysis;
        const score = analysis.confidenceScore;

        let severity: 'critical' | 'high' | 'moderate' | null = null;

        if (score >= 0.9) {
          severity = 'critical';
        } else if (score >= 0.8) {
          severity = 'high';
        } else if (score >= 0.7) {
          severity = 'moderate';
        }

        if (severity) {
          findings.push({
            reportId: event.data.report.id,
            finding: analysis.summaryText,
            severity,
          });
        }
      }
    }

    return findings;
  }
}
