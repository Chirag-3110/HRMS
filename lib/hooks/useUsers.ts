/**
 * Custom hook for fetching paginated user list with TanStack Query
 * 
 * This hook provides:
 * - Paginated user list with configurable page size
 * - Search and filtering capabilities (by role and status)
 * - Automatic caching with 30s stale time and 5min cache time
 * - Loading and error states
 * - Query key management for cache invalidation
 * 
 * Validates Requirements:
 * - 2.3: Load users within 2 seconds
 * - 4.1: Fetch user data efficiently
 * - 14.3: Implement client-side caching to reduce redundant API calls
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getUsers, type GetUsersParams, type PaginatedUsersResponse } from '../api/users';
import type { UserRole, UserStatus } from '../schemas/user';

/**
 * Query key factory for user list queries
 * Ensures proper cache segregation based on pagination and filters
 */
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: GetUsersParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

/**
 * Hook parameters interface
 */
export interface UseUsersParams {
  page?: number;
  pageSize?: 10 | 25 | 50 | 100;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
}

/**
 * Custom hook for fetching paginated user list
 * 
 * @param params - Pagination and filter parameters
 * @returns TanStack Query result with user data, loading state, and error state
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useUsers({
 *   page: 1,
 *   pageSize: 25,
 *   search: 'john',
 *   role: 'Admin',
 *   status: 'active'
 * });
 * ```
 * 
 * Features:
 * - Automatic caching with 30s stale time
 * - 5 minute cache time before garbage collection
 * - Retry logic (2 attempts) for failed requests
 * - Query key based on all parameters for proper cache segregation
 */
export function useUsers(
  params: UseUsersParams = {}
): UseQueryResult<PaginatedUsersResponse, Error> {
  // Set default values for pagination
  const queryParams: GetUsersParams = {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 25,
    search: params.search,
    role: params.role,
    status: params.status,
  };

  return useQuery({
    queryKey: userKeys.list(queryParams),
    queryFn: () => getUsers(queryParams),
    // Caching strategy as per design requirements
    staleTime: 30000, // 30 seconds - data considered fresh
    gcTime: 300000, // 5 minutes - cache time before garbage collection
    // Disable automatic refetching on window focus
    refetchOnWindowFocus: false,
    // Retry failed requests twice
    retry: 2,
  });
}
