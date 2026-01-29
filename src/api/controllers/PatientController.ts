import { Request, Response } from 'express';
import { PatientService } from '@domain/services/PatientService';
import { SummaryService } from '@domain/services/SummaryService';
import { CreatePatientDto } from '@api/dto/CreatePatientDto';
import { PatientResponseDto } from '@api/dto/PatientResponseDto';
import { PatientSummaryResponseDto } from '@api/dto/PatientSummaryResponseDto';
import { SummaryQueryDto } from '@api/dto/SummaryQueryDto';
import { NotFoundError } from '@api/middleware/errorHandler';

/**
 * PatientController: HTTP request handlers for patient endpoints
 * 
 * Orchestrates between HTTP layer and domain service.
 */
export class PatientController {
  constructor(
    private readonly patientService: PatientService,
    private readonly summaryService?: SummaryService
  ) {}

  /**
   * POST /patients - Create new patient
   */
  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreatePatientDto;

    // Validate date is in the past
    const dateOfBirth = new Date(dto.dateOfBirth);
    if (dateOfBirth >= new Date()) {
      res.status(400).json({
        error: {
          message: 'Date of birth must be in the past',
          statusCode: 400,
        },
      });
      return;
    }

    const contactInfo = dto.contactInfo
      ? {
          email: dto.contactInfo.email,
          phone: dto.contactInfo.phone,
        }
      : undefined;

    const patient = await this.patientService.create(
      dto.medicalRecordNumber,
      dto.name,
      dateOfBirth,
      contactInfo
    );

    const response = new PatientResponseDto(patient);
    res.status(201).json({ data: response });
  }

  /**
   * GET /patients - List all patients
   */
  async list(_req: Request, res: Response): Promise<void> {
    const patients = await this.patientService.listAll();
    const response = PatientResponseDto.fromArray(patients);
    res.status(200).json({ data: response });
  }

  /**
   * GET /patients/search?name=query - Search patients by name
   */
  async search(req: Request, res: Response): Promise<void> {
    const nameQuery = req.query['name'] as string;

    if (!nameQuery) {
      res.status(400).json({
        error: {
          message: 'Query parameter "name" is required',
          statusCode: 400,
        },
      });
      return;
    }

    const patients = await this.patientService.search(nameQuery);
    const response = PatientResponseDto.fromArray(patients);
    res.status(200).json({ data: response });
  }

  /**
   * GET /patients/:id - Get patient by ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        error: { message: 'Patient ID is required', statusCode: 400 },
      });
      return;
    }

    const patient = await this.patientService.findById(id);
    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    const response = new PatientResponseDto(patient);
    res.status(200).json({ data: response });
  }

  /**
   * PUT /patients/:id - Update patient
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as CreatePatientDto;

    if (!id) {
      res.status(400).json({
        error: { message: 'Patient ID is required', statusCode: 400 },
      });
      return;
    }

    const dateOfBirth = new Date(dto.dateOfBirth);
    if (dateOfBirth >= new Date()) {
      res.status(400).json({
        error: {
          message: 'Date of birth must be in the past',
          statusCode: 400,
        },
      });
      return;
    }

    const contactInfo = dto.contactInfo
      ? {
          email: dto.contactInfo.email,
          phone: dto.contactInfo.phone,
        }
      : undefined;

    const patient = await this.patientService.update(
      id,
      dto.name,
      dateOfBirth,
      contactInfo
    );

    const response = new PatientResponseDto(patient);
    res.status(200).json({ data: response });
  }

  /**
   * DELETE /patients/:id - Soft delete patient
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        error: { message: 'Patient ID is required', statusCode: 400 },
      });
      return;
    }

    await this.patientService.delete(id);
    res.status(204).send();
  }

  /**
   * GET /patients/:id/summary - Get comprehensive patient summary
   */
  async getSummary(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const query = req.query as unknown as SummaryQueryDto;

    if (!id) {
      res.status(400).json({
        error: { message: 'Patient ID is required', statusCode: 400 },
      });
      return;
    }

    if (!this.summaryService) {
      res.status(500).json({
        error: { message: 'Summary service not configured', statusCode: 500 },
      });
      return;
    }

    // Parse date filters
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    const summary = await this.summaryService.generateSummary(id, startDate, endDate);
    const response = new PatientSummaryResponseDto(summary);
    res.status(200).json({ data: response });
  }
}
