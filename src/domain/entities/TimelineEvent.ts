import { Report } from './Report';
import { Analysis } from './Analysis';
import { ClinicalNote } from './ClinicalNote';

/**
 * TimelineEvent value object
 * 
 * Represents a single event in the patient timeline.
 * Events can be reports with associated analyses and notes.
 */

export type TimelineEventType = 'report' | 'note';

export interface TimelineEventData {
  report: Report;
  analysis: Analysis | null;
  notes: ClinicalNote[];
}

export class TimelineEvent {
  readonly date: Date;
  readonly type: TimelineEventType;
  readonly data: TimelineEventData;

  constructor(date: Date, type: TimelineEventType, data: TimelineEventData) {
    this.date = date;
    this.type = type;
    this.data = data;
  }

  /**
   * Create timeline event from report
   */
  static fromReport(
    report: Report,
    analysis: Analysis | null,
    notes: ClinicalNote[]
  ): TimelineEvent {
    return new TimelineEvent(report.reportDate, 'report', {
      report,
      analysis,
      notes,
    });
  }

  /**
   * Check if event has critical findings
   */
  hasCriticalFindings(): boolean {
    if (!this.data.analysis) {
      return false;
    }
    return this.data.analysis.confidenceScore >= 0.8;
  }
}
