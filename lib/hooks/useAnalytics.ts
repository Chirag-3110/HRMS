/**
 * Custom hooks for fetching analytics data with TanStack Query
 * 
 * This module provides hooks for:
 * - Analytics summary statistics (total users, active users, new users)
 * - Registration trends over time (12 months)
 * - Role breakdown (distribution by role)
 * - Status breakdown (distribution by status)
 * 
 * All hooks implement caching strategy with 5 minutes stale time
 * (longer than user data as analytics change less frequently)
 * 
 * Validates Requirements:
 * - 10.1: Display summary statistics
 * - 10.2: Display registration trend chart
 * - 10.3: Display role breakdown chart
 * - 10.4: Display status breakdown chart
 * - 10.5: Display loading indicators
 * - 14.3: Implement client-side caching
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
  fetchAnalyticsSummary,
  fetchRegistrationTrends,
  fetchRoleBreakdown,
  fetchStatusBreakdown,
  type AnalyticsSummary,
  type RegistrationTrend,
  type RoleBreakdown,
  type StatusBreakdown,
  type DateRangeFilter,
} from '../api/analytics';

/**
 * Query key factory for analytics queries
 * Ensures proper cache segregation based on data type and filters
 */
export const analyticsKeys = {
  all: ['analytics'] as const,
  summary: () => [...analyticsKeys.all, 'summary'] as const,
  registrationTrends: (dateRange?: DateRangeFilter) =>
    [...analyticsKeys.all, 'registration-trends', dateRange] as const,
  roleBreakdown: (dateRange?: DateRangeFilter) =>
    [...analyticsKeys.all, 'role-breakdown', dateRange] as const,
  statusBreakdown: (dateRange?: DateRangeFilter) =>
    [...analyticsKeys.all, 'status-breakdown', dateRange] as const,
};

/**
 * Default query options for analytics data
 * 
 * Analytics data changes less frequently than user data, so we use:
 * - 5 minutes stale time (data considered fresh for longer)
 * - 10 minutes cache time before garbage collection
 * - Disable refetch on window focus
 * - Retry failed requests twice
 */
const ANALYTICS_QUERY_OPTIONS = {
  staleTime: 300000, // 5 minutes
  gcTime: 600000, // 10 minutes
  refetchOnWindowFocus: false,
  retry: 2,
} as const;

/**
 * Hook for fetching analytics summary statistics
 * 
 * Returns total users, active users, and new users in last 30 days
 * 
 * @returns TanStack Query result with summary data, loading state, and error state
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useAnalyticsSummary();
 * 
 * if (isLoading) return <LoadingSkeleton variant="card" />;
 * if (error) return <ErrorNotification message={error.message} />;
 * 
 * return (
 *   <SummaryCards
 *     totalUsers={data.totalUsers}
 *     activeUsers={data.activeUsers}
 *     newUsers={data.newUsersLast30Days}
 *   />
 * );
 * ```
 * 
 * Validates Requirements: 10.1, 10.5, 14.3
 */
export function useAnalyticsSummary(): UseQueryResult<AnalyticsSummary, Error> {
  return useQuery({
    queryKey: analyticsKeys.summary(),
    queryFn: fetchAnalyticsSummary,
    ...ANALYTICS_QUERY_OPTIONS,
  });
}

/**
 * Hook for fetching user registration trends over time
 * 
 * Returns registration counts grouped by month (default: last 12 months)
 * 
 * @param dateRange - Optional date range filter for trends
 * @returns TanStack Query result with registration trend data
 * 
 * @example
 * ```tsx
 * // Fetch last 12 months (default)
 * const { data, isLoading, error } = useRegistrationTrends();
 * 
 * // Fetch custom date range
 * const { data, isLoading, error } = useRegistrationTrends({
 *   startDate: '2023-01-01',
 *   endDate: '2023-12-31'
 * });
 * 
 * if (isLoading) return <LoadingSkeleton variant="chart" />;
 * if (error) return <ErrorNotification message={error.message} />;
 * 
 * return <RegistrationTrendChart data={data.data} />;
 * ```
 * 
 * Validates Requirements: 10.2, 10.5, 14.3
 */
export function useRegistrationTrends(
  dateRange?: DateRangeFilter
): UseQueryResult<RegistrationTrend, Error> {
  return useQuery({
    queryKey: analyticsKeys.registrationTrends(dateRange),
    queryFn: () => fetchRegistrationTrends(dateRange),
    ...ANALYTICS_QUERY_OPTIONS,
  });
}

/**
 * Hook for fetching user distribution by role
 * 
 * Returns count of users for each role (Admin, Member, Guest)
 * 
 * @param dateRange - Optional date range filter for role breakdown
 * @returns TanStack Query result with role breakdown data
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useRoleBreakdown();
 * 
 * if (isLoading) return <LoadingSkeleton variant="chart" />;
 * if (error) return <ErrorNotification message={error.message} />;
 * 
 * return <RoleBreakdownChart data={data.data} />;
 * ```
 * 
 * Validates Requirements: 10.3, 10.5, 14.3
 */
export function useRoleBreakdown(
  dateRange?: DateRangeFilter
): UseQueryResult<RoleBreakdown, Error> {
  return useQuery({
    queryKey: analyticsKeys.roleBreakdown(dateRange),
    queryFn: () => fetchRoleBreakdown(dateRange),
    ...ANALYTICS_QUERY_OPTIONS,
  });
}

/**
 * Hook for fetching user distribution by account status
 * 
 * Returns count of users for each status (active, deactivated)
 * 
 * @param dateRange - Optional date range filter for status breakdown
 * @returns TanStack Query result with status breakdown data
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useStatusBreakdown();
 * 
 * if (isLoading) return <LoadingSkeleton variant="chart" />;
 * if (error) return <ErrorNotification message={error.message} />;
 * 
 * return <StatusBreakdownChart data={data.data} />;
 * ```
 * 
 * Validates Requirements: 10.4, 10.5, 14.3
 */
export function useStatusBreakdown(
  dateRange?: DateRangeFilter
): UseQueryResult<StatusBreakdown, Error> {
  return useQuery({
    queryKey: analyticsKeys.statusBreakdown(dateRange),
    queryFn: () => fetchStatusBreakdown(dateRange),
    ...ANALYTICS_QUERY_OPTIONS,
  });
}
