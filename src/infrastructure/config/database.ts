import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Config } from './Config';

/**
 * TypeORM DataSource configuration
 * 
 * Supports PostgreSQL (production) and SQLite (mock) based on DB_TYPE environment variable.
 * Uses path aliases for entities and migrations.
 */

export function createDataSourceConfig(): DataSourceOptions {
  const config = Config.getInstance();
  const dbType = config.get('DB_TYPE');

  if (dbType === 'sqlite') {
    return {
      type: 'better-sqlite3',
      database: config.get('SQLITE_DB_PATH') || ':memory:',
      synchronize: config.get('NODE_ENV') === 'development',
      logging: config.get('NODE_ENV') === 'development',
      entities: ['src/infrastructure/persistence/entities/**/*.ts'],
      migrations: ['migrations/**/*.ts'],
    };
  }

  // PostgreSQL configuration (default)
  return {
    type: 'postgres',
    host: config.get('POSTGRES_HOST'),
    port: parseInt(config.get('POSTGRES_PORT') || '5432', 10),
    username: config.get('POSTGRES_USER'),
    password: config.get('POSTGRES_PASSWORD'),
    database: config.get('POSTGRES_DB'),
    synchronize: config.get('NODE_ENV') === 'development',
    logging: config.get('NODE_ENV') === 'development',
    entities: ['src/infrastructure/persistence/entities/**/*.ts'],
    migrations: ['migrations/**/*.ts'],
  };
}

/**
 * Singleton DataSource instance
 */
let dataSourceInstance: DataSource | null = null;

export async function getDataSource(): Promise<DataSource> {
  if (!dataSourceInstance) {
    const config = createDataSourceConfig();
    dataSourceInstance = new DataSource(config);
    
    if (!dataSourceInstance.isInitialized) {
      await dataSourceInstance.initialize();
    }
  }

  return dataSourceInstance;
}

/**
 * Close DataSource connection (for graceful shutdown)
 */
export async function closeDataSource(): Promise<void> {
  if (dataSourceInstance?.isInitialized) {
    await dataSourceInstance.destroy();
    dataSourceInstance = null;
  }
}

/**
 * Export default DataSource for TypeORM CLI
 */
export const AppDataSource = new DataSource(createDataSourceConfig());
