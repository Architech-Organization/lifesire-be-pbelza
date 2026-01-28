import { Analysis } from '@domain/entities/Analysis';
import { AnalysisRepositoryPort } from '@domain/ports/AnalysisRepository';

/**
 * InMemoryAnalysisRepository: Mock implementation for testing
 * 
 * Uses Map for in-memory storage.
 */
export class InMemoryAnalysisRepository implements AnalysisRepositoryPort {
  private analyses: Map<string, Analysis> = new Map();

  async create(analysis: Analysis): Promise<Analysis> {
    this.analyses.set(analysis.id, analysis);
    return analysis;
  }

  async findById(id: string): Promise<Analysis | null> {
    return this.analyses.get(id) || null;
  }

  async findByReport(reportId: string): Promise<Analysis | null> {
    for (const analysis of this.analyses.values()) {
      if (analysis.reportId === reportId) {
        return analysis;
      }
    }
    return null;
  }

  async findByPatient(patientId: string): Promise<Analysis[]> {
    // Note: Cannot directly query by patient without report references
    // This would need to be implemented with report repository
    return [];
  }

  async update(analysis: Analysis): Promise<Analysis> {
    this.analyses.set(analysis.id, analysis);
    return analysis;
  }

  async findAll(): Promise<Analysis[]> {
    return Array.from(this.analyses.values());
  }

  /**
   * Clear all analyses (test utility)
   */
  clear(): void {
    this.analyses.clear();
  }

  /**
   * Get count of stored analyses (test utility)
   */
  count(): number {
    return this.analyses.size;
  }
}
