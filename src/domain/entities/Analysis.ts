import { BaseEntity } from './BaseEntity';

/**
 * Analysis domain entity (placeholder for Phase 5)
 * 
 * This is a minimal stub to satisfy port interfaces.
 * Full implementation in T049 (User Story 3).
 */
export class Analysis extends BaseEntity {
  reportId: string;
  extractedData: any;
  confidenceScore: number;
  summaryText: string;

  constructor(
    id: string,
    reportId: string,
    extractedData: any,
    confidenceScore: number,
    summaryText: string
  ) {
    super(id);
    this.reportId = reportId;
    this.extractedData = extractedData;
    this.confidenceScore = confidenceScore;
    this.summaryText = summaryText;
  }
}
