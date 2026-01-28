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
import { AppDataSource } from '@infrastructure/config/database';
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
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, JPEG, and PNG are allowed'));
    }
  },
});

/**
 * Factory function to create report controller with dependencies
 */
function createController(): ReportController {
  const storagePath = path.join(process.cwd(), 'data', 'uploads');
  const fileStorage = new LocalFileStorage(storagePath);
  const reportRepository = new TypeORMReportRepository(AppDataSource);
  const patientRepository = new TypeORMPatientRepository(AppDataSource);
  const reportService = new ReportService(reportRepository, patientRepository, fileStorage);
  return new ReportController(reportService);
}

const router = Router();
const controller = createController();

// Report routes
router.post(
  '/patients/:patientId/reports',
  upload.single('file'),
  validateBody(UploadReportDto),
  asyncHandler(async (req, res) => controller.upload(req, res))
);

router.get(
  '/patients/:patientId/reports',
  asyncHandler(async (req, res) => controller.listByPatient(req, res))
);

router.get(
  '/reports/:id',
  asyncHandler(async (req, res) => controller.getById(req, res))
);

router.get(
  '/reports/:id/file',
  asyncHandler(async (req, res) => controller.downloadFile(req, res))
);

router.delete(
  '/reports/:id',
  asyncHandler(async (req, res) => controller.delete(req, res))
);

export default router;
