import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateReportsTable1738074000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'reports',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'patient_id',
            type: 'uuid',
          },
          {
            name: 'report_date',
            type: 'date',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'file_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'file_reference',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'file_hash',
            type: 'varchar',
            length: '64',
          },
          {
            name: 'file_format',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'file_size',
            type: 'integer',
          },
          {
            name: 'upload_timestamp',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'datetime',
            isNullable: true,
          },
        ],
      }),
      true
    );

    // Foreign key to patients table
    await queryRunner.createForeignKey(
      'reports',
      new TableForeignKey({
        columnNames: ['patient_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'patients',
        onDelete: 'CASCADE',
      })
    );

    // Create indexes
    await queryRunner.createIndex(
      'reports',
      new TableIndex({
        name: 'idx_reports_patient',
        columnNames: ['patient_id'],
      })
    );

    await queryRunner.createIndex(
      'reports',
      new TableIndex({
        name: 'idx_reports_date',
        columnNames: ['report_date'],
      })
    );

    await queryRunner.createIndex(
      'reports',
      new TableIndex({
        name: 'idx_reports_hash',
        columnNames: ['file_hash'],
      })
    );

    await queryRunner.createIndex(
      'reports',
      new TableIndex({
        name: 'idx_reports_deleted',
        columnNames: ['deleted_at'],
      })
    );

    // Composite unique index for duplicate detection (patient + hash)
    await queryRunner.createIndex(
      'reports',
      new TableIndex({
        name: 'idx_reports_patient_hash',
        columnNames: ['patient_id', 'file_hash'],
        isUnique: true,
        where: 'deleted_at IS NULL',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('reports');
  }
}
