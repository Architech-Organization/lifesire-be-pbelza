import { Request, Response } from 'express';
import { ReportService } from '@domain/services/ReportService';
import { UploadReportDto } from '@api/dto/UploadReportDto';
import { ReportResponseDto } from '@api/dto/ReportResponseDto';
import { NotFoundError, ValidationError } from '@api/middleware/errorHandler';

/**
 * ReportController: HTTP request handlers for report endpoints
 * 
 * Orchestrates between HTTP layer and domain service.
 */
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  /**
   * POST /patients/:patientId/reports - Upload report
   */
  async upload(req: Request, res: Response): Promise<void> {
    const { patientId } = req.params;
    const dto = req.body as UploadReportDto;
    const file = req.file;

    if (!patientId) {
      res.status(400).json({
        error: { message: 'Patient ID is required', statusCode: 400 },
      });
      return;
    }

    if (!file) {
      throw new ValidationError('File is required');
    }

    // Validate report date is not in future
    const reportDate = new Date(dto.reportDate);
    if (reportDate > new Date()) {
      res.status(400).json({
        error: { message: 'Report date cannot be in the future', statusCode: 400 },
      });
      return;
    }

    const report = await this.reportService.upload(
      patientId,
      reportDate,
      file.buffer,
      file.originalname,
      file.mimetype,
      file.size,
      dto.description
    );

    const response = new ReportResponseDto(report);
    res.status(201).json({ data: response });
  }

  /**
   * GET /patients/:patientId/reports - List reports for patient
   */
  async listByPatient(req: Request, res: Response): Promise<void> {
    const { patientId } = req.params;

    if (!patientId) {
      res.status(400).json({
        error: { message: 'Patient ID is required', statusCode: 400 },
      });
      return;
    }

    const reports = await this.reportService.findByPatient(patientId);
    const response = ReportResponseDto.fromArray(reports);
    res.status(200).json({ data: response });
  }

  /**
   * GET /reports/:id - Get report by ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        error: { message: 'Report ID is required', statusCode: 400 },
      });
      return;
    }

    const report = await this.reportService.findById(id);
    if (!report) {
      throw new NotFoundError('Report not found');
    }

    const response = new ReportResponseDto(report);
    res.status(200).json({ data: response });
  }

  /**
   * GET /reports/:id/file - Download report file
   */
  async downloadFile(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        error: { message: 'Report ID is required', statusCode: 400 },
      });
      return;
    }

    const { buffer, fileName, mimeType } = await this.reportService.downloadFile(id);

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  }

  /**
   * DELETE /reports/:id - Soft delete report
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        error: { message: 'Report ID is required', statusCode: 400 },
      });
      return;
    }

    await this.reportService.delete(id);
    res.status(204).send();
  }
}
