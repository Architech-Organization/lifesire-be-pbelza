import { Router } from 'express';
import multer from 'multer';
import { ReportController } from '@api/controllers/ReportController';
import { ReportService } from '@domain/services/ReportService';
import { TypeORMReportRepository } from '@infrastructure/persistence/repositories/TypeORMReportRepository';
import { TypeORMPatientRepository } from '@infrastructure/persistence/repositories/TypeORMPatientRepository';
import { LocalFileStorage } from '@infrastructure/storage/LocalFileStorage';
import { asyncHandler } from '@api/middleware/errorHandler';
import { validateBody } from '@api/middleware/validation';
import { UploadReportDto } from '@api/dto/UploadReportDto';
import { getDataSourceSync } from '@infrastructure/config/database';
import path from 'path';

// Multer configuration for file uploads
const storage = multer.memoryStorage(); // Store in memory for processing
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'text/plain', // For testing analysis with lab reports
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, JPEG, PNG, and TXT are allowed'));
    }
  },
});

/**
 * Factory function to create report controller with dependencies
 * Called lazily on first request to ensure DataSource is initialized
 */
function createController(): ReportController {
  const storagePath = path.join(process.cwd(), 'data', 'uploads');
  const fileStorage = new LocalFileStorage(storagePath);
  const dataSource = getDataSourceSync();
  const reportRepository = new TypeORMReportRepository(dataSource);
  const patientRepository = new TypeORMPatientRepository(dataSource);
  const reportService = new ReportService(reportRepository, patientRepository, fileStorage);
  return new ReportController(reportService);
}

const router = Router();
let controllerInstance: ReportController | null = null;

// Lazy controller getter
function getController(): ReportController {
  if (!controllerInstance) {
    controllerInstance = createController();
  }
  return controllerInstance;
}

// Report routes
router.post(
  '/patients/:patientId/reports',
  upload.single('file'),
  validateBody(UploadReportDto),
  asyncHandler(async (req, res) => getController().upload(req, res))
);

router.get(
  '/patients/:patientId/reports',
  asyncHandler(async (req, res) => getController().listByPatient(req, res))
);

router.get(
  '/reports/:id',
  asyncHandler(async (req, res) => getController().getById(req, res))
);

router.get(
  '/reports/:id/file',
  asyncHandler(async (req, res) => getController().downloadFile(req, res))
);

router.delete(
  '/reports/:id',
  asyncHandler(async (req, res) => getController().delete(req, res))
);

export default router;
