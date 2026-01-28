import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Migration: Create analyses table
 * 
 * Stores automated analysis results for medical reports with structured findings.
 */
export class CreateAnalysesTable1738074100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create analyses table
    await queryRunner.createTable(
      new Table({
        name: 'analyses',
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
            name: 'extracted_data',
            type: 'json',
            isNullable: false,
          },
          {
            name: 'trend_indicators',
            type: 'json',
            isNullable: false,
          },
          {
            name: 'confidence_score',
            type: 'real',
            isNullable: false,
          },
          {
            name: 'summary_text',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'analysis_method',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'completion_status',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'error_details',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'analysis_timestamp',
            type: 'datetime',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: "datetime('now')",
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'datetime',
            default: "datetime('now')",
            isNullable: false,
          },
        ],
      }),
      true
    );

    // Create foreign key to reports
    await queryRunner.createForeignKey(
      'analyses',
      new TableForeignKey({
        name: 'fk_analyses_report',
        columnNames: ['report_id'],
        referencedTableName: 'reports',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      })
    );

    // Create indexes
    await queryRunner.createIndex(
      'analyses',
      new TableIndex({
        name: 'idx_analyses_report',
        columnNames: ['report_id'],
      })
    );

    await queryRunner.createIndex(
      'analyses',
      new TableIndex({
        name: 'idx_analyses_report_unique',
        columnNames: ['report_id'],
        isUnique: true,
      })
    );

    await queryRunner.createIndex(
      'analyses',
      new TableIndex({
        name: 'idx_analyses_method',
        columnNames: ['analysis_method'],
      })
    );

    await queryRunner.createIndex(
      'analyses',
      new TableIndex({
        name: 'idx_analyses_status',
        columnNames: ['completion_status'],
      })
    );

    await queryRunner.createIndex(
      'analyses',
      new TableIndex({
        name: 'idx_analyses_timestamp',
        columnNames: ['analysis_timestamp'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('analyses', 'idx_analyses_timestamp');
    await queryRunner.dropIndex('analyses', 'idx_analyses_status');
    await queryRunner.dropIndex('analyses', 'idx_analyses_method');
    await queryRunner.dropIndex('analyses', 'idx_analyses_report_unique');
    await queryRunner.dropIndex('analyses', 'idx_analyses_report');

    // Drop foreign key
    await queryRunner.dropForeignKey('analyses', 'fk_analyses_report');

    // Drop table
    await queryRunner.dropTable('analyses');
  }
}
