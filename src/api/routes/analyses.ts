import { Router } from 'express';
import { AnalysisController } from '@api/controllers/AnalysisController';
import { AnalysisService } from '@domain/services/AnalysisService';
import { ReportService } from '@domain/services/ReportService';
import { TypeORMAnalysisRepository } from '@infrastructure/persistence/repositories/TypeORMAnalysisRepository';
import { TypeORMReportRepository } from '@infrastructure/persistence/repositories/TypeORMReportRepository';
import { TypeORMPatientRepository } from '@infrastructure/persistence/repositories/TypeORMPatientRepository';
import { LocalFileStorage } from '@infrastructure/storage/LocalFileStorage';
import { MockAnalysisEngine } from '@infrastructure/analysis/MockAnalysisEngine';
import { getDataSourceSync } from '@infrastructure/config/database';
import { asyncHandler } from '@api/middleware/errorHandler';

const router = Router();

// Lazy controller initialization
let controllerInstance: AnalysisController | null = null;

function getController(): AnalysisController {
  if (!controllerInstance) {
    const dataSource = getDataSourceSync();
    
    // Create repositories
    const analysisRepository = new TypeORMAnalysisRepository(dataSource);
    const reportRepository = new TypeORMReportRepository(dataSource);
    const patientRepository = new TypeORMPatientRepository(dataSource);

    // Create adapters
    const fileStorage = new LocalFileStorage('./data/uploads');
    const analysisEngine = new MockAnalysisEngine();

    // Create services
    const reportService = new ReportService(
      reportRepository,
      patientRepository,
      fileStorage
    );

    const analysisService = new AnalysisService(
      analysisRepository,
      reportRepository,
      analysisEngine
    );

    controllerInstance = new AnalysisController(analysisService, reportService);
  }
  
  return controllerInstance;
}

// POST /api/v1/reports/:id/analyze - Analyze a report
router.post('/reports/:id/analyze', asyncHandler(async (req, res) => {
  await getController().analyzeReport(req, res);
}));

// GET /api/v1/reports/:id/analysis - Get analysis for a report
router.get('/reports/:id/analysis', asyncHandler(async (req, res) => {
  await getController().getAnalysis(req, res);
}));

// GET /api/v1/analyses/:id - Get analysis by ID
router.get('/analyses/:id', asyncHandler(async (req, res) => {
  await getController().getById(req, res);
}));

export default router;
