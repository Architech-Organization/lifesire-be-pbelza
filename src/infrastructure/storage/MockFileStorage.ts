import { FileStoragePort, FileMetadata, StoredFile } from '@domain/ports/FileStoragePort';
import { createHash } from 'crypto';

/**
 * MockFileStorage: In-memory file storage adapter
 * 
 * Stores files in memory using Map<fileReference, Buffer>.
 * Useful for development and testing without filesystem.
 */
export class MockFileStorage implements FileStoragePort {
  private storage: Map<string, Buffer> = new Map();
  private nextId: number = 1;

  async store(buffer: Buffer, metadata: FileMetadata): Promise<StoredFile> {
    // Calculate SHA-256 hash
    const hash = createHash('sha256');
    hash.update(buffer);
    const fileHash = hash.digest('hex');

    // Generate storage reference
    const fileReference = `mock://${this.nextId++}/${metadata.fileName}`;

    // Store in memory
    this.storage.set(fileReference, buffer);

    return {
      fileReference,
      fileHash,
    };
  }

  async retrieve(fileReference: string): Promise<Buffer> {
    const buffer = this.storage.get(fileReference);
    if (!buffer) {
      throw new Error(`File not found: ${fileReference}`);
    }
    return buffer;
  }

  async delete(fileReference: string): Promise<void> {
    if (!this.storage.has(fileReference)) {
      throw new Error(`File not found: ${fileReference}`);
    }
    this.storage.delete(fileReference);
  }

  async exists(fileReference: string): Promise<boolean> {
    return this.storage.has(fileReference);
  }

  /**
   * Clear all stored files (test utility)
   */
  clear(): void {
    this.storage.clear();
    this.nextId = 1;
  }

  /**
   * Get storage size in bytes (test utility)
   */
  getStorageSize(): number {
    let total = 0;
    for (const buffer of this.storage.values()) {
      total += buffer.length;
    }
    return total;
  }
}
