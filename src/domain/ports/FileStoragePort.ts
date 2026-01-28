/**
 * FileStoragePort: Interface for file storage operations
 * 
 * Defines contract for storing and retrieving uploaded medical report files.
 * Implementations: MockFileStorage (in-memory), LocalFileStorage (filesystem)
 */

export interface FileMetadata {
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface StoredFile {
  fileReference: string;  // Storage path/identifier
  fileHash: string;       // SHA-256 hash for duplicate detection
}

export interface FileStoragePort {
  /**
   * Store uploaded file and calculate hash
   * @returns Storage reference and file hash
   */
  store(buffer: Buffer, metadata: FileMetadata): Promise<StoredFile>;

  /**
   * Retrieve file contents by storage reference
   */
  retrieve(fileReference: string): Promise<Buffer>;

  /**
   * Delete file from storage
   */
  delete(fileReference: string): Promise<void>;

  /**
   * Check if file exists in storage
   */
  exists(fileReference: string): Promise<boolean>;
}
