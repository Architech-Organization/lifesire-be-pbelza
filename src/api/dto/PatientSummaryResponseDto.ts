import { PatientSummary, CriticalFinding } from '@domain/entities/PatientSummary';
import { TimelineEvent } from '@domain/entities/TimelineEvent';
import { PatientResponseDto } from './PatientResponseDto';
import { ReportResponseDto } from './ReportResponseDto';
import { AnalysisResponseDto } from './AnalysisResponseDto';
import { ClinicalNoteResponseDto } from './ClinicalNoteResponseDto';

/**
 * TimelineEventResponseDto: API response for timeline events
 */
export class TimelineEventResponseDto {
  date: string;
  type: string;
  data: {
    report: ReportResponseDto;
    analysis: AnalysisResponseDto | null;
    notes: ClinicalNoteResponseDto[];
  };

  constructor(event: TimelineEvent) {
    this.date = event.date.toISOString().split('T')[0]!; // YYYY-MM-DD format
    this.type = event.type;
    this.data = {
      report: new ReportResponseDto(event.data.report),
      analysis: event.data.analysis ? new AnalysisResponseDto(event.data.analysis) : null,
      notes: event.data.notes.map(note => new ClinicalNoteResponseDto(note)),
    };
  }
}

/**
 * CriticalFindingResponseDto: API response for critical findings
 */
export class CriticalFindingResponseDto {
  reportId: string;
  finding: string;
  severity: string;

  constructor(finding: CriticalFinding) {
    this.reportId = finding.reportId;
    this.finding = finding.finding;
    this.severity = finding.severity;
  }
}

/**
 * PatientSummaryResponseDto: API response for patient summary
 * 
 * Maps domain PatientSummary to API response format per openapi.yaml.
 */
export class PatientSummaryResponseDto {
  patient: PatientResponseDto;
  timeline: TimelineEventResponseDto[];
  criticalFindings: CriticalFindingResponseDto[];

  constructor(summary: PatientSummary) {
    this.patient = new PatientResponseDto(summary.patient);
    this.timeline = summary.timeline.map(event => new TimelineEventResponseDto(event));
    this.criticalFindings = summary.criticalFindings.map(
      finding => new CriticalFindingResponseDto(finding)
    );
  }
}
