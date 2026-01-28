import { Router, Request, Response } from 'express';
import { ClinicalNoteController } from '../controllers/ClinicalNoteController';
import { ClinicalNoteService } from '@domain/services/ClinicalNoteService';
import { TypeORMClinicalNoteRepository } from '@infrastructure/persistence/repositories/TypeORMClinicalNoteRepository';
import { TypeORMReportRepository } from '@infrastructure/persistence/repositories/TypeORMReportRepository';
import { getDataSourceSync } from '@infrastructure/config/database';
import { validateBody } from '../middleware/validation';
import { CreateNoteDto } from '../dto/CreateNoteDto';

const router = Router();

/**
 * Lazy controller initialization to ensure DataSource is ready
 */
let controllerInstance: ClinicalNoteController | null = null;

function getController(): ClinicalNoteController {
  if (!controllerInstance) {
    const dataSource = getDataSourceSync();
    const noteRepository = new TypeORMClinicalNoteRepository(dataSource);
    const reportRepository = new TypeORMReportRepository(dataSource);
    const noteService = new ClinicalNoteService(noteRepository, reportRepository);
    controllerInstance = new ClinicalNoteController(noteService);
  }
  
  return controllerInstance;
}

// POST /api/v1/reports/:id/notes - Create note on report
router.post('/reports/:id/notes', validateBody(CreateNoteDto), async (req: Request, res: Response) => {
  await getController().create(req, res);
});

// GET /api/v1/reports/:id/notes - List notes for report (newest first)
router.get('/reports/:id/notes', async (req: Request, res: Response) => {
  await getController().listByReport(req, res);
});

// DELETE /api/v1/notes/:id - Soft delete note
router.delete('/notes/:id', async (req: Request, res: Response) => {
  await getController().deleteNote(req, res);
});

export default router;
