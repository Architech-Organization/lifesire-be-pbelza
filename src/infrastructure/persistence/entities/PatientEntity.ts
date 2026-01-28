import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index } from 'typeorm';

/**
 * PatientEntity: TypeORM persistence entity for Patient
 * 
 * Maps to 'patients' table in database.
 * Infrastructure layer - separate from domain entity.
 */
@Entity('patients')
export class PatientEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'medical_record_number', type: 'varchar', length: 50, unique: true })
  @Index('idx_patients_mrn', { unique: true })
  medicalRecordNumber!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ name: 'date_of_birth', type: 'date' })
  dateOfBirth!: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  @Index('idx_patients_deleted')
  deletedAt?: Date | null;
}
