import { IsString, IsDateString, IsEmail, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';

/**
 * CreatePatientDto: Request DTO for creating patients
 * 
 * Validates incoming HTTP request data using class-validator.
 */
export class CreatePatientDto {
  @IsString()
  @MinLength(3, { message: 'Medical record number must be at least 3 characters' })
  @MaxLength(50, { message: 'Medical record number must not exceed 50 characters' })
  @Matches(/^[a-zA-Z0-9]+$/, { message: 'Medical record number must be alphanumeric' })
  medicalRecordNumber!: string;

  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(200, { message: 'Name must not exceed 200 characters' })
  name!: string;

  @IsDateString({}, { message: 'Date of birth must be a valid date (YYYY-MM-DD)' })
  dateOfBirth!: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Phone must not exceed 50 characters' })
  phone?: string;
}
