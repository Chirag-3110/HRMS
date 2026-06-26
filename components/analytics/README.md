# Analytics Components

This directory contains React components for analytics visualization.

## Implemented Components

### SummaryCards.tsx ✅

Displays three key user metrics in a responsive card layout:
- **Total Users**: All registered users in the system
- **Active Users**: Users with active status
- **New Users**: Users registered in the last 30 days

**Features:**
- Responsive grid layout (1 column mobile, 3 columns desktop)
- Number formatting with commas for thousands (e.g., 1,234,567)
- Icons from lucide-react (Users, UserCheck, UserPlus)
- Loading skeleton states
- Error state handling
- Empty state handling
- Accessibility compliant (ARIA labels, semantic HTML)

**Usage:**
```tsx
import { SummaryCards } from '@/components/analytics/SummaryCards';

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <SummaryCards />
    </div>
  );
}
```

The component handles its own data fetching using the `useAnalyticsSummary` hook.

**Tests:**
- Unit tests: `__tests__/SummaryCards.test.tsx` (16 tests, all passing)
- Covers loading states, success states, error states, empty states, number formatting, accessibility, and styling

## Components to be implemented:

- `RegistrationTrendChart.tsx` - Visualize user registrations over time (12-month trend)
- `RoleBreakdownChart.tsx` - Show user distribution by role (pie chart)
- `StatusBreakdownChart.tsx` - Show user distribution by status (bar chart)

All chart components use Recharts library.
