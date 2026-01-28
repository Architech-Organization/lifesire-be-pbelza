import { DataSource } from 'typeorm';
import { Analysis, ExtractedData, TrendIndicators } from '@domain/entities/Analysis';
import { AnalysisRepositoryPort } from '@domain/ports/AnalysisRepository';
import { AnalysisEntity } from '@infrastructure/persistence/entities/AnalysisEntity';

/**
 * TypeORMAnalysisRepository: Production implementation using TypeORM
 * 
 * Maps between domain Analysis and AnalysisEntity.
 * Handles JSON serialization for SQLite.
 */
export class TypeORMAnalysisRepository implements AnalysisRepositoryPort {
  constructor(private readonly dataSource: DataSource) {}

  async create(analysis: Analysis): Promise<Analysis> {
    const entity = this.toEntity(analysis);
    const saved = await this.dataSource.getRepository(AnalysisEntity).save(entity);
    return this.toDomain(saved);
  }

  async findByReport(reportId: string): Promise<Analysis | null> {
    const entity = await this.dataSource
      .getRepository(AnalysisEntity)
      .findOne({ where: { reportId } });
    
    return entity ? this.toDomain(entity) : null;
  }

  async findByPatient(patientId: string): Promise<Analysis[]> {
    // Query through reports table join
    const entities = await this.dataSource
      .getRepository(AnalysisEntity)
      .createQueryBuilder('analysis')
      .innerJoin('reports', 'report', 'analysis.report_id = report.id')
      .where('report.patient_id = :patientId', { patientId })
      .getMany();
    
    return entities.map(e => this.toDomain(e));
  }

  async update(analysis: Analysis): Promise<Analysis> {
    const entity = this.toEntity(analysis);
    const updated = await this.dataSource.getRepository(AnalysisEntity).save(entity);
    return this.toDomain(updated);
  }

  async findById(id: string): Promise<Analysis | null> {
    const entity = await this.dataSource
      .getRepository(AnalysisEntity)
      .findOne({ where: { id } });
    
    return entity ? this.toDomain(entity) : null;
  }

  async findByReportId(reportId: string): Promise<Analysis | null> {
    const entity = await this.dataSource
      .getRepository(AnalysisEntity)
      .findOne({ where: { reportId } });
    
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(): Promise<Analysis[]> {
    const entities = await this.dataSource
      .getRepository(AnalysisEntity)
      .find();
    
    return entities.map(e => this.toDomain(e));
  }

  /**
   * Convert domain entity to persistence entity
   */
  private toEntity(analysis: Analysis): AnalysisEntity {
    const entity = new AnalysisEntity();
    entity.id = analysis.id;
    entity.reportId = analysis.reportId;
    entity.extractedData = JSON.stringify(analysis.extractedData);
    entity.trendIndicators = JSON.stringify(analysis.trendIndicators);
    entity.confidenceScore = analysis.confidenceScore;
    entity.summaryText = analysis.summaryText;
    entity.analysisMethod = analysis.analysisMethod;
    entity.completionStatus = analysis.completionStatus;
    entity.errorDetails = analysis.errorDetails;
    entity.analysisTimestamp = analysis.analysisTimestamp;
    if (analysis.createdAt) entity.createdAt = analysis.createdAt;
    if (analysis.updatedAt) entity.updatedAt = analysis.updatedAt;
    return entity;
  }

  /**
   * Convert persistence entity to domain entity
   */
  private toDomain(entity: AnalysisEntity): Analysis {
    // Parse JSON strings (SQLite stores JSON as text)
    const extractedData: ExtractedData = typeof entity.extractedData === 'string'
      ? JSON.parse(entity.extractedData)
      : entity.extractedData;

    const trendIndicators: TrendIndicators = typeof entity.trendIndicators === 'string'
      ? JSON.parse(entity.trendIndicators)
      : entity.trendIndicators;

    // Handle date conversion for SQLite (stores as strings)
    const analysisTimestamp = typeof entity.analysisTimestamp === 'string'
      ? new Date(entity.analysisTimestamp)
      : entity.analysisTimestamp;

    const createdAt = typeof entity.createdAt === 'string'
      ? new Date(entity.createdAt)
      : entity.createdAt;

    const updatedAt = typeof entity.updatedAt === 'string'
      ? new Date(entity.updatedAt)
      : entity.updatedAt;

    return new Analysis(
      entity.id,
      entity.reportId,
      extractedData,
      trendIndicators,
      entity.confidenceScore,
      entity.summaryText,
      entity.analysisMethod as any,
      entity.completionStatus as any,
      analysisTimestamp,
      entity.errorDetails,
      createdAt,
      updatedAt
    );
  }
}
