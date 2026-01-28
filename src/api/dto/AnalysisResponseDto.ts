import { ExtractedData, TrendIndicators } from '@domain/entities/Analysis';

/**
 * AnalysisResponseDto: HTTP response for analysis data
 * 
 * Formats analysis results for API responses.
 */
export class AnalysisResponseDto {
  id: string;
  reportId: string;
  extractedData: ExtractedData;
  trendIndicators: TrendIndicators;
  confidenceScore: number;
  summaryText: string;
  analysisMethod: string;
  completionStatus: string;
  errorDetails?: string;
  analysisTimestamp: string;
  createdAt: string;
  updatedAt: string;

  constructor(analysis: {
    id: string;
    reportId: string;
    extractedData: ExtractedData;
    trendIndicators: TrendIndicators;
    confidenceScore: number;
    summaryText: string;
    analysisMethod: string;
    completionStatus: string;
    analysisTimestamp: Date;
    errorDetails?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = analysis.id;
    this.reportId = analysis.reportId;
    this.extractedData = analysis.extractedData;
    this.trendIndicators = analysis.trendIndicators;
    this.confidenceScore = analysis.confidenceScore;
    this.summaryText = analysis.summaryText;
    this.analysisMethod = analysis.analysisMethod;
    this.completionStatus = analysis.completionStatus;
    this.errorDetails = analysis.errorDetails;
    this.analysisTimestamp = analysis.analysisTimestamp.toISOString();
    this.createdAt = analysis.createdAt?.toISOString() || new Date().toISOString();
    this.updatedAt = analysis.updatedAt?.toISOString() || new Date().toISOString();
  }
}
