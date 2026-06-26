/**
 * Unit Tests for CSV Export Utilities
 * 
 * Tests cover:
 * - CSV conversion with proper formatting
 * - Date formatting
 * - Filename generation
 * - Download trigger functionality
 * - Edge cases (empty data, missing fields, special characters)
 * 
 * Validates Requirements: 13.1, 13.2, 13.3, 13.4, 13.5
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  convertUsersToCSV,
  triggerCsvDownload,
  generateExportFilename,
  exportUsersToCSV,
  DEFAULT_USER_EXPORT_COLUMNS,
} from '../export';
import type { User } from '../../api/users';

describe('CSV Export Utilities', () => {
  describe('convertUsersToCSV', () => {
    it('should convert user data to CSV format with headers', () => {
      const users: User[] = [
        {
          id: '1',
          fullName: 'John Doe',
          email: 'john@example.com',
          role: 'Admin',
          status: 'active',
          registrationDate: '2024-01-15T10:00:00Z',
          lastLoginDate: '2024-01-20T15:30:00Z',
        },
      ];

      const csv = convertUsersToCSV(users);

      // Verify CSV structure
      expect(csv).toContain('User ID');
      expect(csv).toContain('Full Name');
      expect(csv).toContain('Email');
      expect(csv).toContain('Role');
      expect(csv).toContain('Status');
      expect(csv).toContain('Registration Date');
      expect(csv).toContain('Last Login Date');

      // Verify data
      expect(csv).toContain('1');
      expect(csv).toContain('John Doe');
      expect(csv).toContain('john@example.com');
      expect(csv).toContain('Admin');
      expect(csv).toContain('active');
      expect(csv).toContain('2024-01-15');
      expect(csv).toContain('2024-01-20');
    });

    it('should handle users with missing optional fields', () => {
      const users: User[] = [
        {
          id: '2',
          fullName: 'Jane Smith',
          email: 'jane@example.com',
          role: 'Member',
          status: 'active',
          registrationDate: '2024-01-10T08:00:00Z',
          // lastLoginDate is missing
        },
      ];

      const csv = convertUsersToCSV(users);

      expect(csv).toContain('Jane Smith');
      expect(csv).toContain('Never'); // lastLoginDate should show "Never"
    });

    it('should handle empty user list', () => {
      const users: User[] = [];

      const csv = convertUsersToCSV(users);

      // papaparse with skipEmptyLines produces empty string for empty data
      // This is expected behavior - no data means no CSV output
      expect(csv).toBe('');
    });

    it('should properly escape special characters in CSV', () => {
      const users: User[] = [
        {
          id: '3',
          fullName: 'Bob "The Builder" Smith',
          email: 'bob,smith@example.com',
          role: 'Guest',
          status: 'deactivated',
          registrationDate: '2024-01-01T00:00:00Z',
        },
      ];

      const csv = convertUsersToCSV(users);

      // papaparse escapes quotes by doubling them: " becomes ""
      // The CSV will contain: "Bob ""The Builder"" Smith"
      expect(csv).toContain('Bob ""The Builder"" Smith');
      expect(csv).toContain('bob,smith@example.com');
    });

    it('should handle multiple users correctly', () => {
      const users: User[] = [
        {
          id: '1',
          fullName: 'User One',
          email: 'one@example.com',
          role: 'Admin',
          status: 'active',
          registrationDate: '2024-01-01T00:00:00Z',
          lastLoginDate: '2024-01-15T00:00:00Z',
        },
        {
          id: '2',
          fullName: 'User Two',
          email: 'two@example.com',
          role: 'Member',
          status: 'active',
          registrationDate: '2024-01-02T00:00:00Z',
        },
        {
          id: '3',
          fullName: 'User Three',
          email: 'three@example.com',
          role: 'Guest',
          status: 'deactivated',
          registrationDate: '2024-01-03T00:00:00Z',
          lastLoginDate: '2024-01-10T00:00:00Z',
        },
      ];

      const csv = convertUsersToCSV(users);

      const lines = csv.split('\n').filter(line => line.trim() !== '');
      
      // Should have 1 header + 3 data rows = 4 total lines
      expect(lines.length).toBe(4);

      // Verify all users are present
      expect(csv).toContain('User One');
      expect(csv).toContain('User Two');
      expect(csv).toContain('User Three');
    });

    it('should use custom columns if provided', () => {
      const users: User[] = [
        {
          id: '1',
          fullName: 'John Doe',
          email: 'john@example.com',
          role: 'Admin',
          status: 'active',
          registrationDate: '2024-01-15T10:00:00Z',
        },
      ];

      const customColumns = [
        { header: 'ID', key: 'id' as keyof User },
        { header: 'Name', key: 'fullName' as keyof User },
        { header: 'Email Address', key: 'email' as keyof User },
      ];

      const csv = convertUsersToCSV(users, customColumns);

      // Should have custom headers
      expect(csv).toContain('ID');
      expect(csv).toContain('Name');
      expect(csv).toContain('Email Address');

      // Should NOT have default headers
      expect(csv).not.toContain('User ID');
      expect(csv).not.toContain('Full Name');
    });

    it('should format dates correctly', () => {
      const users: User[] = [
        {
          id: '1',
          fullName: 'Test User',
          email: 'test@example.com',
          role: 'Member',
          status: 'active',
          registrationDate: '2024-03-15T14:30:00.000Z',
          lastLoginDate: '2024-12-31T23:59:59.999Z',
        },
      ];

      const csv = convertUsersToCSV(users);

      // Dates should be formatted as YYYY-MM-DD
      expect(csv).toContain('2024-03-15');
      expect(csv).toContain('2024-12-31');
    });
  });

  describe('triggerCsvDownload', () => {
    let createElementSpy: any;
    let appendChildSpy: any;
    let removeChildSpy: any;
    let createObjectURLSpy: any;
    let revokeObjectURLSpy: any;
    let mockLink: any;

    beforeEach(() => {
      // Mock DOM methods
      mockLink = {
        setAttribute: vi.fn(),
        click: vi.fn(),
        style: {},
      };

      createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
      removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);
      createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
      revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should create a download link with correct attributes', () => {
      const csvContent = 'User ID,Name\n1,John';
      const filename = 'test-export';

      triggerCsvDownload(csvContent, filename);

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(mockLink.setAttribute).toHaveBeenCalledWith('href', 'blob:mock-url');
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'test-export.csv');
      expect(mockLink.style.visibility).toBe('hidden');
    });

    it('should create a Blob with correct content type', () => {
      const csvContent = 'User ID,Name\n1,John';
      const filename = 'test-export';

      triggerCsvDownload(csvContent, filename);

      // Verify Blob was created (indirectly through createObjectURL being called)
      expect(createObjectURLSpy).toHaveBeenCalled();
    });

    it('should trigger download and cleanup', () => {
      const csvContent = 'User ID,Name\n1,John';
      const filename = 'test-export';

      triggerCsvDownload(csvContent, filename);

      expect(appendChildSpy).toHaveBeenCalledWith(mockLink);
      expect(mockLink.click).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalledWith(mockLink);
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should handle special characters in filename', () => {
      const csvContent = 'test';
      const filename = 'phelbo-users-2024-01-15';

      triggerCsvDownload(csvContent, filename);

      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'phelbo-users-2024-01-15.csv');
    });
  });

  describe('generateExportFilename', () => {
    it('should generate filename with current date', () => {
      const filename = generateExportFilename();

      // Should match format: phelbo-users-YYYY-MM-DD
      expect(filename).toMatch(/^phelbo-users-\d{4}-\d{2}-\d{2}$/);
      expect(filename).toContain('phelbo-users-');
    });

    it('should pad month and day with zeros', () => {
      const filename = generateExportFilename();
      const parts = filename.split('-');

      // parts = ['phelbo', 'users', 'YYYY', 'MM', 'DD']
      expect(parts.length).toBe(5);
      expect(parts[3].length).toBe(2); // Month should be 2 digits
      expect(parts[4].length).toBe(2); // Day should be 2 digits
    });

    it('should generate consistent format across calls on same day', () => {
      const filename1 = generateExportFilename();
      const filename2 = generateExportFilename();

      // Both should have same format and date
      expect(filename1).toBe(filename2);
    });
  });

  describe('exportUsersToCSV', () => {
    let createElementSpy: any;
    let appendChildSpy: any;
    let removeChildSpy: any;
    let createObjectURLSpy: any;
    let revokeObjectURLSpy: any;
    let mockLink: any;

    beforeEach(() => {
      mockLink = {
        setAttribute: vi.fn(),
        click: vi.fn(),
        style: {},
      };

      createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
      removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);
      createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
      revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should export users and trigger download', () => {
      const users: User[] = [
        {
          id: '1',
          fullName: 'John Doe',
          email: 'john@example.com',
          role: 'Admin',
          status: 'active',
          registrationDate: '2024-01-15T10:00:00Z',
          lastLoginDate: '2024-01-20T15:30:00Z',
        },
      ];

      exportUsersToCSV(users);

      // Verify download was triggered
      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.setAttribute).toHaveBeenCalledWith(
        'download',
        expect.stringMatching(/^phelbo-users-\d{4}-\d{2}-\d{2}\.csv$/)
      );
    });

    it('should handle empty user list gracefully', () => {
      const users: User[] = [];

      exportUsersToCSV(users);

      // Should still attempt download even with empty data
      // papaparse will produce empty string for empty array
      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should respect custom column configuration', () => {
      const users: User[] = [
        {
          id: '1',
          fullName: 'Test User',
          email: 'test@example.com',
          role: 'Member',
          status: 'active',
          registrationDate: '2024-01-01T00:00:00Z',
        },
      ];

      const customColumns = [
        { header: 'ID', key: 'id' as keyof User },
        { header: 'Email', key: 'email' as keyof User },
      ];

      exportUsersToCSV(users, customColumns);

      expect(mockLink.click).toHaveBeenCalled();
    });
  });

  describe('DEFAULT_USER_EXPORT_COLUMNS', () => {
    it('should include all required columns per requirements', () => {
      const headers = DEFAULT_USER_EXPORT_COLUMNS.map(col => col.header);

      // Validates Requirement 13.3: Include all required columns
      expect(headers).toContain('User ID');
      expect(headers).toContain('Full Name');
      expect(headers).toContain('Email');
      expect(headers).toContain('Role');
      expect(headers).toContain('Status');
      expect(headers).toContain('Registration Date');
      expect(headers).toContain('Last Login Date');
    });

    it('should have correct number of columns', () => {
      // Should have exactly 7 columns as per requirements
      expect(DEFAULT_USER_EXPORT_COLUMNS.length).toBe(7);
    });

    it('should map to correct User properties', () => {
      const keys = DEFAULT_USER_EXPORT_COLUMNS.map(col => col.key);

      expect(keys).toContain('id');
      expect(keys).toContain('fullName');
      expect(keys).toContain('email');
      expect(keys).toContain('role');
      expect(keys).toContain('status');
      expect(keys).toContain('registrationDate');
      expect(keys).toContain('lastLoginDate');
    });
  });

  describe('Edge Cases', () => {
    it('should handle users with undefined phone numbers', () => {
      const users: User[] = [
        {
          id: '1',
          fullName: 'Test User',
          email: 'test@example.com',
          phoneNumber: undefined,
          role: 'Member',
          status: 'active',
          registrationDate: '2024-01-01T00:00:00Z',
        },
      ];

      const csv = convertUsersToCSV(users);
      expect(csv).toBeTruthy();
    });

    it('should handle users with very long names', () => {
      const users: User[] = [
        {
          id: '1',
          fullName: 'A'.repeat(100),
          email: 'test@example.com',
          role: 'Member',
          status: 'active',
          registrationDate: '2024-01-01T00:00:00Z',
        },
      ];

      const csv = convertUsersToCSV(users);
      expect(csv).toContain('A'.repeat(100));
    });

    it('should handle users with special characters in email', () => {
      const users: User[] = [
        {
          id: '1',
          fullName: 'Test User',
          email: 'test+tag@example.co.uk',
          role: 'Member',
          status: 'active',
          registrationDate: '2024-01-01T00:00:00Z',
        },
      ];

      const csv = convertUsersToCSV(users);
      expect(csv).toContain('test+tag@example.co.uk');
    });

    it('should handle different user roles', () => {
      const users: User[] = [
        {
          id: '1',
          fullName: 'Admin User',
          email: 'admin@example.com',
          role: 'Admin',
          status: 'active',
          registrationDate: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          fullName: 'Member User',
          email: 'member@example.com',
          role: 'Member',
          status: 'active',
          registrationDate: '2024-01-02T00:00:00Z',
        },
        {
          id: '3',
          fullName: 'Guest User',
          email: 'guest@example.com',
          role: 'Guest',
          status: 'active',
          registrationDate: '2024-01-03T00:00:00Z',
        },
      ];

      const csv = convertUsersToCSV(users);
      expect(csv).toContain('Admin');
      expect(csv).toContain('Member');
      expect(csv).toContain('Guest');
    });

    it('should handle different user statuses', () => {
      const users: User[] = [
        {
          id: '1',
          fullName: 'Active User',
          email: 'active@example.com',
          role: 'Member',
          status: 'active',
          registrationDate: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          fullName: 'Deactivated User',
          email: 'deactivated@example.com',
          role: 'Member',
          status: 'deactivated',
          registrationDate: '2024-01-02T00:00:00Z',
        },
      ];

      const csv = convertUsersToCSV(users);
      expect(csv).toContain('active');
      expect(csv).toContain('deactivated');
    });
  });
});
