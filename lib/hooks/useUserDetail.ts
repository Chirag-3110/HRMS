/**
 * Custom hook for fetching individual user detail and activity log with TanStack Query
 * 
 * This hook provides:
 * - Detailed user profile information
 * - User activity log (most recent 50 activities)
 * - Automatic caching with 30s stale time and 5min cache time
 * - Loading and error states
 * - Query key management for cache invalidation
 * 
 * Validates Requirements:
 * - 4.1: View detailed information about a specific user
 * - 4.2: Display user profile and activity log
 * - 14.3: Implement client-side caching to reduce redundant API calls
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getUserDetail, type UserDetailResponse } from '../api/users';
import { userKeys } from './useUsers';

/**
 * Custom hook for fetching individual user details with activity log
 * 
 * @param userId - The unique identifier of the user to fetch
 * @param options - Optional query options (enabled flag for conditional fetching)
 * @returns TanStack Query result with user detail data, loading state, and error state
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useUserDetail('user-123');
 * 
 * if (data) {
 *   console.log(data.fullName); // User profile information
 *   console.log(data.activities); // Array of recent activities
 * }
 * ```
 * 
 * @example Conditional fetching
 * ```tsx
 * const { data, isLoading } = useUserDetail(userId, {
 *   enabled: !!userId // Only fetch when userId is available
 * });
 * ```
 * 
 * Features:
 * - Automatic caching with 30s stale time
 * - 5 minute cache time before garbage collection
 * - Retry logic (2 attempts) for failed requests
 * - Conditional fetching support via enabled option
 * - Query key segregation for proper cache management
 */
export function useUserDetail(
  userId: string,
  options?: { enabled?: boolean }
): UseQueryResult<UserDetailResponse, Error> {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => getUserDetail(userId),
    // Caching strategy as per design requirements
    staleTime: 30000, // 30 seconds - data considered fresh
    gcTime: 300000, // 5 minutes - cache time before garbage collection
    // Disable automatic refetching on window focus
    refetchOnWindowFocus: false,
    // Retry failed requests twice
    retry: 2,
    // Allow conditional fetching (useful when userId might be undefined)
    enabled: options?.enabled ?? true,
  });
}
