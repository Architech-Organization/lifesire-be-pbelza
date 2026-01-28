import { FileStoragePort, FileMetadata, StoredFile } from '@domain/ports/FileStoragePort';
import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';

/**
 * LocalFileStorage: Filesystem-based file storage adapter
 * 
 * Stores files in local directory with SHA-256 hash-based naming.
 * Production adapter for local deployments.
 */
export class LocalFileStorage implements FileStoragePort {
  private readonly baseDir: string;

  constructor(baseDir: string = './data/uploads') {
    this.baseDir = path.resolve(baseDir);
  }

  async store(buffer: Buffer, metadata: FileMetadata): Promise<StoredFile> {
    // Calculate SHA-256 hash
    const hash = createHash('sha256');
    hash.update(buffer);
    const fileHash = hash.digest('hex');

    // Create subdirectory based on first 2 chars of hash (sharding)
    const subDir = fileHash.substring(0, 2);
    const targetDir = path.join(this.baseDir, subDir);

    // Ensure directory exists
    await fs.mkdir(targetDir, { recursive: true });

    // Generate file path with original extension
    const ext = path.extname(metadata.fileName);
    const fileName = `${fileHash}${ext}`;
    const filePath = path.join(targetDir, fileName);

    // Write file to disk
    await fs.writeFile(filePath, buffer);

    // Return relative reference
    const fileReference = path.join(subDir, fileName);

    return {
      fileReference,
      fileHash,
    };
  }

  async retrieve(fileReference: string): Promise<Buffer> {
    const filePath = path.join(this.baseDir, fileReference);

    try {
      return await fs.readFile(filePath);
    } catch (error) {
      throw new Error(`File not found: ${fileReference}`);
    }
  }

  async delete(fileReference: string): Promise<void> {
    const filePath = path.join(this.baseDir, fileReference);

    try {
      await fs.unlink(filePath);
    } catch (error) {
      throw new Error(`Failed to delete file: ${fileReference}`);
    }
  }

  async exists(fileReference: string): Promise<boolean> {
    const filePath = path.join(this.baseDir, fileReference);

    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
