import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { PatientEntity } from './PatientEntity';

/**
 * ReportEntity: TypeORM persistence entity for Report
 * 
 * Maps to 'reports' table in database.
 * Infrastructure layer - separate from domain entity.
 */
@Entity('reports')
export class ReportEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'patient_id', type: 'uuid' })
  @Index('idx_reports_patient')
  patientId!: string;

  @ManyToOne(() => PatientEntity)
  @JoinColumn({ name: 'patient_id' })
  patient?: PatientEntity;

  @Column({ name: 'report_date', type: 'date' })
  @Index('idx_reports_date')
  reportDate!: Date;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'file_name', type: 'varchar', length: 255 })
  fileName!: string;

  @Column({ name: 'file_reference', type: 'varchar', length: 500 })
  fileReference!: string;

  @Column({ name: 'file_hash', type: 'varchar', length: 64 })
  @Index('idx_reports_hash')
  fileHash!: string;

  @Column({ name: 'file_format', type: 'varchar', length: 100 })
  fileFormat!: string;

  @Column({ name: 'file_size', type: 'integer' })
  fileSize!: number;

  @Column({ name: 'upload_timestamp' })
  uploadTimestamp!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  @Index('idx_reports_deleted')
  deletedAt?: Date | null;
}
