/**
 * CSV Export Utilities
 * 
 * This module provides functionality for exporting user data to CSV format.
 * Uses papaparse for robust CSV generation with proper escaping and formatting.
 * 
 * Validates Requirements:
 * - 13.1: Provide "Export Users" button
 * - 13.2: Generate CSV file with filtered user data
 * - 13.3: Include required columns (user ID, name, email, role, status, registration date, last login date)
 * - 13.4: Trigger file download on completion
 * - 13.5: Respect current search and filter settings
 */

import Papa from 'papaparse';
import type { User } from '../api/users';

/**
 * CSV Export Column Configuration
 * Defines the columns to include in the CSV export
 */
export interface CsvColumn {
  /** Display header in CSV */
  header: string;
  /** Property key in User object */
  key: keyof User;
  /** Optional transform function to format the value */
  transform?: (value: unknown) => string;
}

/**
 * Default CSV columns for user export
 * Validates Requirement 13.3: Include all required columns
 */
export const DEFAULT_USER_EXPORT_COLUMNS: CsvColumn[] = [
  { header: 'User ID', key: 'id' },
  { header: 'Full Name', key: 'fullName' },
  { header: 'Email', key: 'email' },
  { header: 'Role', key: 'role' },
  { header: 'Status', key: 'status' },
  { 
    header: 'Registration Date', 
    key: 'registrationDate',
    transform: (value) => formatDate(value as string)
  },
  { 
    header: 'Last Login Date', 
    key: 'lastLoginDate',
    transform: (value) => value ? formatDate(value as string) : 'Never'
  },
];

/**
 * Format ISO date string to user-friendly format
 * @param isoDate - ISO 8601 date string
 * @returns Formatted date string (YYYY-MM-DD)
 */
function formatDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Convert user data to CSV format
 * 
 * Validates Requirement 13.2: Generate CSV with filtered data
 * Validates Requirement 13.3: Include all required columns
 * 
 * @param users - Array of user objects to export
 * @param columns - Column configuration (defaults to DEFAULT_USER_EXPORT_COLUMNS)
 * @returns CSV string
 * 
 * @example
 * ```typescript
 * const users = [
 *   { id: '1', fullName: 'John Doe', email: 'john@example.com', ... },
 * ];
 * const csv = convertUsersToCSV(users);
 * ```
 */
export function convertUsersToCSV(
  users: User[],
  columns: CsvColumn[] = DEFAULT_USER_EXPORT_COLUMNS
): string {
  // Transform user data to match column configuration
  const data = users.map((user) => {
    const row: Record<string, string> = {};
    
    columns.forEach((column) => {
      const value = user[column.key];
      row[column.header] = column.transform
        ? column.transform(value)
        : String(value ?? '');
    });
    
    return row;
  });

  // Use papaparse to generate CSV with proper escaping
  return Papa.unparse(data, {
    quotes: true, // Quote all fields to handle commas and special characters
    header: true, // Include header row
    skipEmptyLines: true,
  });
}

/**
 * Trigger browser download of CSV file
 * 
 * Validates Requirement 13.4: Trigger file download on completion
 * 
 * @param csvContent - CSV string content
 * @param filename - Desired filename (without extension)
 * 
 * @example
 * ```typescript
 * const csv = convertUsersToCSV(users);
 * triggerCsvDownload(csv, 'phelbo-users-2024-01-15');
 * ```
 */
export function triggerCsvDownload(csvContent: string, filename: string): void {
  // Create blob from CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create temporary download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  // Add to DOM, trigger click, and cleanup
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Release object URL to free memory
  URL.revokeObjectURL(url);
}

/**
 * Generate filename for user export
 * Format: phelbo-users-YYYY-MM-DD.csv
 * 
 * @returns Filename string (without .csv extension)
 * 
 * @example
 * ```typescript
 * const filename = generateExportFilename(); // "phelbo-users-2024-01-15"
 * ```
 */
export function generateExportFilename(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  
  return `phelbo-users-${year}-${month}-${day}`;
}

/**
 * Export users to CSV and trigger download
 * 
 * Validates Requirements: 13.2, 13.3, 13.4, 13.5
 * 
 * This is the main export function that combines all steps:
 * 1. Convert user data to CSV format
 * 2. Generate filename with current date
 * 3. Trigger browser download
 * 
 * @param users - Array of user objects to export (respects current filters)
 * @param columns - Optional custom column configuration
 * 
 * @example
 * ```typescript
 * const { data } = useUsers({ search: 'john', role: 'Admin' });
 * exportUsersToCSV(data.users); // Exports only filtered users
 * ```
 */
export function exportUsersToCSV(
  users: User[],
  columns?: CsvColumn[]
): void {
  const csvContent = convertUsersToCSV(users, columns);
  const filename = generateExportFilename();
  triggerCsvDownload(csvContent, filename);
}
