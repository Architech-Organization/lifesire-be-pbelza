import { Router } from 'express';
import { PatientController } from '@api/controllers/PatientController';
import { PatientService } from '@domain/services/PatientService';
import { SummaryService } from '@domain/services/SummaryService';
import { validateBody, validateQuery } from '@api/middleware/validation';
import { asyncHandler } from '@api/middleware/errorHandler';
import { CreatePatientDto } from '@api/dto/CreatePatientDto';
import { SummaryQueryDto } from '@api/dto/SummaryQueryDto';
import { getDataSource } from '@infrastructure/config/database';
import { TypeORMPatientRepository } from '@infrastructure/persistence/repositories/TypeORMPatientRepository';
import { TypeORMReportRepository } from '@infrastructure/persistence/repositories/TypeORMReportRepository';
import { TypeORMAnalysisRepository } from '@infrastructure/persistence/repositories/TypeORMAnalysisRepository';
import { TypeORMClinicalNoteRepository } from '@infrastructure/persistence/repositories/TypeORMClinicalNoteRepository';

/**
 * Patient routes
 * 
 * Wires up dependencies and registers HTTP endpoints.
 */

const router = Router();

// Dependency injection - create service with repository
const createController = async (): Promise<PatientController> => {
  const dataSource = await getDataSource();
  const patientRepository = new TypeORMPatientRepository(dataSource);
  const reportRepository = new TypeORMReportRepository(dataSource);
  const analysisRepository = new TypeORMAnalysisRepository(dataSource);
  const noteRepository = new TypeORMClinicalNoteRepository(dataSource);
  
  const patientService = new PatientService(patientRepository);
  const summaryService = new SummaryService(
    patientRepository,
    reportRepository,
    analysisRepository,
    noteRepository
  );
  
  return new PatientController(patientService, summaryService);
};

// GET /patients/search - must be before /:id to avoid route conflicts
router.get(
  '/search',
  asyncHandler(async (req, res) => {
    const controller = await createController();
    await controller.search(req, res);
  })
);

// POST /patients
router.post(
  '/',
  validateBody(CreatePatientDto),
  asyncHandler(async (req, res) => {
    const controller = await createController();
    await controller.create(req, res);
  })
);

// GET /patients
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const controller = await createController();
    await controller.list(req, res);
  })
);

// GET /patients/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const controller = await createController();
    await controller.getById(req, res);
  })
);

// GET /patients/:id/summary
router.get(
  '/:id/summary',
  validateQuery(SummaryQueryDto),
  asyncHandler(async (req, res) => {
    const controller = await createController();
    await controller.getSummary(req, res);
  })
);

// PUT /patients/:id
router.put(
  '/:id',
  validateBody(CreatePatientDto),
  asyncHandler(async (req, res) => {
    const controller = await createController();
    await controller.update(req, res);
  })
);

// DELETE /patients/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const controller = await createController();
    await controller.delete(req, res);
  })
);

export default router;
