/**
 * AnalysisResult: Value object for structured analysis findings
 * 
 * Immutable container for analysis results with type-safe access to findings.
 */

import { 
  ExtractedData, 
  TrendIndicators 
} from '@domain/ports/AnalysisEnginePort';

export type CompletionStatus = 'complete' | 'partial' | 'failed';

export class AnalysisResult {
  constructor(
    public readonly extractedData: ExtractedData,
    public readonly trendIndicators: TrendIndicators,
    public readonly confidenceScore: number,
    public readonly summaryText: string,
    public readonly completionStatus: CompletionStatus,
    public readonly errorDetails?: string
  ) {}

  /**
   * Check if result has critical findings
   */
  hasCriticalFindings(): boolean {
    // Port LabValue.flag doesn't include 'critical', only 'high', 'low', 'normal'
    const criticalLabs = false; // Not supported in port definition
    
    const criticalFindings = this.extractedData.findings?.some(
      (finding) => finding.severity === 'critical'
    );

    return criticalLabs || criticalFindings || false;
  }

  /**
   * Check if result has high-severity findings
   */
  hasHighSeverityFindings(): boolean {
    return (
      this.extractedData.findings?.some(
        (finding) => finding.severity === 'high' || finding.severity === 'critical'
      ) || false
    );
  }

  /**
   * Get count of abnormal lab values
   */
  getAbnormalLabCount(): number {
    return (
      this.extractedData.labValues?.filter(
        (lab) => lab.flag && lab.flag !== 'normal'
      ).length || 0
    );
  }

  /**
   * Get count of diagnoses
   */
  getDiagnosisCount(): number {
    return this.extractedData.diagnoses?.length || 0;
  }

  /**
   * Check if trends show improvement
   */
  showsImprovement(): boolean {
    return (this.trendIndicators.improving?.length || 0) > 0;
  }

  /**
   * Check if trends show decline
   */
  showsDecline(): boolean {
    return (this.trendIndicators.declining?.length || 0) > 0;
  }

  /**
   * Check if result is reliable for clinical use
   */
  isReliable(minConfidence: number = 0.7): boolean {
    return (
      this.completionStatus === 'complete' &&
      this.confidenceScore >= minConfidence
    );
  }

  /**
   * Convert to plain object for serialization
   */
  toObject(): Record<string, any> {
    return {
      extractedData: this.extractedData,
      trendIndicators: this.trendIndicators,
      confidenceScore: this.confidenceScore,
      summaryText: this.summaryText,
      completionStatus: this.completionStatus,
      errorDetails: this.errorDetails,
    };
  }

  /**
   * Create from plain object
   */
  static fromObject(obj: Record<string, any>): AnalysisResult {
    return new AnalysisResult(
      obj['extractedData'],
      obj['trendIndicators'],
      obj['confidenceScore'],
      obj['summaryText'],
      obj['completionStatus'],
      obj['errorDetails']
    );
  }
}
