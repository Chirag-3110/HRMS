'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserRole, UserStatus } from '@/lib/schemas/user';

/**
 * Props for the UserFilters component
 */
export interface UserFiltersProps {
  /** Current selected role filter */
  roleFilter?: UserRole | 'All';
  /** Current selected status filter */
  statusFilter?: UserStatus | 'All';
  /** Callback when role filter changes */
  onRoleChange: (role: UserRole | 'All') => void;
  /** Callback when status filter changes */
  onStatusChange: (status: UserStatus | 'All') => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * UserFilters Component
 * 
 * Provides dropdown selectors for filtering users by role and account status.
 * Implements controlled component pattern with callbacks to emit filter changes.
 * 
 * Features:
 * - Role filter dropdown (Admin, Member, Guest, All)
 * - Status filter dropdown (Active, Deactivated, All)
 * - Supports URL query parameter persistence via parent component
 * - Keyboard accessible with ARIA labels
 * - Responsive design with proper spacing
 * 
 * Validates Requirements:
 * - 3.3: Provide filter dropdowns for user role and account status
 * - 3.4: Display users matching all selected filter criteria
 * - 3.5: Persist filter state in URL query parameters (via parent)
 * 
 * Note: This component works alongside UserSearchBar (task 6.2) to provide
 * comprehensive filtering capabilities. The parent component is responsible
 * for combining search and filter criteria and managing URL persistence.
 * 
 * @example
 * ```tsx
 * <UserFilters
 *   roleFilter={roleFilter}
 *   statusFilter={statusFilter}
 *   onRoleChange={setRoleFilter}
 *   onStatusChange={setStatusFilter}
 * />
 * ```
 */
export function UserFilters({
  roleFilter = 'All',
  statusFilter = 'All',
  onRoleChange,
  onStatusChange,
  className = '',
}: UserFiltersProps) {
  /**
   * Handle role filter change
   */
  const handleRoleChange = (value: string) => {
    onRoleChange(value as UserRole | 'All');
  };

  /**
   * Handle status filter change
   */
  const handleStatusChange = (value: string) => {
    onStatusChange(value as UserStatus | 'All');
  };

  return (
    <div className={`flex gap-3 ${className}`}>
      {/* Role Filter */}
      <div className="flex flex-col gap-1.5 min-w-[140px]">
        <label
          htmlFor="role-filter"
          className="text-sm font-medium text-gray-700"
        >
          Role
        </label>
        <Select
          value={roleFilter}
          onValueChange={handleRoleChange}
        >
          <SelectTrigger
            id="role-filter"
            aria-label="Filter by role"
            className="w-full"
          >
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All roles</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="Member">Member</SelectItem>
            <SelectItem value="Guest">Guest</SelectItem>
            <SelectItem value="FieldWorker">Field Worker</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status Filter */}
      <div className="flex flex-col gap-1.5 min-w-[160px]">
        <label
          htmlFor="status-filter"
          className="text-sm font-medium text-gray-700"
        >
          Status
        </label>
        <Select
          value={statusFilter}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger
            id="status-filter"
            aria-label="Filter by status"
            className="w-full"
          >
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="deactivated">Deactivated</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
