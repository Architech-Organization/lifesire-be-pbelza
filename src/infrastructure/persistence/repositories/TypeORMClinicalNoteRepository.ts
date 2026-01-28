import { DataSource } from 'typeorm';
import { ClinicalNote } from '@domain/entities/ClinicalNote';
import { ClinicalNoteRepositoryPort } from '@domain/ports/ClinicalNoteRepository';
import { ClinicalNoteEntity } from '../entities/ClinicalNoteEntity';

/**
 * TypeORMClinicalNoteRepository: Production adapter using TypeORM
 * 
 * Implements clinical note persistence with PostgreSQL/SQLite database.
 */
export class TypeORMClinicalNoteRepository implements ClinicalNoteRepositoryPort {
  constructor(private readonly dataSource: DataSource) {}

  async create(note: ClinicalNote): Promise<ClinicalNote> {
    const repository = this.dataSource.getRepository(ClinicalNoteEntity);

    const entity = repository.create({
      id: note.id,
      report_id: note.reportId,
      content: note.content,
      author_identifier: note.authorIdentifier,
      created_at: note.createdAt,
      deleted_at: note.deletedAt,
    });

    await repository.save(entity);
    return this.toDomain(entity);
  }

  async findById(id: string): Promise<ClinicalNote | null> {
    const repository = this.dataSource.getRepository(ClinicalNoteEntity);
    const entity = await repository.findOne({
      where: { id },
    });

    return entity ? this.toDomain(entity) : null;
  }

  async findByReport(reportId: string): Promise<ClinicalNote[]> {
    const repository = this.dataSource.getRepository(ClinicalNoteEntity);
    const entities = await repository.find({
      where: { report_id: reportId },
      order: { created_at: 'DESC' },
    });

    return entities.map(entity => this.toDomain(entity));
  }

  async softDelete(id: string): Promise<void> {
    const repository = this.dataSource.getRepository(ClinicalNoteEntity);
    await repository.softDelete(id);
  }

  /**
   * Convert TypeORM entity to domain entity
   */
  private toDomain(entity: ClinicalNoteEntity): ClinicalNote {
    return new ClinicalNote(
      entity.id,
      entity.report_id,
      entity.content,
      entity.author_identifier,
      new Date(entity.created_at),
      entity.deleted_at ? new Date(entity.deleted_at) : null
    );
  }
}
