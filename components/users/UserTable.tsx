'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { UserRole, UserStatus } from '@/lib/schemas/user';

/**
 * User data structure matching the design specification
 * Represents a Phelbo platform user for display in the table
 */
export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: UserRole;
  status: UserStatus;
  registrationDate: string;
  lastLoginDate?: string;
}

/**
 * Props for the UserTable component
 */
export interface UserTableProps {
  /** Array of users to display in the table */
  users: User[];
  /** Callback when a user row is clicked to view details */
  onUserClick?: (userId: string) => void;
  /** Callback when the view action is clicked */
  onView?: (userId: string) => void;
  /** Callback when the edit action is clicked */
  onEdit?: (userId: string) => void;
  /** Callback when the delete action is clicked */
  onDelete?: (userId: string) => void;
  /** Whether the table is in a loading state */
  isLoading?: boolean;
}

/**
 * UserTable Component
 * 
 * Displays a list of Phelbo users in a table format with actions for view, edit, and delete.
 * Uses shadcn/ui Table components for consistent styling.
 * 
 * Features:
 * - Displays user information: name, email, role, status, registration date
 * - Row click navigation to user details
 * - Action buttons for view, edit, delete
 * - Responsive design with proper spacing
 * - Loading state support
 * - Empty state handling
 * 
 * Validates Requirements:
 * - 2.1: Display table of users with columns for name, email, role, status, and registration date
 * - 4.1: Support clicking on user row for detailed view
 * - 6.1: Provide edit button for user modification
 * 
 * @example
 * ```tsx
 * <UserTable
 *   users={users}
 *   onUserClick={(id) => router.push(`/users/${id}`)}
 *   onEdit={(id) => openEditModal(id)}
 *   onDelete={(id) => handleDelete(id)}
 * />
 * ```
 */
export function UserTable({
  users,
  onUserClick,
  onView,
  onEdit,
  onDelete,
  isLoading = false,
}: UserTableProps) {
  /**
   * Format date string to a human-readable format
   * @param dateString - ISO 8601 date string
   * @returns Formatted date string (e.g., "Jan 15, 2024")
   */
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  /**
   * Get badge styling based on user status
   * @param status - User account status
   * @returns CSS classes for status badge
   */
  const getStatusBadgeClass = (status: UserStatus): string => {
    return status === 'active'
      ? 'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700'
      : 'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700';
  };

  /**
   * Get badge styling based on user role
   * @param role - User role
   * @returns CSS classes for role badge
   */
  const getRoleBadgeClass = (role: UserRole): string => {
    const baseClass =
      'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium';
    switch (role) {
      case 'Admin':
        return `${baseClass} bg-purple-100 text-purple-700`;
      case 'Member':
        return `${baseClass} bg-blue-100 text-blue-700`;
      case 'Guest':
        return `${baseClass} bg-gray-100 text-gray-700`;
      default:
        return `${baseClass} bg-gray-100 text-gray-700`;
    }
  };

  /**
   * Handle row click - navigate to user details if callback provided
   */
  const handleRowClick = (userId: string) => {
    if (onUserClick) {
      onUserClick(userId);
    }
  };

  /**
   * Handle action button clicks - stop propagation to prevent row click
   */
  const handleActionClick = (
    e: React.MouseEvent,
    action: () => void
  ) => {
    e.stopPropagation();
    action();
  };

  // Empty state: no users to display
  if (!isLoading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-muted-foreground">
          No users found. Create your first user to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Registration Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            // Loading skeleton rows
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={`loading-${index}`}>
                <TableCell>
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                </TableCell>
                <TableCell>
                  <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
                </TableCell>
                <TableCell>
                  <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <div className="h-8 w-14 animate-pulse rounded bg-muted" />
                    <div className="h-8 w-14 animate-pulse rounded bg-muted" />
                    <div className="h-8 w-16 animate-pulse rounded bg-muted" />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            // User data rows
            users.map((user) => (
              <TableRow
                key={user.id}
                onClick={() => handleRowClick(user.id)}
                className={onUserClick ? 'cursor-pointer' : ''}
              >
                <TableCell className="font-medium">{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <span className={getRoleBadgeClass(user.role)}>
                    {user.role}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={getStatusBadgeClass(user.status)}>
                    {user.status}
                  </span>
                </TableCell>
                <TableCell>{formatDate(user.registrationDate)}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    {onView && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) =>
                          handleActionClick(e, () => onView(user.id))
                        }
                        aria-label={`View ${user.fullName}`}
                      >
                        View
                      </Button>
                    )}
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) =>
                          handleActionClick(e, () => onEdit(user.id))
                        }
                        aria-label={`Edit ${user.fullName}`}
                      >
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) =>
                          handleActionClick(e, () => onDelete(user.id))
                        }
                        aria-label={`Delete ${user.fullName}`}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
