import { IsString, IsNotEmpty, Length } from 'class-validator';

/**
 * CreateNoteDto: Validation for creating clinical notes
 */
export class CreateNoteDto {
  @IsString()
  @IsNotEmpty({ message: 'Note content is required' })
  @Length(1, 10000, { message: 'Note content must be 1-10000 characters' })
  content!: string;

  @IsString()
  @IsNotEmpty({ message: 'Author identifier is required' })
  @Length(1, 100, { message: 'Author identifier must be 1-100 characters' })
  authorIdentifier!: string;
}
