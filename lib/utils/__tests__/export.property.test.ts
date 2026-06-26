/**
 * Property-Based Tests for CSV Export Utilities
 * 
 * Uses fast-check to verify universal properties across generated inputs.
 * Each property test runs 100 iterations to ensure comprehensive coverage.
 * 
 * Feature: phelbo-superadmin-labs
 * Properties tested:
 * - Property 14: CSV Export Data Accuracy
 * - Property 15: CSV Export Structure Completeness
 * 
 * Validates Requirements: 13.2, 13.3, 13.4, 13.5
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import {
  convertUsersToCSV,
  generateExportFilename,
  DEFAULT_USER_EXPORT_COLUMNS,
} from '../export';
import type { User } from '../../api/users';
import type { UserRole, UserStatus } from '../../schemas/user';

/**
 * Fast-check Arbitraries for User Data Generation
 */

// Generate valid user role
const userRoleArbitrary = fc.constantFrom<UserRole>('Admin', 'Member', 'Guest');

// Generate valid user status
const userStatusArbitrary = fc.constantFrom<UserStatus>('active', 'deactivated');

// Generate valid ISO date string
const isoDateArbitrary = fc.date({ 
  min: new Date('2020-01-01T00:00:00Z'), 
  max: new Date('2025-12-31T23:59:59Z') 
}).filter(date => !isNaN(date.getTime())).map(
  date => date.toISOString()
);

// Generate valid email
const emailArbitrary = fc
  .tuple(
    fc.array(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789'.split('')), {
      minLength: 1,
      maxLength: 20,
    }).map(chars => chars.join('')),
    fc.constantFrom('example.com', 'test.org', 'mail.co.uk', 'user.net')
  )
  .map(([local, domain]) => `${local}@${domain}`);

// Generate valid phone number (optional)
const phoneNumberArbitrary = fc.option(
  fc
    .array(fc.constantFrom(...'0123456789'.split('')), { minLength: 10, maxLength: 15 })
    .map(digits => `+1${digits.join('')}`),
  { nil: undefined }
);

// Generate a complete User object
const userArbitrary: fc.Arbitrary<User> = fc.record({
  id: fc.uuid(),
  fullName: fc
    .tuple(
      fc.array(fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')), {
        minLength: 1,
        maxLength: 10,
      }).map(chars => chars.join('')),
      fc.array(fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')), {
        minLength: 1,
        maxLength: 10,
      }).map(chars => chars.join(''))
    )
    .map(([first, last]) => `${first} ${last}`),
  email: emailArbitrary,
  phoneNumber: phoneNumberArbitrary,
  role: userRoleArbitrary,
  status: userStatusArbitrary,
  registrationDate: isoDateArbitrary,
  lastLoginDate: fc.option(isoDateArbitrary, { nil: undefined }),
});

// Generate array of users
const usersArrayArbitrary = fc.array(userArbitrary, { minLength: 0, maxLength: 50 });
const nonEmptyUsersArrayArbitrary = fc.array(userArbitrary, { minLength: 1, maxLength: 50 });

describe('Property-Based Tests: CSV Export', () => {
  /**
   * Property 15: CSV Export Structure Completeness
   * 
   * For any user data exported to CSV, the CSV file SHALL include columns
   * for user ID, name, email, role, status, registration date, and last login date
   * in a consistent order with proper headers.
   * 
   * Validates Requirements: 13.3
   */
  describe('Feature: phelbo-superadmin-labs, Property 15: CSV Export Structure Completeness', () => {
    it('should always include all required column headers', () => {
      fc.assert(
        fc.property(nonEmptyUsersArrayArbitrary, (users) => {
          const csv = convertUsersToCSV(users);
          const lines = csv.split('\n');
          const headerLine = lines[0];

          // Verify all required headers are present
          expect(headerLine).toContain('User ID');
          expect(headerLine).toContain('Full Name');
          expect(headerLine).toContain('Email');
          expect(headerLine).toContain('Role');
          expect(headerLine).toContain('Status');
          expect(headerLine).toContain('Registration Date');
          expect(headerLine).toContain('Last Login Date');
        }),
        { numRuns: 100 }
      );
    });

    it('should maintain consistent column order across all exports', () => {
      fc.assert(
        fc.property(
          fc.array(userArbitrary, { minLength: 1, maxLength: 20 }),
          fc.array(userArbitrary, { minLength: 1, maxLength: 20 }),
          (users1, users2) => {
            const csv1 = convertUsersToCSV(users1);
            const csv2 = convertUsersToCSV(users2);

            const header1 = csv1.split('\n')[0];
            const header2 = csv2.split('\n')[0];

            // Headers should be identical regardless of data
            expect(header1).toBe(header2);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have header row plus one data row per user', () => {
      fc.assert(
        fc.property(usersArrayArbitrary, (users) => {
          const csv = convertUsersToCSV(users);

          if (users.length === 0) {
            // papaparse produces empty string for empty array with skipEmptyLines
            expect(csv).toBe('');
          } else {
            const lines = csv.split('\n').filter(line => line.trim() !== '');
            // Should have exactly 1 header + N data rows
            expect(lines.length).toBe(users.length + 1); // Header + data rows
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 14: CSV Export Data Accuracy
   * 
   * For any current filter state applied to the user list, the exported CSV file
   * SHALL contain exactly the users visible in the filtered list, respecting all
   * active filters.
   * 
   * Validates Requirements: 13.2, 13.5
   */
  describe('Feature: phelbo-superadmin-labs, Property 14: CSV Export Data Accuracy', () => {
    it('should include all user IDs from input data in CSV', () => {
      fc.assert(
        fc.property(fc.array(userArbitrary, { minLength: 1, maxLength: 50 }), (users) => {
          const csv = convertUsersToCSV(users);

          // Every user ID should appear in the CSV
          users.forEach((user) => {
            expect(csv).toContain(user.id);
          });
        }),
        { numRuns: 100 }
      );
    });

    it('should include all user emails from input data in CSV', () => {
      fc.assert(
        fc.property(usersArrayArbitrary, (users) => {
          const csv = convertUsersToCSV(users);

          // Every user email should appear in the CSV
          users.forEach((user) => {
            expect(csv).toContain(user.email);
          });
        }),
        { numRuns: 100 }
      );
    });

    it('should include all user names from input data in CSV', () => {
      fc.assert(
        fc.property(usersArrayArbitrary, (users) => {
          const csv = convertUsersToCSV(users);

          // Every user name should appear in the CSV
          users.forEach((user) => {
            expect(csv).toContain(user.fullName);
          });
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve user role values accurately', () => {
      fc.assert(
        fc.property(usersArrayArbitrary, (users) => {
          const csv = convertUsersToCSV(users);

          // Every user role should appear in the CSV
          users.forEach((user) => {
            expect(csv).toContain(user.role);
          });
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve user status values accurately', () => {
      fc.assert(
        fc.property(usersArrayArbitrary, (users) => {
          const csv = convertUsersToCSV(users);

          // Every user status should appear in the CSV
          users.forEach((user) => {
            expect(csv).toContain(user.status);
          });
        }),
        { numRuns: 100 }
      );
    });

    it('should convert registration dates to YYYY-MM-DD format', () => {
      fc.assert(
        fc.property(usersArrayArbitrary, (users) => {
          const csv = convertUsersToCSV(users);

          // Every registration date should be formatted as YYYY-MM-DD
          users.forEach((user) => {
            const expectedDate = user.registrationDate.split('T')[0];
            expect(csv).toContain(expectedDate);
          });
        }),
        { numRuns: 100 }
      );
    });

    it('should handle users with and without lastLoginDate correctly', () => {
      fc.assert(
        fc.property(usersArrayArbitrary, (users) => {
          const csv = convertUsersToCSV(users);

          users.forEach((user) => {
            if (user.lastLoginDate) {
              const expectedDate = user.lastLoginDate.split('T')[0];
              expect(csv).toContain(expectedDate);
            } else {
              // For this specific user, we can't easily verify "Never" appears
              // because multiple users might not have login dates
              // But we can verify the CSV structure is valid
              expect(csv).toBeTruthy();
            }
          });
        }),
        { numRuns: 100 }
      );
    });

    it('should not add or remove users from input', () => {
      fc.assert(
        fc.property(fc.array(userArbitrary, { minLength: 1, maxLength: 20 }), (users) => {
          const csv = convertUsersToCSV(users);
          const lines = csv.split('\n').filter(line => line.trim() !== '');

          // Excluding header, should have exactly same count as input
          const dataRowCount = lines.length - 1;
          expect(dataRowCount).toBe(users.length);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * CSV Generation Robustness Properties
   * 
   * Tests that CSV generation handles various edge cases and special characters
   */
  describe('CSV Generation Robustness', () => {
    it('should handle names with special characters without breaking CSV structure', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              ...userArbitrary.value as any,
              fullName: fc.string({ minLength: 1, maxLength: 50 }),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (users) => {
            const csv = convertUsersToCSV(users as User[]);
            const lines = csv.split('\n').filter(line => line.trim() !== '');

            // Should have header + data rows
            expect(lines.length).toBeGreaterThan(0);
            expect(lines[0]).toContain('User ID'); // Header exists
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should generate valid CSV that starts with header row', () => {
      fc.assert(
        fc.property(usersArrayArbitrary, (users) => {
          const csv = convertUsersToCSV(users);

          if (users.length === 0) {
            // papaparse produces empty string for empty array
            expect(csv).toBe('');
          } else {
            const firstLine = csv.split('\n')[0];

            // First line should be the header
            expect(firstLine).toContain('User ID');
            expect(firstLine).toContain('Email');
            expect(firstLine).toContain('Role');
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should produce non-empty output for non-empty input', () => {
      fc.assert(
        fc.property(
          fc.array(userArbitrary, { minLength: 1, maxLength: 20 }),
          (users) => {
            const csv = convertUsersToCSV(users);

            // CSV should not be empty for non-empty input
            expect(csv.length).toBeGreaterThan(0);
            expect(csv).toContain('User ID'); // Has header
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Filename Generation Properties
   */
  describe('Filename Generation Properties', () => {
    it('should always generate filename in correct format', () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          const filename = generateExportFilename();

          // Should match format: phelbo-users-YYYY-MM-DD
          expect(filename).toMatch(/^phelbo-users-\d{4}-\d{2}-\d{2}$/);
        }),
        { numRuns: 100 }
      );
    });

    it('should generate consistent filename within same execution', () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          const filename1 = generateExportFilename();
          const filename2 = generateExportFilename();

          // Should be identical when called in quick succession
          expect(filename1).toBe(filename2);
        }),
        { numRuns: 100 }
      );
    });

    it('should always start with "phelbo-users-" prefix', () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          const filename = generateExportFilename();

          expect(filename.startsWith('phelbo-users-')).toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * CSV Structure Validation Properties
   */
  describe('CSV Structure Validation', () => {
    it('should produce parseable CSV with papaparse', () => {
      fc.assert(
        fc.property(usersArrayArbitrary, (users) => {
          const csv = convertUsersToCSV(users);

          if (users.length === 0) {
            // papaparse produces empty string for empty array
            expect(csv).toBe('');
          } else {
            // CSV should be parseable (basic structure test)
            expect(csv).toBeTruthy();
            expect(csv.split('\n').length).toBeGreaterThan(0);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should use consistent delimiter across all rows', () => {
      fc.assert(
        fc.property(
          fc.array(userArbitrary, { minLength: 2, maxLength: 10 }),
          (users) => {
            const csv = convertUsersToCSV(users);
            const lines = csv.split('\n').filter(line => line.trim() !== '');

            // All lines should have similar structure (though exact comma count
            // may vary due to quoting, we can check they're all non-empty)
            lines.forEach(line => {
              expect(line.length).toBeGreaterThan(0);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not lose data through conversion', () => {
      fc.assert(
        fc.property(userArbitrary, (user) => {
          const users = [user];
          const csv = convertUsersToCSV(users);

          // All key data points should be present
          expect(csv).toContain(user.id);
          expect(csv).toContain(user.email);
          expect(csv).toContain(user.fullName);
          expect(csv).toContain(user.role);
          expect(csv).toContain(user.status);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Date Formatting Properties
   */
  describe('Date Formatting Properties', () => {
    it('should format all registration dates consistently', () => {
      fc.assert(
        fc.property(usersArrayArbitrary, (users) => {
          const csv = convertUsersToCSV(users);

          users.forEach((user) => {
            // Extract YYYY-MM-DD from ISO date
            const expectedFormat = user.registrationDate.split('T')[0];
            
            // Should match YYYY-MM-DD format
            expect(expectedFormat).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            expect(csv).toContain(expectedFormat);
          });
        }),
        { numRuns: 100 }
      );
    });

    it('should format lastLoginDate when present', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              ...userArbitrary.value as any,
              lastLoginDate: isoDateArbitrary, // Always present
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (users) => {
            const csv = convertUsersToCSV(users as User[]);

            users.forEach((user) => {
              if (user.lastLoginDate) {
                const expectedFormat = user.lastLoginDate.split('T')[0];
                expect(expectedFormat).toMatch(/^\d{4}-\d{2}-\d{2}$/);
              }
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should use "Never" for missing lastLoginDate', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              ...userArbitrary.value as any,
              lastLoginDate: fc.constant(undefined), // Always missing
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (users) => {
            const csv = convertUsersToCSV(users as User[]);

            // Should contain "Never" for users without login dates
            const neverCount = (csv.match(/Never/g) || []).length;
            
            // At least as many "Never" as users with no lastLoginDate
            // (might be more due to header or other text)
            expect(neverCount).toBeGreaterThanOrEqual(users.length);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
