/**
 * BaseEntity: Abstract base class for all domain entities
 * 
 * Provides common audit fields (createdAt, updatedAt, deletedAt) and 
 * enforces hexagonal architecture principles - no framework dependencies.
 */
export abstract class BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(
    id: string,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
    deletedAt: Date | null = null
  ) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
  }

  /**
   * Check if entity is soft-deleted
   */
  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  /**
   * Mark entity as soft-deleted
   */
  softDelete(): void {
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Update the updatedAt timestamp
   */
  markAsUpdated(): void {
    this.updatedAt = new Date();
  }
}
