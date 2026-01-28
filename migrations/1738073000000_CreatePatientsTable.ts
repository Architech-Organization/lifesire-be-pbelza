import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreatePatientsTable1738073000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'patients',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'medical_record_number',
            type: 'varchar',
            length: '50',
            isUnique: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '200',
          },
          {
            name: 'date_of_birth',
            type: 'date',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true
    );

    // Create indexes
    await queryRunner.createIndex(
      'patients',
      new TableIndex({
        name: 'idx_patients_mrn',
        columnNames: ['medical_record_number'],
        isUnique: true,
      })
    );

    await queryRunner.createIndex(
      'patients',
      new TableIndex({
        name: 'idx_patients_deleted',
        columnNames: ['deleted_at'],
      })
    );

    await queryRunner.createIndex(
      'patients',
      new TableIndex({
        name: 'idx_patients_name',
        columnNames: ['name'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('patients');
  }
}
