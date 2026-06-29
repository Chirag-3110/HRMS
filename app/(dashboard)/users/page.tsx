'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserTable } from '@/components/users/UserTable';
import { UserSearchBar } from '@/components/users/UserSearchBar';
import { UserFilters } from '@/components/users/UserFilters';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ErrorNotification } from '@/components/common/ErrorNotification';
import { Button } from '@/components/ui/button';
import { useUsers } from '@/lib/hooks/useUsers';
import type { UserRole, UserStatus } from '@/lib/schemas/user';
import { Plus, Download } from 'lucide-react';
import { exportUsersToCSV } from '@/lib/utils/export';
import { formatTenantName } from '@/lib/utils/tenant';

/**
 * User List Page Content Component
 * 
 * Main content for displaying and managing the list of Phelbo platform users.
 * Provides comprehensive filtering, search, and pagination capabilities with
 * URL state persistence for shareable and bookmarkable filtered views.
 * 
 * Features:
 * - Paginated user table display
 * - Search by name or email (debounced 500ms)
 * - Filter by role and status
 * - URL query parameter state management
 * - Loading states with skeleton UI
 * - Error handling with dismissible notifications
 * - Empty state messaging
 * - Navigation to user details and creation
 * 
 * Validates Requirements:
 * - 2.1: Display table of users with pagination
 * - 2.2: Paginate user list with configurable page size
 * - 2.3: Load users within 2 seconds
 * - 3.1: Search input field
 * - 3.2: Update results within 500ms (via debounced UserSearchBar)
 * - 3.3: Filter dropdowns for role and status
 * - 3.4: Display users matching all filter criteria
 * - 3.5: Persist filter state in URL query parameters
 * 
 * URL Query Parameters:
 * - search: Search query string
 * - role: User role filter (Admin, Member, Guest)
 * - status: User status filter (active, deactivated)
 * - page: Current page number (1-indexed)
 * - pageSize: Items per page (10, 25, 50, 100)
 */
function UsersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract filter and pagination state from URL query parameters
  const searchQuery = searchParams.get('search') || '';
  const roleFilter = (searchParams.get('role') as UserRole | 'All') || 'All';
  const statusFilter = (searchParams.get('status') as UserStatus | 'All') || 'All';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const pageSizeParam = searchParams.get('pageSize') || '25';
  const pageSize = (
    ['10', '25', '50', '100'].includes(pageSizeParam) 
      ? parseInt(pageSizeParam, 10) 
      : 25
  ) as 10 | 25 | 50 | 100;

  // Extract tenantId query parameter
  const activeTenantId = searchParams.get('tenantId') || 'apex-logistics';

  // Fetch users with current filters and pagination
  const {
    data: usersData,
    isLoading,
    error,
  } = useUsers({
    page: currentPage,
    pageSize,
    search: searchQuery || undefined,
    role: roleFilter !== 'All' ? roleFilter : undefined,
    status: statusFilter !== 'All' ? statusFilter : undefined,
    tenantId: activeTenantId,
  });

  // Local state for error notification and export loading
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isExporting, setIsExporting] = React.useState(false);

  /**
   * Update URL query parameters when filters or pagination change
   * This enables shareable URLs and browser back/forward navigation
   */
  const updateUrlParams = React.useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      // Update or delete parameters based on provided updates
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '' || value === 'All') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      // Reset to page 1 if filters change (not pagination)
      if (!('page' in updates) && (updates.search !== undefined || updates.role !== undefined || updates.status !== undefined)) {
        params.set('page', '1');
      }

      // Update URL without page reload
      router.push(`/users?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  /**
   * Handle search query change
   */
  const handleSearchChange = React.useCallback(
    (search: string) => {
      updateUrlParams({ search });
    },
    [updateUrlParams]
  );

  /**
   * Handle role filter change
   */
  const handleRoleChange = React.useCallback(
    (role: UserRole | 'All') => {
      updateUrlParams({ role });
    },
    [updateUrlParams]
  );

  /**
   * Handle status filter change
   */
  const handleStatusChange = React.useCallback(
    (status: UserStatus | 'All') => {
      updateUrlParams({ status });
    },
    [updateUrlParams]
  );

  /**
   * Handle page change
   */
  const handlePageChange = React.useCallback(
    (newPage: number) => {
      updateUrlParams({ page: newPage.toString() });
    },
    [updateUrlParams]
  );

  /**
   * Handle page size change
   */
  const handlePageSizeChange = React.useCallback(
    (newPageSize: number) => {
      updateUrlParams({ pageSize: newPageSize.toString(), page: '1' });
    },
    [updateUrlParams]
  );

  /**
   * Handle user row click - navigate to user detail view
   */
  const handleUserClick = React.useCallback(
    (userId: string) => {
      router.push(`/users/${userId}?tenantId=${activeTenantId}`);
    },
    [router, activeTenantId]
  );

  /**
   * Handle create user button click
   */
  const handleCreateUser = React.useCallback(() => {
    router.push(`/users/create?tenantId=${activeTenantId}`);
  }, [router, activeTenantId]);

  /**
   * Handle export users to CSV
   * Exports all currently filtered users
   * Validates Requirements: 13.1, 13.2, 13.4, 13.5
   */
  const handleExportUsers = React.useCallback(() => {
    if (!usersData || usersData.users.length === 0) {
      return;
    }

    setIsExporting(true);
    try {
      // Export current filtered user data
      exportUsersToCSV(usersData.users);
    } catch (error) {
      setErrorMessage('Failed to export users. Please try again.');
    } finally {
      // Reset loading state after a short delay to show visual feedback
      setTimeout(() => setIsExporting(false), 500);
    }
  }, [usersData]);

  /**
   * Sync API errors to error notification state
   */
  React.useEffect(() => {
    if (error) {
      setErrorMessage(error.message || 'Failed to load users. Please try again.');
    }
  }, [error]);

  /**
   * Calculate if there are any active filters
   */
  const hasActiveFilters =
    searchQuery !== '' || roleFilter !== 'All' || statusFilter !== 'All';

  return (
    <div className="flex flex-col gap-8 p-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-100">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 font-display tracking-tight">
            Team Directory
          </h1>
          <p className="text-sm text-slate-500 font-sans">
            Manage FieldPulse SaaS team members and field employees for{' '}
            <span className="font-extrabold text-indigo-600">
              {formatTenantName(activeTenantId)}
            </span>
          </p>
        </div>
        <Button
          onClick={handleCreateUser}
          className="rounded-2xl px-6 py-2.5 bg-indigo-600 text-white font-extrabold hover:bg-indigo-700 shadow-md shadow-indigo-600/10 transition-all font-display"
        >
          <Plus className="mr-2 h-4.5 w-4.5 stroke-[2.5]" />
          Create User
        </Button>
      </div>

      {/* Error Notification */}
      {errorMessage && (
        <ErrorNotification
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
        />
      )}

      {/* Search and Filter Controls Panel */}
      <div className="bg-slate-50/50 border border-slate-200/60 rounded-3xl p-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-end justify-between">
          <UserSearchBar
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            className="w-full lg:max-w-md"
            placeholder="Search team by name or email..."
          />
          <div className="flex flex-wrap items-end gap-3">
            <UserFilters
              roleFilter={roleFilter}
              statusFilter={statusFilter}
              onRoleChange={handleRoleChange}
              onStatusChange={handleStatusChange}
              className="w-full sm:w-auto"
            />
            <Button
              onClick={handleExportUsers}
              variant="outline"
              disabled={isLoading || !usersData || usersData.users.length === 0 || isExporting}
              className="h-10 rounded-xl px-4 border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50/80 mt-1 animate-all duration-300"
              aria-label="Export users to CSV"
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export Directory'}
            </Button>
          </div>
        </div>
      </div>

      {/* User Count and Active Filters Info */}
      {!isLoading && usersData && (
        <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-2">
          <p>
            Showing {usersData.users.length} of {usersData.pagination.totalCount} registered accounts
            {hasActiveFilters && ' (filters active)'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={() => {
                updateUrlParams({
                  search: null,
                  role: null,
                  status: null,
                });
              }}
              className="text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
            >
              Reset active filters
            </button>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <LoadingSkeleton variant="table" rows={pageSize > 10 ? 10 : pageSize} />
      )}

      {/* User Table / Data Grid */}
      {!isLoading && usersData && (
        <>
          {usersData.users.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
              <p className="text-sm font-black text-slate-800">
                {hasActiveFilters ? 'No accounts match filter criteria' : 'No team members registered yet'}
              </p>
              <p className="mt-1 text-xs text-slate-400 max-w-xs">
                {hasActiveFilters
                  ? 'Try clearing searches or adjusting filters to expand selection.'
                  : 'Start adding employees to this tenant instance.'}
              </p>
              {hasActiveFilters ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    updateUrlParams({
                      search: null,
                      role: null,
                      status: null,
                    });
                  }}
                  className="mt-4 rounded-xl text-xs font-bold"
                >
                  Clear filters
                </Button>
              ) : (
                <Button onClick={handleCreateUser} className="mt-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First User
                </Button>
              )}
            </div>
          ) : (
            <UserTable
              users={usersData.users}
              onUserClick={handleUserClick}
              isLoading={false}
            />
          )}

          {/* Pagination Controls */}
          {usersData.users.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-6 px-2">
              {/* Page Size Selector */}
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span>Display</span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(parseInt(e.target.value, 10))}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-700 focus:border-indigo-500 focus:outline-none"
                  aria-label="Users per page"
                >
                  <option value="10">10 per page</option>
                  <option value="25">25 per page</option>
                  <option value="50">50 per page</option>
                  <option value="100">100 per page</option>
                </select>
              </div>

              {/* Pagination Buttons */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded-xl h-8.5 text-xs font-bold border-slate-200 disabled:opacity-50"
                  aria-label="Previous page"
                >
                  Previous
                </Button>
                <span className="text-xs font-mono font-bold text-slate-600 bg-slate-50 border border-slate-200/50 rounded-lg px-2.5 py-1">
                  Page {currentPage} / {usersData.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= usersData.pagination.totalPages}
                  className="rounded-xl h-8.5 text-xs font-bold border-slate-200 disabled:opacity-50"
                  aria-label="Next page"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/**
 * User List Page Component (Wrapper)
 * 
 * Wraps the UsersPageContent in a Suspense boundary to handle
 * useSearchParams() properly for Next.js build optimization.
 */
export default function UsersPage() {
  return (
    <Suspense fallback={<LoadingSkeleton variant="table" rows={10} />}>
      <UsersPageContent />
    </Suspense>
  );
}
