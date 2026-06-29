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
  summary: (tenantId?: string) => [...analyticsKeys.all, 'summary', tenantId] as const,
  registrationTrends: (dateRange?: DateRangeFilter, tenantId?: string) =>
    [...analyticsKeys.all, 'registration-trends', dateRange, tenantId] as const,
  roleBreakdown: (dateRange?: DateRangeFilter, tenantId?: string) =>
    [...analyticsKeys.all, 'role-breakdown', dateRange, tenantId] as const,
  statusBreakdown: (dateRange?: DateRangeFilter, tenantId?: string) =>
    [...analyticsKeys.all, 'status-breakdown', dateRange, tenantId] as const,
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
 * @param tenantId - Optional tenant ID to scope metrics
 * @returns TanStack Query result with summary data, loading state, and error state
 */
export function useAnalyticsSummary(tenantId?: string): UseQueryResult<AnalyticsSummary, Error> {
  return useQuery({
    queryKey: analyticsKeys.summary(tenantId),
    queryFn: () => fetchAnalyticsSummary(tenantId),
    ...ANALYTICS_QUERY_OPTIONS,
  });
}

/**
 * Hook for fetching user registration trends over time
 * 
 * Returns registration counts grouped by month (default: last 12 months)
 * 
 * @param dateRange - Optional date range filter for trends
 * @param tenantId - Optional tenant ID to scope metrics
 * @returns TanStack Query result with registration trend data
 */
export function useRegistrationTrends(
  dateRange?: DateRangeFilter,
  tenantId?: string
): UseQueryResult<RegistrationTrend, Error> {
  return useQuery({
    queryKey: analyticsKeys.registrationTrends(dateRange, tenantId),
    queryFn: () => fetchRegistrationTrends(dateRange, tenantId),
    ...ANALYTICS_QUERY_OPTIONS,
  });
}

/**
 * Hook for fetching user distribution by role
 * 
 * Returns count of users for each role (Admin, Member, Guest)
 * 
 * @param dateRange - Optional date range filter for role breakdown
 * @param tenantId - Optional tenant ID to scope metrics
 * @returns TanStack Query result with role breakdown data
 */
export function useRoleBreakdown(
  dateRange?: DateRangeFilter,
  tenantId?: string
): UseQueryResult<RoleBreakdown, Error> {
  return useQuery({
    queryKey: analyticsKeys.roleBreakdown(dateRange, tenantId),
    queryFn: () => fetchRoleBreakdown(dateRange, tenantId),
    ...ANALYTICS_QUERY_OPTIONS,
  });
}

/**
 * Hook for fetching user distribution by account status
 * 
 * Returns count of users for each status (active, deactivated)
 * 
 * @param dateRange - Optional date range filter for status breakdown
 * @param tenantId - Optional tenant ID to scope metrics
 * @returns TanStack Query result with status breakdown data
 */
export function useStatusBreakdown(
  dateRange?: DateRangeFilter,
  tenantId?: string
): UseQueryResult<StatusBreakdown, Error> {
  return useQuery({
    queryKey: analyticsKeys.statusBreakdown(dateRange, tenantId),
    queryFn: () => fetchStatusBreakdown(dateRange, tenantId),
    ...ANALYTICS_QUERY_OPTIONS,
  });
}
