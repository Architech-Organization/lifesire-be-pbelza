/**
 * AnalysisEnginePort: Interface for medical report analysis operations
 * 
 * Defines contract for analyzing medical reports and extracting structured data.
 * Implementations: MockAnalysisEngine (pattern matching), OpenAI/Anthropic adapters (future)
 */

export interface LabValue {
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  flag?: 'high' | 'low' | 'normal';
}

export interface Diagnosis {
  code?: string;
  description: string;
  confidence: number;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

export interface Finding {
  category: string;
  description: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
}

export interface ExtractedData {
  labValues?: LabValue[];
  diagnoses?: Diagnosis[];
  medications?: Medication[];
  findings?: Finding[];
}

export interface TrendIndicators {
  improving: string[];
  declining: string[];
  stable: string[];
  recurring: string[];
}

export interface AnalysisResult {
  extractedData: ExtractedData;
  trendIndicators: TrendIndicators;
  confidenceScore: number;
  summaryText: string;
  completionStatus: 'complete' | 'partial' | 'failed';
  errorDetails?: string;
}

export interface AnalysisEnginePort {
  /**
   * Analyze medical report file
   * @param fileBuffer Raw file content
   * @param fileName Original filename (for format detection)
   * @param mimeType File MIME type
   * @returns Analysis results with confidence score and extracted data
   */
  analyze(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<AnalysisResult>;

  /**
   * Get engine type identifier
   */
  getEngineType(): string;
}
