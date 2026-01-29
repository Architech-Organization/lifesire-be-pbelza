import * as dotenv from 'dotenv';
import * as path from 'path';

/**
 * Config: Centralized configuration management
 * 
 * Loads environment variables from .env file and provides type-safe access.
 * Singleton pattern ensures single source of truth for configuration.
 */
export class Config {
  private static instance: Config;
  private config: Map<string, string>;

  private constructor() {
    // Load .env file
    dotenv.config({ path: path.resolve(process.cwd(), '.env') });
    
    // Store all env vars in map (filter out undefined values)
    this.config = new Map(
      Object.entries(process.env).filter(
        (entry): entry is [string, string] => entry[1] !== undefined
      )
    );
    
    // Validate required configuration
    this.validateRequired();
  }

  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  /**
   * Get configuration value
   */
  public get(key: string): string {
    return this.config.get(key) || '';
  }

  /**
   * Get configuration value with default
   */
  public getOrDefault(key: string, defaultValue: string): string {
    return this.config.get(key) || defaultValue;
  }

  /**
   * Get number configuration
   */
  public getNumber(key: string, defaultValue: number = 0): number {
    const value = this.get(key);
    return value ? parseInt(value, 10) : defaultValue;
  }

  /**
   * Get boolean configuration
   */
  public getBoolean(key: string, defaultValue: boolean = false): boolean {
    const value = this.get(key).toLowerCase();
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return defaultValue;
  }

  /**
   * Check if running in production
   */
  public isProduction(): boolean {
    return this.get('NODE_ENV') === 'production';
  }

  /**
   * Check if running in development
   */
  public isDevelopment(): boolean {
    return this.get('NODE_ENV') === 'development';
  }

  /**
   * Validate required configuration keys (T092)
   */
  private validateRequired(): void {
    const required = [
      'NODE_ENV',
      'PORT',
      'API_VERSION',
    ];

    // Database config required if not using SQLite in-memory
    const dbType = this.get('DB_TYPE');
    if (dbType === 'postgres') {
      required.push('POSTGRES_HOST', 'POSTGRES_PORT', 'POSTGRES_DB', 'POSTGRES_USER', 'POSTGRES_PASSWORD');
    }

    // Validate required keys exist
    const missing = required.filter(key => !this.config.has(key) || this.get(key) === '');
    
    if (missing.length > 0) {
      throw new Error(`Missing required configuration: ${missing.join(', ')}`);
    }

    // Validate PORT is a number
    const port = this.getNumber('PORT');
    if (isNaN(port) || port < 1 || port > 65535) {
      throw new Error('PORT must be a valid number between 1 and 65535');
    }

    // Validate UPLOAD_PATH is set
    if (!this.config.has('UPLOAD_PATH') || !this.get('UPLOAD_PATH')) {
      console.warn('UPLOAD_PATH not set, using default: ./data/uploads');
    }
  }
}
