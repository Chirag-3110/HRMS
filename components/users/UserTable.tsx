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
      'inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider';
    switch (role) {
      case 'Admin':
        return `${baseClass} bg-purple-50 text-purple-700 border border-purple-200/50`;
      case 'Member':
        return `${baseClass} bg-blue-50 text-blue-700 border border-blue-200/50`;
      case 'Guest':
        return `${baseClass} bg-slate-50 text-slate-600 border border-slate-200/50`;
      case 'FieldWorker':
        return `${baseClass} bg-indigo-50 text-indigo-700 border border-indigo-200/50`;
      default:
        return `${baseClass} bg-slate-50 text-slate-600 border border-slate-250`;
    }
  };

  const getInitials = (name: string): string => {
    if (!name) return 'U';
    const pts = name.split(' ');
    if (pts.length > 1) return `${pts[0][0]}${pts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
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
      <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50/50 rounded-2xl border border-dashed">
        <p className="text-xs font-bold text-slate-500">
          No users found matching query
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border border-slate-200/80 overflow-hidden shadow-sm bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-200/80">
            <TableHead className="font-bold text-[10px] uppercase text-slate-500 tracking-wider py-4 px-6">Name</TableHead>
            <TableHead className="font-bold text-[10px] uppercase text-slate-500 tracking-wider py-4">Email</TableHead>
            <TableHead className="font-bold text-[10px] uppercase text-slate-500 tracking-wider py-4">Role</TableHead>
            <TableHead className="font-bold text-[10px] uppercase text-slate-500 tracking-wider py-4">Status</TableHead>
            <TableHead className="font-bold text-[10px] uppercase text-slate-500 tracking-wider py-4">Registration Date</TableHead>
            <TableHead className="font-bold text-[10px] uppercase text-slate-500 tracking-wider py-4 text-right px-6">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            // Loading skeleton rows
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={`loading-${index}`}>
                <TableCell className="px-6">
                  <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-48 animate-pulse rounded bg-slate-100" />
                </TableCell>
                <TableCell>
                  <div className="h-6 w-16 animate-pulse rounded-full bg-slate-100" />
                </TableCell>
                <TableCell>
                  <div className="h-6 w-16 animate-pulse rounded-full bg-slate-100" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
                </TableCell>
                <TableCell className="px-6">
                  <div className="flex justify-end gap-2">
                    <div className="h-8 w-14 animate-pulse rounded bg-slate-100" />
                    <div className="h-8 w-14 animate-pulse rounded bg-slate-100" />
                    <div className="h-8 w-16 animate-pulse rounded bg-slate-100" />
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
                className={`border-b border-slate-150/70 hover:bg-slate-50/50 transition-colors ${onUserClick ? 'cursor-pointer' : ''}`}
              >
                <TableCell className="py-3.5 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8.5 h-8.5 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center text-[10px] font-black text-slate-700 shrink-0">
                      {getInitials(user.fullName)}
                    </div>
                    <span className="font-extrabold text-slate-900">{user.fullName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-slate-500 font-mono text-[11px]">{user.email}</TableCell>
                <TableCell>
                  <span className={getRoleBadgeClass(user.role)}>
                    {user.role === 'FieldWorker' ? 'Field Worker' : user.role}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border ${
                    user.status === 'active'
                      ? 'bg-green-50 text-green-700 border-green-200/50'
                      : 'bg-slate-100 text-slate-500 border-slate-200/40'
                  }`}>
                    {user.status}
                  </span>
                </TableCell>
                <TableCell className="text-slate-400 font-mono text-[10px]">{formatDate(user.registrationDate)}</TableCell>
                <TableCell className="px-6">
                  <div className="flex justify-end gap-1">
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
