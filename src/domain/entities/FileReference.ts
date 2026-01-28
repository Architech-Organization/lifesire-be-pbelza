/**
 * FileReference: Value object for file storage references
 * 
 * Encapsulates file storage location.
 * Immutable value object per DDD principles.
 */
export class FileReference {
  private readonly _path: string;

  constructor(path: string) {
    if (!path || path.trim().length === 0) {
      throw new Error('File reference path cannot be empty');
    }
    this._path = path;
  }

  get path(): string {
    return this._path;
  }

  /**
   * Check equality with another FileReference
   */
  equals(other: FileReference): boolean {
    return this._path === other._path;
  }

  /**
   * Convert to string representation
   */
  toString(): string {
    return this._path;
  }
}
