import { DataSource, IsNull } from 'typeorm';
import { Report } from '@domain/entities/Report';
import { FileReference } from '@domain/entities/FileReference';
import { ReportRepositoryPort } from '@domain/ports/ReportRepository';
import { ReportEntity } from '@infrastructure/persistence/entities/ReportEntity';

/**
 * TypeORMReportRepository: Production repository using TypeORM
 * 
 * Maps between domain Report and persistence ReportEntity.
 * Handles PostgreSQL/SQLite database operations.
 */
export class TypeORMReportRepository implements ReportRepositoryPort {
  constructor(private readonly dataSource: DataSource) {}

  async create(report: Report): Promise<Report> {
    const repository = this.dataSource.getRepository(ReportEntity);
    const entity = this.toEntity(report);
    const saved = await repository.save(entity);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Report | null> {
    const repository = this.dataSource.getRepository(ReportEntity);
    const entity = await repository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByPatient(patientId: string): Promise<Report[]> {
    const repository = this.dataSource.getRepository(ReportEntity);
    const entities = await repository.find({
      where: { patientId, deletedAt: IsNull() },
      order: { reportDate: 'DESC' },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async existsByHashAndPatient(fileHash: string, patientId: string): Promise<boolean> {
    const repository = this.dataSource.getRepository(ReportEntity);
    const count = await repository.count({
      where: { fileHash, patientId, deletedAt: IsNull() },
    });
    return count > 0;
  }

  async update(report: Report): Promise<Report> {
    const repository = this.dataSource.getRepository(ReportEntity);
    const entity = this.toEntity(report);
    const saved = await repository.save(entity);
    return this.toDomain(saved);
  }

  async softDelete(id: string): Promise<void> {
    const repository = this.dataSource.getRepository(ReportEntity);
    await repository.softDelete(id);
  }

  /**
   * Convert domain Report to persistence ReportEntity
   */
  private toEntity(report: Report): ReportEntity {
    const entity = new ReportEntity();
    entity.id = report.id;
    entity.patientId = report.patientId;
    entity.reportDate = report.reportDate;
    entity.description = report.description;
    entity.fileName = report.fileName;
    entity.fileReference = report.fileReference.path;
    entity.fileHash = report.fileHash;
    entity.fileFormat = report.fileFormat;
    entity.fileSize = report.fileSize;
    entity.uploadTimestamp = report.uploadTimestamp;
    entity.createdAt = report.createdAt;
    entity.updatedAt = report.updatedAt;
    entity.deletedAt = report.deletedAt;
    return entity;
  }

  /**
   * Convert persistence ReportEntity to domain Report
   */
  private toDomain(entity: ReportEntity): Report {
    // Ensure dates are Date objects (SQLite returns strings)
    const reportDate = typeof entity.reportDate === 'string'
      ? new Date(entity.reportDate)
      : entity.reportDate;
    const uploadTimestamp = typeof entity.uploadTimestamp === 'string'
      ? new Date(entity.uploadTimestamp)
      : entity.uploadTimestamp;
    const createdAt = typeof entity.createdAt === 'string'
      ? new Date(entity.createdAt)
      : entity.createdAt;
    const updatedAt = typeof entity.updatedAt === 'string'
      ? new Date(entity.updatedAt)
      : entity.updatedAt;
    const deletedAt = entity.deletedAt
      ? (typeof entity.deletedAt === 'string' ? new Date(entity.deletedAt) : entity.deletedAt)
      : null;

    return new Report(
      entity.id,
      entity.patientId,
      reportDate,
      entity.fileName,
      new FileReference(entity.fileReference),
      entity.fileHash,
      entity.fileFormat,
      entity.fileSize,
      uploadTimestamp,
      entity.description,
      createdAt,
      updatedAt,
      deletedAt
    );
  }
}
