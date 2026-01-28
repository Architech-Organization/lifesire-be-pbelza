import { Request, Response } from 'express';
import { AnalysisService } from '@domain/services/AnalysisService';
import { AnalysisResponseDto } from '@api/dto/AnalysisResponseDto';
import { ReportService } from '@domain/services/ReportService';
import { NotFoundError } from '@api/middleware/errorHandler';

/**
 * AnalysisController: HTTP handlers for analysis endpoints
 * 
 * Implements T063: Analysis API endpoints
 */
export class AnalysisController {
  constructor(
    private readonly analysisService: AnalysisService,
    private readonly reportService: ReportService
  ) {}

  /**
   * POST /reports/:id/analyze
   * Analyze a medical report
   */
  analyzeReport = async (req: Request, res: Response): Promise<void> => {
    const { id: reportId } = req.params;

    // Get the report
    const report = await this.reportService.findById(reportId);
    if (!report) {
      throw new NotFoundError('Report not found');
    }

    // Download file for analysis
    const fileBuffer = await this.reportService.downloadFile(reportId);

    // Run analysis
    const analysis = await this.analysisService.analyzeReport(
      reportId,
      fileBuffer,
      report.fileName
    );

    // Return response
    res.status(201).json({
      data: new AnalysisResponseDto(analysis),
    });
  };

  /**
   * GET /reports/:id/analysis
   * Get analysis for a report
   */
  getAnalysis = async (req: Request, res: Response): Promise<void> => {
    const { id: reportId } = req.params;

    const analysis = await this.analysisService.findByReportId(reportId);
    if (!analysis) {
      throw new NotFoundError('Analysis not found for this report');
    }

    res.status(200).json({
      data: new AnalysisResponseDto(analysis),
    });
  };

  /**
   * GET /analyses/:id
   * Get analysis by ID
   */
  getById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const analysis = await this.analysisService.findByReportId(id);
    if (!analysis) {
      throw new NotFoundError('Analysis not found');
    }

    res.status(200).json({
      data: new AnalysisResponseDto(analysis),
    });
  };
}
