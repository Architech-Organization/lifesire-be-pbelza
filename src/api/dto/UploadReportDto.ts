import { IsDateString, IsString, IsOptional, MaxLength } from 'class-validator';

/**
 * UploadReportDto: Request DTO for uploading reports
 * 
 * Validates multipart form data for report uploads.
 * File validation happens in middleware.
 */
export class UploadReportDto {
  @IsDateString({}, { message: 'Report date must be a valid date (YYYY-MM-DD)' })
  reportDate!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description?: string;
}
