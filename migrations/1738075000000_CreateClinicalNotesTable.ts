import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateClinicalNotesTable1738075000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create clinical_notes table
    await queryRunner.createTable(
      new Table({
        name: 'clinical_notes',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'report_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'content',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'author_identifier',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: "datetime('now')",
            isNullable: false,
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

    // Create foreign key to reports table with CASCADE delete
    await queryRunner.createForeignKey(
      'clinical_notes',
      new TableForeignKey({
        columnNames: ['report_id'],
        referencedTableName: 'reports',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      })
    );

    // Create index for report lookups (ordered by created_at DESC)
    await queryRunner.createIndex(
      'clinical_notes',
      new TableIndex({
        name: 'idx_notes_report',
        columnNames: ['report_id', 'created_at'],
      })
    );

    // Create index for soft delete queries
    await queryRunner.createIndex(
      'clinical_notes',
      new TableIndex({
        name: 'idx_notes_deleted',
        columnNames: ['deleted_at'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('clinical_notes', 'idx_notes_deleted');
    await queryRunner.dropIndex('clinical_notes', 'idx_notes_report');

    // Drop table (foreign key dropped automatically)
    await queryRunner.dropTable('clinical_notes');
  }
}
