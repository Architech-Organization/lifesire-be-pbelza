import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ReportEntity } from './ReportEntity';

/**
 * AnalysisEntity: TypeORM entity for analyses table
 * 
 * Persistence mapping for Analysis domain entity.
 * Stores structured JSON data for extracted findings and trends.
 */
@Entity('analyses')
@Index('idx_analyses_report', ['reportId'])
@Index('idx_analyses_method', ['analysisMethod'])
@Index('idx_analyses_status', ['completionStatus'])
@Index('idx_analyses_timestamp', ['analysisTimestamp'])
export class AnalysisEntity {
  @PrimaryColumn('varchar', { length: 36 })
  id!: string;

  @Column('varchar', { name: 'report_id', length: 36 })
  @Index('idx_analyses_report_unique', { unique: true })
  reportId!: string;

  @ManyToOne(() => ReportEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'report_id' })
  report?: ReportEntity;

  @Column('json', { name: 'extracted_data' })
  extractedData!: string; // JSON string in SQLite

  @Column('json', { name: 'trend_indicators' })
  trendIndicators!: string; // JSON string in SQLite

  @Column('real', { name: 'confidence_score' })
  confidenceScore!: number;

  @Column('text', { name: 'summary_text' })
  summaryText!: string;

  @Column('varchar', { name: 'analysis_method', length: 50 })
  analysisMethod!: string;

  @Column('varchar', { name: 'completion_status', length: 20 })
  completionStatus!: string;

  @Column('text', { name: 'error_details', nullable: true })
  errorDetails?: string;

  @Column('datetime', { name: 'analysis_timestamp' })
  analysisTimestamp!: Date;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt!: Date;
}
