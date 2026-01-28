import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { ValidationError } from './errorHandler';

/**
 * File upload middleware using Multer
 * 
 * Configures file upload with:
 * - 50MB size limit
 * - Allowed MIME types: PDF, DOCX, JPEG, PNG
 * - In-memory storage (buffer)
 */

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes

/**
 * File filter to validate MIME type
 */
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback
): void => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(
      new ValidationError(
        `Invalid file type. Allowed types: PDF, DOCX, JPEG, PNG. Received: ${file.mimetype}`
      )
    );
  }
};

/**
 * Multer configuration with memory storage
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
});

/**
 * Middleware for single file upload
 * Field name: 'file'
 */
export const uploadSingleFile = upload.single('file');

/**
 * Middleware for multiple file uploads (if needed in future)
 * Field name: 'files', max 10 files
 */
export const uploadMultipleFiles = upload.array('files', 10);
