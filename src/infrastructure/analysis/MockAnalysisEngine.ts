import { 
  AnalysisEnginePort,
  AnalysisResult,
  ExtractedData, 
  LabValue, 
  Diagnosis, 
  Medication, 
  Finding
} from '@domain/ports/AnalysisEnginePort';

/**
 * MockAnalysisEngine: Pattern-matching analysis engine for testing
 * 
 * Implements T056-T059: Pattern matching for lab, imaging, and pathology reports.
 * Uses regex patterns to extract structured data from medical report text.
 */
export class MockAnalysisEngine implements AnalysisEnginePort {
  getEngineType(): string {
    return 'mock';
  }

  async analyze(
    fileBuffer: Buffer,
    fileName: string,
    _mimeType: string
  ): Promise<AnalysisResult> {
    // Convert buffer to text (simplified - real implementation would use PDF/DOCX parsers)
    const text = fileBuffer.toString('utf-8');

    try {
      // Detect report type and extract accordingly
      const extractedData = this.extractData(text);
      
      // Generate summary
      const summaryText = this.generateSummary(extractedData, fileName);

      // Calculate confidence based on data extracted
      const confidence = this.calculateConfidence(extractedData);

      return {
        extractedData,
        trendIndicators: {},
        confidenceScore: confidence,
        summaryText,
        completionStatus: 'complete'
      };
    } catch (error: any) {
      // Return partial result on error per T061
      return {
        extractedData: { findings: [{ category: 'error', description: error.message }] },
        trendIndicators: {},
        confidenceScore: 0,
        summaryText: `Analysis failed: ${error.message}`,
        completionStatus: 'partial',
        errorDetails: error.message
      };
    }
  }

  /**
   * Extract structured data from report text
   * Implements T057, T058, T059
   */
  private extractData(text: string): ExtractedData {
    const data: ExtractedData = {
      labValues: [],
      diagnoses: [],
      medications: [],
      findings: [],
    };

    // T057: Lab report patterns (hemoglobin, glucose, cholesterol)
    data.labValues = this.extractLabValues(text);

    // T058: Imaging report patterns (findings, impressions)
    const imagingFindings = this.extractImagingFindings(text);
    data.findings?.push(...imagingFindings);

    // T059: Pathology report patterns (diagnoses, specimen info)
    const pathologyData = this.extractPathologyData(text);
    data.diagnoses?.push(...pathologyData.diagnoses);
    data.findings?.push(...pathologyData.findings);

    // General patterns: medications
    data.medications = this.extractMedications(text);

    return data;
  }

  /**
   * T057: Extract lab values (hemoglobin, glucose, cholesterol, etc.)
   */
  private extractLabValues(text: string): LabValue[] {
    const values: LabValue[] = [];

    // Hemoglobin patterns
    const hgbMatch = text.match(/(?:hemoglobin|hgb|hb)[:\s]+([0-9.]+)\s*(?:g\/dl)?/i);
    if (hgbMatch && hgbMatch[1]) {
      const value = parseFloat(hgbMatch[1]);
      values.push({
        name: 'Hemoglobin',
        value: hgbMatch[1],
        unit: 'g/dL',
        referenceRange: '13.5-17.5',
        flag: value < 13.5 ? 'low' : value > 17.5 ? 'high' : 'normal',
      });
    }

    // Glucose patterns
    const glucoseMatch = text.match(/(?:glucose|blood sugar)[:\s]+([0-9.]+)\s*(?:mg\/dl)?/i);
    if (glucoseMatch && glucoseMatch[1]) {
      const value = parseFloat(glucoseMatch[1]);
      values.push({
        name: 'Glucose',
        value: glucoseMatch[1],
        unit: 'mg/dL',
        referenceRange: '70-100',
        flag: value < 70 ? 'low' : value > 125 ? 'high' : 'normal',
      });
    }

    // Cholesterol patterns
    const cholMatch = text.match(/(?:cholesterol|total cholesterol)[:\s]+([0-9.]+)\s*(?:mg\/dl)?/i);
    if (cholMatch && cholMatch[1]) {
      const value = parseFloat(cholMatch[1]);
      values.push({
        name: 'Total Cholesterol',
        value: cholMatch[1],
        unit: 'mg/dL',
        referenceRange: '<200',
        flag: value < 200 ? 'normal' : value >= 200 ? 'high' : 'normal',
      });
    }

    // HDL cholesterol
    const hdlMatch = text.match(/hdl[:\s]+([0-9.]+)\s*(?:mg\/dl)?/i);
    if (hdlMatch && hdlMatch[1]) {
      const value = parseFloat(hdlMatch[1]);
      values.push({
        name: 'HDL Cholesterol',
        value: hdlMatch[1],
        unit: 'mg/dL',
        referenceRange: '>40',
        flag: value < 40 ? 'low' : 'normal',
      });
    }

    // LDL cholesterol
    const ldlMatch = text.match(/ldl[:\s]+([0-9.]+)\s*(?:mg\/dl)?/i);
    if (ldlMatch && ldlMatch[1]) {
      const value = parseFloat(ldlMatch[1]);
      values.push({
        name: 'LDL Cholesterol',
        value: ldlMatch[1],
        unit: 'mg/dL',
        referenceRange: '<100',
        flag: value < 100 ? 'normal' : 'high',
      });
    }

    // White blood cell count
    const wbcMatch = text.match(/(?:wbc|white blood cell)[:\s]+([0-9.]+)\s*(?:k\/ul)?/i);
    if (wbcMatch && wbcMatch[1]) {
      const value = parseFloat(wbcMatch[1]);
      values.push({
        name: 'WBC',
        value: wbcMatch[1],
        unit: 'K/uL',
        referenceRange: '4.5-11.0',
        flag: value < 4.5 ? 'low' : value > 11.0 ? 'high' : 'normal',
      });
    }

    return values;
  }

  /**
   * T058: Extract imaging findings (X-ray, CT, MRI)
   */
  private extractImagingFindings(text: string): Finding[] {
    const findings: Finding[] = [];

    // Check for imaging report keywords
    const isImaging = /(?:x-ray|ct scan|mri|ultrasound|imaging|radiology)/i.test(text);
    if (!isImaging) return findings;

    // Impression section
    const impressionMatch = text.match(/impression[:\s]+(.*?)(?:\n\n|$)/is);
    if (impressionMatch && impressionMatch[1]) {
      findings.push({
        category: 'Imaging Impression',
        description: impressionMatch[1].trim(),
        severity: this.detectSeverity(impressionMatch[1]),
      });
    }

    // Findings section
    const findingsMatch = text.match(/findings[:\s]+(.*?)(?:\n\n|impression|$)/is);
    if (findingsMatch && findingsMatch[1]) {
      findings.push({
        category: 'Imaging Findings',
        description: findingsMatch[1].trim(),
        severity: this.detectSeverity(findingsMatch[1]),
      });
    }

    // Specific patterns
    if (/fracture|broken|displaced/i.test(text)) {
      findings.push({
        category: 'Structural',
        description: 'Fracture detected',
        severity: 'high',
      });
    }

    if (/normal study|no acute findings|unremarkable/i.test(text)) {
      findings.push({
        category: 'General',
        description: 'Normal study with no acute findings',
        severity: 'low',
      });
    }

    if (/mass|lesion|tumor/i.test(text)) {
      findings.push({
        category: 'Structural',
        description: 'Mass or lesion identified',
        severity: 'high',
      });
    }

    return findings;
  }

  /**
   * T059: Extract pathology data (diagnoses, specimen info)
   */
  private extractPathologyData(text: string): { diagnoses: Diagnosis[]; findings: Finding[] } {
    const diagnoses: Diagnosis[] = [];
    const findings: Finding[] = [];

    // Check for pathology report keywords
    const isPathology = /(?:pathology|biopsy|histology|cytology|specimen)/i.test(text);
    if (!isPathology) return { diagnoses, findings };

    // Diagnosis patterns
    const diagnosisMatch = text.match(/diagnosis[:\s]+(.*?)(?:\n\n|$)/is);
    if (diagnosisMatch && diagnosisMatch[1]) {
      const diagnosisText = diagnosisMatch[1].trim();
      diagnoses.push({
        description: diagnosisText,
        confidence: 0.85,
      });
    }

    // Specimen info
    const specimenMatch = text.match(/specimen[:\s]+(.*?)(?:\n\n|$)/is);
    if (specimenMatch && specimenMatch[1]) {
      findings.push({
        category: 'Specimen',
        description: specimenMatch[1].trim(),
        severity: 'low',
      });
    }

    // Malignancy indicators
    if (/malignant|carcinoma|cancer|metastatic/i.test(text)) {
      diagnoses.push({
        description: 'Malignant findings',
        confidence: 0.9,
      });
      findings.push({
        category: 'Pathology',
        description: 'Malignant cells identified',
        severity: 'critical',
      });
    }

    // Benign indicators
    if (/benign|non-malignant|negative for malignancy/i.test(text)) {
      diagnoses.push({
        description: 'Benign findings',
        confidence: 0.95,
      });
      findings.push({
        category: 'Pathology',
        description: 'Benign tissue confirmed',
        severity: 'low',
      });
    }

    return { diagnoses, findings };
  }

  /**
   * Extract medication information
   */
  private extractMedications(text: string): Medication[] {
    const medications: Medication[] = [];

    // Common medication patterns
    const medPatterns = [
      /(?:aspirin|acetaminophen|ibuprofen|metformin|lisinopril|atorvastatin|levothyroxine)[\s]+([0-9]+\s*mg)?/gi,
    ];

    for (const pattern of medPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const parts = match[0].split(/\s+/);
        if (parts[0]) {
          medications.push({
            name: parts[0],
            dosage: match[1] || 'unknown',
            frequency: 'unknown',
          });
        }
      }
    }

    return medications;
  }

  /**
   * Detect severity from text content
   */
  private detectSeverity(text: string): 'low' | 'medium' | 'high' | 'critical' {
    const lowerText = text.toLowerCase();
    
    if (/critical|emergency|urgent|severe|malignant|cancer/i.test(lowerText)) {
      return 'critical';
    }
    if (/abnormal|elevated|decreased|fracture|mass|lesion/i.test(lowerText)) {
      return 'high';
    }
    if (/moderate|mild|borderline/i.test(lowerText)) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Generate human-readable summary
   */
  private generateSummary(data: ExtractedData, fileName: string): string {
    const parts: string[] = [];

    parts.push(`Analysis of ${fileName}:`);

    if (data.labValues && data.labValues.length > 0) {
      const abnormal = data.labValues.filter(l => l.flag !== 'normal');
      if (abnormal.length > 0) {
        parts.push(`\n${abnormal.length} abnormal lab value(s) detected.`);
      } else {
        parts.push(`\nAll ${data.labValues.length} lab values within normal range.`);
      }
    }

    if (data.diagnoses && data.diagnoses.length > 0) {
      parts.push(`\n${data.diagnoses.length} diagnosis/diagnoses identified.`);
    }

    if (data.medications && data.medications.length > 0) {
      parts.push(`\n${data.medications.length} medication(s) mentioned.`);
    }

    if (data.findings && data.findings.length > 0) {
      const critical = data.findings.filter(f => f.severity === 'critical');
      if (critical.length > 0) {
        parts.push(`\n⚠️ ${critical.length} critical finding(s) require immediate attention.`);
      }
    }

    return parts.join(' ');
  }

  /**
   * Calculate confidence score based on data extracted
   */
  private calculateConfidence(data: ExtractedData): number {
    let score = 0.5; // Base confidence

    // Increase confidence based on data extracted
    if (data.labValues && data.labValues.length > 0) score += 0.1;
    if (data.diagnoses && data.diagnoses.length > 0) score += 0.15;
    if (data.medications && data.medications.length > 0) score += 0.05;
    if (data.findings && data.findings.length > 0) score += 0.1;

    // Cap at 0.9 for mock engine
    return Math.min(score, 0.9);
  }
}
