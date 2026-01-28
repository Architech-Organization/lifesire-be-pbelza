import { Analysis, ExtractedData, TrendIndicators, AnalysisMethod } from '@domain/entities/Analysis';
import { AnalysisResult as AnalysisResultPort } from '@domain/ports/AnalysisEnginePort';
import { AnalysisRepositoryPort } from '@domain/ports/AnalysisRepository';
import { ReportRepositoryPort } from '@domain/ports/ReportRepository';
import { AnalysisEnginePort } from '@domain/ports/AnalysisEnginePort';
import { randomUUID } from 'crypto';

/**
 * AnalysisService: Domain service for report analysis operations
 * 
 * Orchestrates analysis of medical reports using configured analysis engine,
 * implements trend detection across multiple reports, and manages partial results.
 */
export class AnalysisService {
  constructor(
    private readonly analysisRepository: AnalysisRepositoryPort,
    private readonly reportRepository: ReportRepositoryPort,
    private readonly analysisEngine: AnalysisEnginePort
  ) {}

  /**
   * Analyze a medical report
   * 
   * Downloads file, passes to analysis engine, calculates trends, stores result.
   * Handles partial results per spec requirements.
   */
  async analyzeReport(
    reportId: string,
    fileBuffer: Buffer,
    fileName: string
  ): Promise<Analysis> {
    // Verify report exists
    const report = await this.reportRepository.findById(reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    // Check if analysis already exists
    const existing = await this.analysisRepository.findByReport(reportId);
    if (existing) {
      throw new Error('Report has already been analyzed');
    }

    // Run analysis engine
    let analysisResult: AnalysisResultPort;
    try {
      analysisResult = await this.analysisEngine.analyze(fileBuffer, fileName, report.fileFormat);
    } catch (error: any) {
      // Create failed analysis with error details per T061
      const failedAnalysis = new Analysis(
        randomUUID(),
        reportId,
        {}, // Empty extracted data
        {}, // Empty trend indicators
        0, // Zero confidence
        'Analysis failed: ' + error.message,
        this.analysisEngine.getEngineType() as any,
        'failed',
        new Date(),
        error.message || 'Unknown error'
      );

      return await this.analysisRepository.create(failedAnalysis);
    }

    // Calculate trends if patient has other reports
    const trendIndicators = await this.calculateTrends(
      report.patientId,
      analysisResult.extractedData
    );

    // Merge calculated trends with engine trends
    const mergedTrends: TrendIndicators = {
      improving: [
        ...(analysisResult.trendIndicators.improving || []),
        ...(trendIndicators.improving || []),
      ],
      declining: [
        ...(analysisResult.trendIndicators.declining || []),
        ...(trendIndicators.declining || []),
      ],
      stable: [
        ...(analysisResult.trendIndicators.stable || []),
        ...(trendIndicators.stable || []),
      ],
      recurring: [
        ...(analysisResult.trendIndicators.recurring || []),
        ...(trendIndicators.recurring || []),
      ],
    };

    // Create analysis entity
    const analysis = new Analysis(
      randomUUID(),
      reportId,
      analysisResult.extractedData,
      mergedTrends,
      analysisResult.confidenceScore,
      analysisResult.summaryText,
      this.analysisEngine.getEngineType() as AnalysisMethod,
      analysisResult.completionStatus,
      new Date(),
      analysisResult.errorDetails
    );

    // Validate
    const errors = analysis.validate();
    if (errors.length > 0) {
      throw new Error(`Analysis validation failed: ${errors.join(', ')}`);
    }

    // Persist
    return await this.analysisRepository.create(analysis);
  }

  /**
   * Find analysis by ID
   */
  async findById(id: string): Promise<Analysis | null> {
    return await this.analysisRepository.findById(id);
  }

  /**
   * Find analysis by report ID
   */
  async findByReportId(reportId: string): Promise<Analysis | null> {
    return await this.analysisRepository.findByReport(reportId);
  }

  /**
   * Calculate trend indicators by comparing with previous reports
   * 
   * Implements T060: Trend detection logic
   */
  async calculateTrends(
    patientId: string,
    currentData: ExtractedData
  ): Promise<TrendIndicators> {
    // Get all reports for patient
    const reports = await this.reportRepository.findByPatient(patientId);
    
    // Need at least one previous report for trends
    if (reports.length < 2) {
      return {};
    }

    // Get analyses for all reports except current one
    const previousAnalyses: Analysis[] = [];
    for (const report of reports) {
      const analysis = await this.analysisRepository.findByReport(report.id);
      if (analysis && analysis.completionStatus !== 'failed') {
        previousAnalyses.push(analysis);
      }
    }

    if (previousAnalyses.length === 0) {
      return {};
    }

    const trends: TrendIndicators = {
      improving: [],
      declining: [],
      stable: [],
      recurring: [],
    };

    // Compare lab values
    if (currentData.labValues) {
      for (const currentLab of currentData.labValues) {
        const previousValues = previousAnalyses
          .map(a => a.extractedData.labValues?.find(l => l.name === currentLab.name))
          .filter(l => l !== undefined);

        if (previousValues.length > 0) {
          const trend = this.detectLabTrend(currentLab, previousValues as any[]);
          if (trend === 'improving') trends.improving?.push(currentLab.name);
          else if (trend === 'declining') trends.declining?.push(currentLab.name);
          else if (trend === 'stable') trends.stable?.push(currentLab.name);
        }
      }
    }

    // Check for recurring diagnoses
    if (currentData.diagnoses) {
      for (const diagnosis of currentData.diagnoses) {
        const appearsInPrevious = previousAnalyses.some(a =>
          a.extractedData.diagnoses?.some(d => d.description === diagnosis.description)
        );
        if (appearsInPrevious) {
          trends.recurring?.push(diagnosis.description);
        }
      }
    }

    return trends;
  }

  /**
   * Detect trend for a single lab value
   */
  private detectLabTrend(current: any, previous: any[]): 'improving' | 'declining' | 'stable' {
    // Simple trend detection based on flag changes
    const previousFlags = previous.map(p => p.flag || 'normal');
    const currentFlag = current.flag || 'normal';

    // If was abnormal and now normal = improving
    if (previousFlags.some(f => f !== 'normal') && currentFlag === 'normal') {
      return 'improving';
    }

    // If was normal and now abnormal = declining
    if (previousFlags.every(f => f === 'normal') && currentFlag !== 'normal') {
      return 'declining';
    }

    // Otherwise stable
    return 'stable';
  }

  /**
   * Compare trends across multiple reports for a patient
   */
  async compareTrends(patientId: string): Promise<TrendIndicators> {
    const reports = await this.reportRepository.findByPatient(patientId);
    const analyses: Analysis[] = [];

    for (const report of reports) {
      const analysis = await this.analysisRepository.findByReport(report.id);
      if (analysis && analysis.hasUsableResults()) {
        analyses.push(analysis);
      }
    }

    if (analyses.length < 2) {
      return {};
    }

    // Aggregate all trend indicators
    const aggregated: TrendIndicators = {
      improving: [],
      declining: [],
      stable: [],
      recurring: [],
    };

    for (const analysis of analyses) {
      aggregated.improving?.push(...(analysis.trendIndicators.improving || []));
      aggregated.declining?.push(...(analysis.trendIndicators.declining || []));
      aggregated.stable?.push(...(analysis.trendIndicators.stable || []));
      aggregated.recurring?.push(...(analysis.trendIndicators.recurring || []));
    }

    // Deduplicate
    return {
      improving: [...new Set(aggregated.improving)],
      declining: [...new Set(aggregated.declining)],
      stable: [...new Set(aggregated.stable)],
      recurring: [...new Set(aggregated.recurring)],
    };
  }
}
