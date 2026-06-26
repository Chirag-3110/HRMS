/**
 * Example usage of Analytics API functions
 * 
 * This file demonstrates how to use the analytics API layer
 * in React components with TanStack Query (React Query).
 * 
 * Note: This is an example file for documentation purposes.
 */

import { useQuery } from '@tanstack/react-query';
import {
  fetchAnalyticsSummary,
  fetchRegistrationTrends,
  fetchRoleBreakdown,
  fetchStatusBreakdown,
  type DateRangeFilter,
} from './analytics';

/**
 * Example 1: Fetch analytics summary
 * Use in a component to display total users, active users, and new users
 */
export function useAnalyticsSummary() {
  return useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: fetchAnalyticsSummary,
    staleTime: 60000, // 1 minute
    retry: 2,
  });
}

/**
 * Example 2: Fetch registration trends with optional date range
 * Use in a component to display a chart of user registrations over time
 */
export function useRegistrationTrends(dateRange?: DateRangeFilter) {
  return useQuery({
    queryKey: ['analytics', 'registration-trends', dateRange],
    queryFn: () => fetchRegistrationTrends(dateRange),
    staleTime: 300000, // 5 minutes
    retry: 2,
  });
}

/**
 * Example 3: Fetch role breakdown
 * Use in a component to display a pie chart of user distribution by role
 */
export function useRoleBreakdown(dateRange?: DateRangeFilter) {
  return useQuery({
    queryKey: ['analytics', 'role-breakdown', dateRange],
    queryFn: () => fetchRoleBreakdown(dateRange),
    staleTime: 300000, // 5 minutes
    retry: 2,
  });
}

/**
 * Example 4: Fetch status breakdown
 * Use in a component to display a bar chart of user distribution by status
 */
export function useStatusBreakdown(dateRange?: DateRangeFilter) {
  return useQuery({
    queryKey: ['analytics', 'status-breakdown', dateRange],
    queryFn: () => fetchStatusBreakdown(dateRange),
    staleTime: 300000, // 5 minutes
    retry: 2,
  });
}

/**
 * Example React Component Usage:
 * 
 * ```tsx
 * import { useAnalyticsSummary } from '@/lib/api/analytics.example';
 * 
 * export function AnalyticsDashboard() {
 *   const { data, isLoading, error } = useAnalyticsSummary();
 * 
 *   if (isLoading) {
 *     return <LoadingSkeleton variant="card" />;
 *   }
 * 
 *   if (error) {
 *     return <ErrorNotification message={error.message} />;
 *   }
 * 
 *   return (
 *     <div>
 *       <h2>Analytics Summary</h2>
 *       <p>Total Users: {data.totalUsers}</p>
 *       <p>Active Users: {data.activeUsers}</p>
 *       <p>New Users (Last 30 Days): {data.newUsersLast30Days}</p>
 *     </div>
 *   );
 * }
 * ```
 * 
 * Example with Date Range Filtering:
 * 
 * ```tsx
 * import { useRegistrationTrends } from '@/lib/api/analytics.example';
 * 
 * export function RegistrationChart() {
 *   const dateRange = {
 *     startDate: '2024-01-01',
 *     endDate: '2024-12-31',
 *   };
 * 
 *   const { data, isLoading, error } = useRegistrationTrends(dateRange);
 * 
 *   if (isLoading) return <LoadingSkeleton variant="chart" />;
 *   if (error) return <ErrorNotification message={error.message} />;
 * 
 *   return (
 *     <LineChart data={data.data}>
 *       <XAxis dataKey="month" />
 *       <YAxis />
 *       <Line type="monotone" dataKey="count" stroke="#8884d8" />
 *     </LineChart>
 *   );
 * }
 * ```
 */
