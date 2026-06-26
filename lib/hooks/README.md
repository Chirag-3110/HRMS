# Analytics Hooks

Custom React hooks for fetching analytics data using TanStack Query v5.

## Hooks

### useAnalyticsSummary

Fetches summary statistics including total users, active users, and new users in the last 30 days.

```tsx
import { useAnalyticsSummary } from '@/lib/hooks/useAnalytics';

function SummarySection() {
  const { data, isLoading, error } = useAnalyticsSummary();

  if (isLoading) return <LoadingSkeleton variant="card" />;
  if (error) return <ErrorNotification message={error.message} />;

  return (
    <div>
      <p>Total Users: {data.totalUsers}</p>
      <p>Active Users: {data.activeUsers}</p>
      <p>New Users (Last 30 Days): {data.newUsersLast30Days}</p>
    </div>
  );
}
```

### useRegistrationTrends

Fetches user registration trends over time (default: last 12 months).

```tsx
import { useRegistrationTrends } from '@/lib/hooks/useAnalytics';

function TrendChart() {
  const { data, isLoading, error } = useRegistrationTrends();

  if (isLoading) return <LoadingSkeleton variant="chart" />;
  if (error) return <ErrorNotification message={error.message} />;

  return <RegistrationTrendChart data={data.data} />;
}

// With custom date range
function CustomTrendChart() {
  const { data, isLoading, error } = useRegistrationTrends({
    startDate: '2024-01-01',
    endDate: '2024-12-31',
  });

  // ... render logic
}
```

### useRoleBreakdown

Fetches user distribution by role (Admin, Member, Guest).

```tsx
import { useRoleBreakdown } from '@/lib/hooks/useAnalytics';

function RoleChart() {
  const { data, isLoading, error } = useRoleBreakdown();

  if (isLoading) return <LoadingSkeleton variant="chart" />;
  if (error) return <ErrorNotification message={error.message} />;

  return <RoleBreakdownChart data={data.data} />;
}
```

### useStatusBreakdown

Fetches user distribution by account status (active, deactivated).

```tsx
import { useStatusBreakdown } from '@/lib/hooks/useAnalytics';

function StatusChart() {
  const { data, isLoading, error } = useStatusBreakdown();

  if (isLoading) return <LoadingSkeleton variant="chart" />;
  if (error) return <ErrorNotification message={error.message} />;

  return <StatusBreakdownChart data={data.data} />;
}
```

## Caching Strategy

All analytics hooks use an optimized caching strategy:

- **staleTime**: 5 minutes (300,000ms)
- **gcTime**: 10 minutes (600,000ms)
- **refetchOnWindowFocus**: false
- **retry**: 2 attempts

Analytics data changes less frequently than user data, so a longer stale time is used to reduce unnecessary API calls and improve performance.

## Query Keys

The hooks use a factory pattern for query keys to ensure proper cache segregation:

```typescript
// Query key structure
analyticsKeys.summary() // ['analytics', 'summary']
analyticsKeys.registrationTrends() // ['analytics', 'registration-trends', undefined]
analyticsKeys.registrationTrends({ startDate: '2024-01-01' }) 
  // ['analytics', 'registration-trends', { startDate: '2024-01-01' }]
analyticsKeys.roleBreakdown() // ['analytics', 'role-breakdown', undefined]
analyticsKeys.statusBreakdown() // ['analytics', 'status-breakdown', undefined]
```

## Error Handling

All hooks return TanStack Query's standard error handling:

```tsx
const { data, isLoading, error, isError } = useAnalyticsSummary();

if (isError) {
  // Error is available in the error property
  console.error(error.message);
}
```

Errors are already transformed by the analytics API layer to be user-friendly.

## Refetching

You can manually refetch data using the `refetch` function:

```tsx
const { data, refetch } = useAnalyticsSummary();

// Manually trigger a refetch
<button onClick={() => refetch()}>Refresh</button>
```

## Type Safety

All hooks are fully typed with TypeScript:

```typescript
type AnalyticsSummary = {
  totalUsers: number;
  activeUsers: number;
  newUsersLast30Days: number;
};

type RegistrationTrendPoint = {
  month: string;
  count: number;
};

type RoleBreakdownItem = {
  role: UserRole;
  count: number;
};

type StatusBreakdownItem = {
  status: UserStatus;
  count: number;
};
```
