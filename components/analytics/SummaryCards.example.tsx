/**
 * Example usage of SummaryCards component
 * 
 * This file demonstrates how to use the SummaryCards component
 * in a dashboard page or analytics view.
 */

import { SummaryCards } from './SummaryCards';

/**
 * Example 1: Basic usage
 * 
 * The component handles its own data fetching, loading states, and error states.
 * Simply render it in your page and it will fetch and display analytics data.
 */
export function BasicExample() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
      <SummaryCards />
    </div>
  );
}

/**
 * Example 2: In a dashboard layout with other components
 * 
 * The SummaryCards component works well with other analytics components
 * in a comprehensive dashboard view.
 */
export function DashboardExample() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of user statistics and analytics
        </p>
      </div>

      {/* Summary Cards */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Summary</h2>
        <SummaryCards />
      </section>

      {/* Other analytics components can go here */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Trends</h2>
        {/* RegistrationTrendChart component would go here */}
      </section>
    </div>
  );
}

/**
 * Example 3: With custom wrapper styling
 * 
 * You can wrap the SummaryCards in custom containers for different layouts.
 */
export function CustomStyledExample() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">User Statistics</h1>
          <SummaryCards />
        </div>
      </div>
    </div>
  );
}

/**
 * Example 4: In a grid with other content
 * 
 * The responsive grid layout of SummaryCards adapts well to different page layouts.
 */
export function GridLayoutExample() {
  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Summary cards take full width on mobile, half width on desktop */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Overview</h2>
          <SummaryCards />
        </div>

        {/* Other content */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          {/* Activity list would go here */}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          {/* Quick action buttons would go here */}
        </div>
      </div>
    </div>
  );
}
