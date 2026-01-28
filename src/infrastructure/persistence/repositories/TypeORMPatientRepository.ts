import { DataSource, IsNull, ILike } from 'typeorm';
import { Patient, ContactInfo } from '@domain/entities/Patient';
import { PatientRepositoryPort } from '@domain/ports/PatientRepository';
import { PatientEntity } from '@infrastructure/persistence/entities/PatientEntity';

/**
 * TypeORMPatientRepository: Production repository using TypeORM
 * 
 * Maps between domain Patient and persistence PatientEntity.
 * Handles PostgreSQL/SQLite database operations.
 */
export class TypeORMPatientRepository implements PatientRepositoryPort {
  constructor(private readonly dataSource: DataSource) {}

  async create(patient: Patient): Promise<Patient> {
    const repository = this.dataSource.getRepository(PatientEntity);
    const entity = this.toEntity(patient);
    const saved = await repository.save(entity);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Patient | null> {
    const repository = this.dataSource.getRepository(PatientEntity);
    const entity = await repository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByMRN(medicalRecordNumber: string): Promise<Patient | null> {
    const repository = this.dataSource.getRepository(PatientEntity);
    const entity = await repository.findOne({
      where: { medicalRecordNumber, deletedAt: IsNull() },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async search(nameQuery: string): Promise<Patient[]> {
    const repository = this.dataSource.getRepository(PatientEntity);
    const entities = await repository.find({
      where: {
        name: ILike(`%${nameQuery}%`),
        deletedAt: IsNull(),
      },
      order: { name: 'ASC' },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async findAll(): Promise<Patient[]> {
    const repository = this.dataSource.getRepository(PatientEntity);
    const entities = await repository.find({
      where: { deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async update(patient: Patient): Promise<Patient> {
    const repository = this.dataSource.getRepository(PatientEntity);
    const entity = this.toEntity(patient);
    const saved = await repository.save(entity);
    return this.toDomain(saved);
  }

  async softDelete(id: string): Promise<void> {
    const repository = this.dataSource.getRepository(PatientEntity);
    await repository.softDelete(id);
  }

  /**
   * Convert domain Patient to persistence PatientEntity
   */
  private toEntity(patient: Patient): PatientEntity {
    const entity = new PatientEntity();
    entity.id = patient.id;
    entity.medicalRecordNumber = patient.medicalRecordNumber;
    entity.name = patient.name;
    entity.dateOfBirth = patient.dateOfBirth;
    entity.email = patient.contactInfo?.email;
    entity.phone = patient.contactInfo?.phone;
    entity.createdAt = patient.createdAt;
    entity.updatedAt = patient.updatedAt;
    entity.deletedAt = patient.deletedAt;
    return entity;
  }

  /**
   * Convert persistence PatientEntity to domain Patient
   */
  private toDomain(entity: PatientEntity): Patient {
    const contactInfo: ContactInfo | undefined =
      entity.email || entity.phone
        ? {
            email: entity.email,
            phone: entity.phone,
          }
        : undefined;

    // Ensure dates are Date objects (SQLite returns strings)
    const dateOfBirth = typeof entity.dateOfBirth === 'string' 
      ? new Date(entity.dateOfBirth) 
      : entity.dateOfBirth;
    const createdAt = typeof entity.createdAt === 'string'
      ? new Date(entity.createdAt)
      : entity.createdAt;
    const updatedAt = typeof entity.updatedAt === 'string'
      ? new Date(entity.updatedAt)
      : entity.updatedAt;
    const deletedAt = entity.deletedAt
      ? (typeof entity.deletedAt === 'string' ? new Date(entity.deletedAt) : entity.deletedAt)
      : null;

    return new Patient(
      entity.id,
      entity.medicalRecordNumber,
      entity.name,
      dateOfBirth,
      contactInfo,
      createdAt,
      updatedAt,
      deletedAt
    );
  }
}
