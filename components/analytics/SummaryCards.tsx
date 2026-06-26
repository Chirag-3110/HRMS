/**
 * SummaryCards component for displaying analytics summary statistics
 * 
 * This component displays three key metrics in card format:
 * - Total users: All registered users in the system
 * - Active users: Users with active status
 * - New users: Users registered in the last 30 days
 * 
 * Features:
 * - Responsive grid layout (1 column mobile, 3 columns desktop)
 * - Number formatting with commas for thousands
 * - Icons for visual appeal (Users, UserCheck, UserPlus)
 * - Loading skeleton while data is fetching
 * - Error state handling
 * 
 * Validates Requirements:
 * - 10.1: Display summary statistics
 * - 12.1: Mobile-optimized layout (<768px)
 * - 12.2: Desktop layout (≥768px)
 * - 14.1: Loading states
 */

import * as React from 'react';
import { Users, UserCheck, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { useAnalyticsSummary } from '@/lib/hooks/useAnalytics';
import { cn } from '@/lib/utils';

/**
 * Format number with comma separators for thousands
 * 
 * @param num - Number to format
 * @returns Formatted string with commas (e.g., 1,234,567)
 * 
 * @example
 * formatNumber(1234) => "1,234"
 * formatNumber(1234567) => "1,234,567"
 */
function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Props for individual summary card
 */
interface SummaryCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description?: string;
  className?: string;
}

/**
 * Individual summary card component
 * 
 * Displays a single metric with icon, title, and formatted value
 */
function SummaryCard({
  title,
  value,
  icon,
  description,
  className,
}: SummaryCardProps) {
  return (
    <Card className={cn('transition-shadow hover:shadow-md', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatNumber(value)}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * SummaryCards component
 * 
 * Fetches and displays analytics summary statistics in a responsive grid layout
 * 
 * @example
 * ```tsx
 * <SummaryCards />
 * ```
 * 
 * The component handles its own data fetching, loading states, and error states.
 */
export function SummaryCards() {
  const { data, isLoading, error } = useAnalyticsSummary();

  // Show loading skeleton while data is fetching
  if (isLoading) {
    return (
      <div
        className="grid gap-4 grid-cols-1 md:grid-cols-3"
        role="status"
        aria-label="Loading analytics summary"
      >
        <LoadingSkeleton variant="card" />
        <LoadingSkeleton variant="card" />
        <LoadingSkeleton variant="card" />
      </div>
    );
  }

  // Show error state if data fetch failed
  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {error.message || 'Failed to load analytics summary. Please try again.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Show empty state if no data is available
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Data Available</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Analytics data is not available at this time.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Render summary cards with data
  return (
    <div
      className="grid gap-4 grid-cols-1 md:grid-cols-3"
      role="region"
      aria-label="Analytics summary"
    >
      <SummaryCard
        title="Total Users"
        value={data.totalUsers}
        icon={<Users className="h-4 w-4" />}
        description="All registered users"
      />
      <SummaryCard
        title="Active Users"
        value={data.activeUsers}
        icon={<UserCheck className="h-4 w-4" />}
        description="Users with active accounts"
      />
      <SummaryCard
        title="New Users"
        value={data.newUsersLast30Days}
        icon={<UserPlus className="h-4 w-4" />}
        description="Registered in last 30 days"
      />
    </div>
  );
}
