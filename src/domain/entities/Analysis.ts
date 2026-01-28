import { BaseEntity } from './BaseEntity';
import { 
  ExtractedData, 
  TrendIndicators 
} from '@domain/ports/AnalysisEnginePort';

/**
 * Analysis: Domain entity representing automated medical report analysis
 * 
 * Captures structured medical findings extracted from reports, including
 * lab values, diagnoses, medications, and trend indicators.
 * 
 * Uses types from AnalysisEnginePort for consistency.
 */

export type AnalysisMethod = 'mock' | 'openai-gpt4' | 'anthropic-claude' | 'local-llm';
export type CompletionStatus = 'complete' | 'partial' | 'failed';

// Re-export port types for convenience
export type { 
  LabValue,
  Diagnosis, 
  Medication,
  Finding,
  ExtractedData,
  TrendIndicators
} from '@domain/ports/AnalysisEnginePort';

export class Analysis extends BaseEntity {
  constructor(
    id: string,
    public readonly reportId: string,
    public readonly extractedData: ExtractedData,
    public readonly trendIndicators: TrendIndicators,
    public readonly confidenceScore: number,
    public readonly summaryText: string,
    public readonly analysisMethod: AnalysisMethod,
    public readonly completionStatus: CompletionStatus,
    public readonly analysisTimestamp: Date,
    public readonly errorDetails?: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  /**
   * Validate analysis business rules
   * Returns array of validation errors, empty if valid
   */
  validate(): string[] {
    const errors: string[] = [];

    if (!this.reportId || this.reportId.trim() === '') {
      errors.push('Report ID is required');
    }

    if (!this.extractedData || typeof this.extractedData !== 'object') {
      errors.push('Extracted data is required and must be an object');
    }

    if (this.confidenceScore < 0 || this.confidenceScore > 1) {
      errors.push('Confidence score must be between 0.0 and 1.0');
    }

    if (!this.summaryText || this.summaryText.trim() === '') {
      errors.push('Summary text is required');
    } else if (this.summaryText.length < 10) {
      errors.push('Summary text must be at least 10 characters');
    } else if (this.summaryText.length > 5000) {
      errors.push('Summary text must not exceed 5000 characters');
    }

    const validMethods: AnalysisMethod[] = ['mock', 'openai-gpt4', 'anthropic-claude', 'local-llm'];
    if (!validMethods.includes(this.analysisMethod)) {
      errors.push('Invalid analysis method');
    }

    const validStatuses: CompletionStatus[] = ['complete', 'partial', 'failed'];
    if (!validStatuses.includes(this.completionStatus)) {
      errors.push('Invalid completion status');
    }

    if (this.errorDetails && this.errorDetails.length > 2000) {
      errors.push('Error details must not exceed 2000 characters');
    }

    if (this.analysisTimestamp > new Date()) {
      errors.push('Analysis timestamp cannot be in the future');
    }

    return errors;
  }

  /**
   * Check if analysis was successful
   */
  isSuccessful(): boolean {
    return this.completionStatus === 'complete';
  }

  /**
   * Check if analysis produced usable results
   */
  hasUsableResults(): boolean {
    return this.completionStatus === 'complete' || this.completionStatus === 'partial';
  }

  /**
   * Check if confidence score meets minimum threshold
   */
  meetsConfidenceThreshold(threshold: number = 0.5): boolean {
    return this.confidenceScore >= threshold;
  }
}
