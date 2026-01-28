#!/usr/bin/env node
/**
 * Simple test script to verify Phase 4 functionality
 * 
 * Tests report upload flow without needing the server
 */

const { Report } = require('../dist/domain/entities/Report');
const { FileReference } = require('../dist/domain/entities/FileReference');

console.log('=== Phase 4 Verification ===\n');

// Test 1: Report entity validation
console.log('Test 1: Report validation');
const testReport = new Report(
  '123e4567-e89b-12d3-a456-426614174000',
  '123e4567-e89b-12d3-a456-426614174001',
  new Date('2024-01-15'),
  'test_report.pdf',
  new FileReference('/path/to/file'),
  'a'.repeat(64), // valid 64-char hash
  'application/pdf',
  1024 * 1024, // 1MB
  new Date(),
  'Test report'
);

const errors = testReport.validate();
if (errors.length === 0) {
  console.log('✅ Report validation passed\n');
} else {
  console.log('❌ Report validation failed:', errors, '\n');
  process.exit(1);
}

// Test 2: FileReference value object
console.log('Test 2: FileReference value object');
const ref1 = new FileReference('/path/to/file1');
const ref2 = new FileReference('/path/to/file1');
const ref3 = new FileReference('/path/to/file2');

if (ref1.equals(ref2) && !ref1.equals(ref3)) {
  console.log('✅ FileReference equality works\n');
} else {
  console.log('❌ FileReference equality failed\n');
  process.exit(1);
}

// Test 3: Report validation catches invalid formats
console.log('Test 3: Invalid file format detection');
const invalidReport = new Report(
  '123e4567-e89b-12d3-a456-426614174000',
  '123e4567-e89b-12d3-a456-426614174001',
  new Date('2024-01-15'),
  'test.txt',
  new FileReference('/path/to/file'),
  'a'.repeat(64),
  'text/plain', // invalid format
  1024,
  new Date()
);

const invalidErrors = invalidReport.validate();
if (invalidErrors.some(e => e.includes('file format'))) {
  console.log('✅ Invalid format detected correctly\n');
} else {
  console.log('❌ Invalid format not detected\n');
  process.exit(1);
}

console.log('=== All Phase 4 Tests Passed ===');
process.exit(0);
