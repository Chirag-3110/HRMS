'use client';

/**
 * LoadingSkeleton Usage Examples
 * 
 * This file demonstrates various use cases for the LoadingSkeleton component.
 * These examples can be used in storybooks or for development reference.
 */

import { LoadingSkeleton } from './LoadingSkeleton';

export function LoadingSkeletonExamples() {
  return (
    <div className="space-y-8 p-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">LoadingSkeleton Component Examples</h2>
        <p className="text-gray-600 mb-6">
          The LoadingSkeleton component provides three variants for different content types.
        </p>
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-3">Table Variant</h3>
        <p className="text-sm text-gray-600 mb-4">
          Use this variant when loading tabular data. Customize the number of rows with the `rows` prop.
        </p>
        <div className="border rounded-lg p-4 bg-white">
          <LoadingSkeleton variant="table" rows={5} />
        </div>
        <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto">
{`<LoadingSkeleton variant="table" rows={5} />`}
        </pre>
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-3">Card Variant (Default)</h3>
        <p className="text-sm text-gray-600 mb-4">
          Use this variant when loading card-based content or general content sections.
        </p>
        <div className="max-w-md">
          <LoadingSkeleton variant="card" />
        </div>
        <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto">
{`<LoadingSkeleton variant="card" />
// or simply
<LoadingSkeleton />`}
        </pre>
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-3">Chart Variant</h3>
        <p className="text-sm text-gray-600 mb-4">
          Use this variant when loading analytics charts or data visualizations.
        </p>
        <div className="max-w-2xl">
          <LoadingSkeleton variant="chart" />
        </div>
        <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto">
{`<LoadingSkeleton variant="chart" />`}
        </pre>
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-3">Custom Styling</h3>
        <p className="text-sm text-gray-600 mb-4">
          Add custom classes with the `className` prop for additional styling.
        </p>
        <div className="max-w-md">
          <LoadingSkeleton 
            variant="card" 
            className="opacity-75 border-2 border-blue-200" 
          />
        </div>
        <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto">
{`<LoadingSkeleton 
  variant="card" 
  className="opacity-75 border-2 border-blue-200" 
/>`}
        </pre>
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-3">Real-World Usage Example</h3>
        <p className="text-sm text-gray-600 mb-4">
          Example of using LoadingSkeleton in a data fetching scenario.
        </p>
        <pre className="p-3 bg-gray-100 rounded text-xs overflow-x-auto">
{`import { LoadingSkeleton } from '@/components/common';
import { useUsers } from '@/lib/hooks/useUsers';

export function UserListPage() {
  const { data, isLoading, error } = useUsers();

  if (isLoading) {
    return <LoadingSkeleton variant="table" rows={10} />;
  }

  if (error) {
    return <ErrorNotification message="Failed to load users" />;
  }

  return <UserTable users={data.users} />;
}`}
        </pre>
      </section>

      <section className="border-t pt-6">
        <h3 className="text-xl font-semibold mb-3">Accessibility Features</h3>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
          <li>Uses <code className="bg-gray-100 px-1 rounded">role="status"</code> for screen reader announcements</li>
          <li>Includes variant-specific <code className="bg-gray-100 px-1 rounded">aria-label</code> attributes</li>
          <li>Skeleton elements marked with <code className="bg-gray-100 px-1 rounded">aria-hidden="true"</code></li>
          <li>Visually hidden "Loading..." text via <code className="bg-gray-100 px-1 rounded">sr-only</code> class</li>
          <li>Follows WCAG 2.1 Level AA guidelines</li>
        </ul>
      </section>
    </div>
  );
}

/**
 * Example: Conditional loading states in a component
 */
export function ConditionalLoadingExample() {
  const isLoadingUsers = false; // Replace with actual loading state
  const isLoadingChart = false; // Replace with actual loading state

  return (
    <div className="space-y-4">
      {isLoadingUsers ? (
        <LoadingSkeleton variant="table" rows={8} />
      ) : (
        <div>User table content here</div>
      )}

      {isLoadingChart ? (
        <LoadingSkeleton variant="chart" />
      ) : (
        <div>Chart content here</div>
      )}
    </div>
  );
}
