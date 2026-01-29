import { Patient } from './Patient';
import { TimelineEvent } from './TimelineEvent';

/**
 * PatientSummary value object
 * 
 * Aggregates all patient information into a comprehensive view:
 * - Patient demographics
 * - Chronological timeline of reports, analyses, and notes
 * - Highlighted critical findings
 */

export interface CriticalFinding {
  reportId: string;
  finding: string;
  severity: 'critical' | 'high' | 'moderate';
}

export class PatientSummary {
  readonly patient: Patient;
  readonly timeline: TimelineEvent[];
  readonly criticalFindings: CriticalFinding[];

  constructor(
    patient: Patient,
    timeline: TimelineEvent[],
    criticalFindings: CriticalFinding[]
  ) {
    this.patient = patient;
    this.timeline = timeline;
    this.criticalFindings = criticalFindings;
  }

  /**
   * Get timeline events within date range
   */
  filterByDateRange(startDate?: Date, endDate?: Date): TimelineEvent[] {
    let filtered = this.timeline;

    if (startDate) {
      filtered = filtered.filter(event => event.date >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter(event => event.date <= endDate);
    }

    return filtered;
  }

  /**
   * Get count of timeline events
   */
  get eventCount(): number {
    return this.timeline.length;
  }

  /**
   * Get count of critical findings
   */
  get criticalFindingsCount(): number {
    return this.criticalFindings.length;
  }
}
