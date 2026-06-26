/**
 * UserFilters Component Usage Example
 * 
 * This example demonstrates how to integrate the UserFilters component
 * with URL query parameter persistence and combine it with UserSearchBar.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserFilters } from './UserFilters';
import { UserSearchBar } from './UserSearchBar';
import type { UserRole, UserStatus } from '@/lib/schemas/user';

/**
 * Example: Basic usage with state management
 */
export function BasicFiltersExample() {
  const [roleFilter, setRoleFilter] = useState<UserRole | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'All'>('All');

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Basic Filters</h2>
      <UserFilters
        roleFilter={roleFilter}
        statusFilter={statusFilter}
        onRoleChange={setRoleFilter}
        onStatusChange={setStatusFilter}
      />
      <div className="mt-4 space-y-2">
        <p className="text-sm text-gray-600">
          Role filter: <strong>{roleFilter}</strong>
        </p>
        <p className="text-sm text-gray-600">
          Status filter: <strong>{statusFilter}</strong>
        </p>
      </div>
    </div>
  );
}

/**
 * Example: Filters with URL persistence
 * This is the recommended approach for the user list page
 */
export function URLPersistedFiltersExample() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [roleFilter, setRoleFilter] = useState<UserRole | 'All'>(
    (searchParams.get('role') as UserRole | 'All') || 'All'
  );
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'All'>(
    (searchParams.get('status') as UserStatus | 'All') || 'All'
  );

  // Sync with URL on mount
  useEffect(() => {
    const urlRole = (searchParams.get('role') as UserRole | 'All') || 'All';
    const urlStatus = (searchParams.get('status') as UserStatus | 'All') || 'All';
    setRoleFilter(urlRole);
    setStatusFilter(urlStatus);
  }, [searchParams]);

  // Update URL when role filter changes
  const handleRoleChange = (role: UserRole | 'All') => {
    setRoleFilter(role);
    
    // Update URL query parameters
    const params = new URLSearchParams(searchParams.toString());
    if (role !== 'All') {
      params.set('role', role);
    } else {
      params.delete('role');
    }
    
    // Reset to first page when filter changes
    params.set('page', '1');
    
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Update URL when status filter changes
  const handleStatusChange = (status: UserStatus | 'All') => {
    setStatusFilter(status);
    
    // Update URL query parameters
    const params = new URLSearchParams(searchParams.toString());
    if (status !== 'All') {
      params.set('status', status);
    } else {
      params.delete('status');
    }
    
    // Reset to first page when filter changes
    params.set('page', '1');
    
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Filters with URL Persistence</h2>
      <UserFilters
        roleFilter={roleFilter}
        statusFilter={statusFilter}
        onRoleChange={handleRoleChange}
        onStatusChange={handleStatusChange}
      />
      <div className="mt-4 space-y-2">
        <p className="text-sm text-gray-600">
          URL role param: {searchParams.get('role') || '(none)'}
        </p>
        <p className="text-sm text-gray-600">
          URL status param: {searchParams.get('status') || '(none)'}
        </p>
        <p className="text-sm text-gray-600">
          Page: {searchParams.get('page') || '1'}
        </p>
      </div>
    </div>
  );
}

/**
 * Example: Combined Search and Filters
 * Demonstrates integration of UserSearchBar and UserFilters together
 */
export function CombinedSearchAndFiltersExample() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'All'>(
    (searchParams.get('role') as UserRole | 'All') || 'All'
  );
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'All'>(
    (searchParams.get('status') as UserStatus | 'All') || 'All'
  );

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    updateURL({ search: query });
  };

  const handleRoleChange = (role: UserRole | 'All') => {
    setRoleFilter(role);
    updateURL({ role });
  };

  const handleStatusChange = (status: UserStatus | 'All') => {
    setStatusFilter(status);
    updateURL({ status });
  };

  const updateURL = (updates: { search?: string; role?: UserRole | 'All'; status?: UserStatus | 'All' }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Handle search parameter
    if ('search' in updates) {
      if (updates.search) {
        params.set('search', updates.search);
      } else {
        params.delete('search');
      }
    }
    
    // Handle role parameter
    if ('role' in updates && updates.role !== undefined) {
      if (updates.role !== 'All') {
        params.set('role', updates.role);
      } else {
        params.delete('role');
      }
    }
    
    // Handle status parameter
    if ('status' in updates && updates.status !== undefined) {
      if (updates.status !== 'All') {
        params.set('status', updates.status);
      } else {
        params.delete('status');
      }
    }
    
    // Reset to first page when any filter changes
    params.set('page', '1');
    
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Combined Search and Filters</h2>
      
      {/* Search and Filter Bar */}
      <div className="flex flex-wrap gap-4 items-end">
        <UserSearchBar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          className="flex-1 min-w-[250px]"
        />
        <UserFilters
          roleFilter={roleFilter}
          statusFilter={statusFilter}
          onRoleChange={handleRoleChange}
          onStatusChange={handleStatusChange}
        />
      </div>

      {/* Display Current Filters */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold mb-2">Active Filters:</h3>
        <div className="space-y-1 text-sm text-gray-600">
          <p>Search: <strong>{searchQuery || '(all users)'}</strong></p>
          <p>Role: <strong>{roleFilter}</strong></p>
          <p>Status: <strong>{statusFilter}</strong></p>
        </div>
      </div>
    </div>
  );
}

/**
 * Example: Filters with data fetching simulation
 * Demonstrates how filters integrate with data loading
 */
export function FiltersWithDataFetchingExample() {
  const [roleFilter, setRoleFilter] = useState<UserRole | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'All'>('All');
  const [isLoading, setIsLoading] = useState(false);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Simulate API call with delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock user counts based on filters
        let count = 100; // Total users
        
        if (roleFilter === 'Admin') count = 15;
        else if (roleFilter === 'Member') count = 60;
        else if (roleFilter === 'Guest') count = 25;
        
        if (statusFilter === 'active') count = Math.floor(count * 0.8);
        else if (statusFilter === 'deactivated') count = Math.floor(count * 0.2);
        
        setUserCount(count);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [roleFilter, statusFilter]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Filters with Data Fetching</h2>
      
      <UserFilters
        roleFilter={roleFilter}
        statusFilter={statusFilter}
        onRoleChange={setRoleFilter}
        onStatusChange={setStatusFilter}
      />

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading users...</p>
        ) : (
          <p className="text-sm text-gray-700">
            Found <strong>{userCount}</strong> users matching filters
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Example: Filters with reset functionality
 * Shows how to implement a "Clear all filters" button
 */
export function FiltersWithResetExample() {
  const [roleFilter, setRoleFilter] = useState<UserRole | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'All'>('All');

  const handleResetFilters = () => {
    setRoleFilter('All');
    setStatusFilter('All');
  };

  const hasActiveFilters = roleFilter !== 'All' || statusFilter !== 'All';

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Filters with Reset</h2>
      
      <div className="flex flex-wrap gap-4 items-end">
        <UserFilters
          roleFilter={roleFilter}
          statusFilter={statusFilter}
          onRoleChange={setRoleFilter}
          onStatusChange={setStatusFilter}
        />
        
        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="h-9 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-sm text-gray-600">
          Active filters: <strong>{hasActiveFilters ? 'Yes' : 'No'}</strong>
        </p>
      </div>
    </div>
  );
}

/**
 * Example: Full user list page integration
 * This demonstrates the complete integration including search, filters, and pagination
 */
export function FullUserListExample() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'All'>(
    (searchParams.get('role') as UserRole | 'All') || 'All'
  );
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'All'>(
    (searchParams.get('status') as UserStatus | 'All') || 'All'
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get('page') || '1', 10)
  );

  const updateURL = (updates: {
    search?: string;
    role?: UserRole | 'All';
    status?: UserStatus | 'All';
    page?: number;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if ('search' in updates && updates.search !== undefined) {
      if (updates.search) {
        params.set('search', updates.search);
      } else {
        params.delete('search');
      }
    }
    
    if ('role' in updates && updates.role !== undefined) {
      if (updates.role !== 'All') {
        params.set('role', updates.role);
      } else {
        params.delete('role');
      }
    }
    
    if ('status' in updates && updates.status !== undefined) {
      if (updates.status !== 'All') {
        params.set('status', updates.status);
      } else {
        params.delete('status');
      }
    }
    
    if ('page' in updates && updates.page !== undefined) {
      params.set('page', updates.page.toString());
    }
    
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    updateURL({ search: query, page: 1 });
  };

  const handleRoleChange = (role: UserRole | 'All') => {
    setRoleFilter(role);
    setCurrentPage(1);
    updateURL({ role, page: 1 });
  };

  const handleStatusChange = (status: UserStatus | 'All') => {
    setStatusFilter(status);
    setCurrentPage(1);
    updateURL({ status, page: 1 });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setRoleFilter('All');
    setStatusFilter('All');
    setCurrentPage(1);
    router.push('?page=1', { scroll: false });
  };

  const hasActiveFilters = searchQuery !== '' || roleFilter !== 'All' || statusFilter !== 'All';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">User Management</h1>
        
        {/* Search and Filter Bar */}
        <div className="flex flex-wrap gap-4 items-end mb-4">
          <UserSearchBar
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            className="flex-1 min-w-[250px]"
          />
          <UserFilters
            roleFilter={roleFilter}
            statusFilter={statusFilter}
            onRoleChange={handleRoleChange}
            onStatusChange={handleStatusChange}
          />
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="h-9 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 text-sm">
            {searchQuery && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Search: {searchQuery}
              </span>
            )}
            {roleFilter !== 'All' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Role: {roleFilter}
              </span>
            )}
            {statusFilter !== 'All' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Status: {statusFilter}
              </span>
            )}
          </div>
        )}
      </div>

      {/* User list would go here */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white">
        <p className="text-sm text-gray-600">
          Showing users for page: <strong>{currentPage}</strong>
        </p>
        <div className="mt-2 text-sm text-gray-500">
          <p>Filters applied: {hasActiveFilters ? 'Yes' : 'No'}</p>
          {hasActiveFilters && (
            <ul className="list-disc list-inside mt-1">
              {searchQuery && <li>Search: "{searchQuery}"</li>}
              {roleFilter !== 'All' && <li>Role: {roleFilter}</li>}
              {statusFilter !== 'All' && <li>Status: {statusFilter}</li>}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
