import { IsOptional, IsDateString } from 'class-validator';

/**
 * SummaryQueryDto: Query parameters for patient summary endpoint
 * 
 * Validates optional date range filters.
 */
export class SummaryQueryDto {
  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid date (YYYY-MM-DD)' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid date (YYYY-MM-DD)' })
  endDate?: string;
}
