import { Request, Response } from 'express';
import { ClinicalNoteService } from '@domain/services/ClinicalNoteService';
import { ClinicalNoteResponseDto } from '../dto/ClinicalNoteResponseDto';
import { NotFoundError } from '../middleware/errorHandler';

/**
 * ClinicalNoteController: HTTP handlers for clinical note endpoints
 * 
 * Handles creating, listing, and deleting clinical notes on reports.
 */
export class ClinicalNoteController {
  constructor(private readonly noteService: ClinicalNoteService) {}

  /**
   * POST /reports/:id/notes
   * Create a new note on a report
   */
  create = async (req: Request, res: Response): Promise<void> => {
    const reportId = req.params['id'];
    if (!reportId) {
      throw new NotFoundError('Report ID is required');
    }

    const { content, authorIdentifier } = req.body;

    const note = await this.noteService.create(reportId, content, authorIdentifier);

    res.status(201).json({
      data: new ClinicalNoteResponseDto(note),
    });
  };

  /**
   * GET /reports/:id/notes
   * List all notes for a report (newest first)
   */
  listByReport = async (req: Request, res: Response): Promise<void> => {
    const reportId = req.params['id'];
    if (!reportId) {
      throw new NotFoundError('Report ID is required');
    }

    const notes = await this.noteService.findByReport(reportId);

    res.status(200).json({
      data: notes.map(note => new ClinicalNoteResponseDto(note)),
    });
  };

  /**
   * DELETE /notes/:id
   * Soft delete a clinical note
   */
  deleteNote = async (req: Request, res: Response): Promise<void> => {
    const noteId = req.params['id'];
    if (!noteId) {
      throw new NotFoundError('Note ID is required');
    }

    await this.noteService.softDelete(noteId);

    res.status(204).send();
  };
}
