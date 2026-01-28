import { Entity, Column, PrimaryColumn, CreateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ReportEntity } from './ReportEntity';

/**
 * ClinicalNoteEntity: TypeORM entity for clinical_notes table
 * 
 * Represents clinician-added annotations on reports with soft delete support.
 */
@Entity('clinical_notes')
export class ClinicalNoteEntity {
  @PrimaryColumn('varchar', { length: 36 })
  id!: string;

  @Column('varchar', { length: 36, name: 'report_id' })
  report_id!: string;

  @Column('text')
  content!: string;

  @Column('varchar', { length: 100, name: 'author_identifier' })
  author_identifier!: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deleted_at!: Date | null;

  // Relationship (not loaded by default)
  @ManyToOne(() => ReportEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'report_id' })
  report?: ReportEntity;
}
