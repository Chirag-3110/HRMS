import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, BarChart3, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

/**
 * Dashboard Home Page
 * 
 * Main landing page after authentication.
 * Provides navigation to key admin features.
 * 
 * TODO: Replace with analytics dashboard (Task 12.5)
 */
export default async function Home() {
  // Check authentication
  const session = await getServerSession(authOptions);

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Phelbo Superadmin Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {session.user.name} ({session.user.email})
              </span>
              <Link href="/api/auth/signout">
                <Button variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {session.user.name}!
          </h2>
          <p className="text-lg text-gray-600">
            Manage your Phelbo platform from here.
          </p>
        </div>

        {/* Quick Access Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* User Management Card */}
          <Link href="/users">
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  User Management
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                View, search, and manage all Phelbo users. Create new users, update roles, and control account statuses.
              </p>
              <div className="flex items-center text-sm font-medium text-blue-600">
                Go to Users
                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Analytics Card (Coming Soon) */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 opacity-60">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Analytics Dashboard
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              View user statistics, registration trends, and platform analytics.
            </p>
            <div className="flex items-center text-sm font-medium text-gray-400">
              Coming Soon (Task 12.5)
            </div>
          </div>

          {/* System Status Card (Coming Soon) */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 opacity-60">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                System Status
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Monitor system health, API status, and platform performance metrics.
            </p>
            <div className="flex items-center text-sm font-medium text-gray-400">
              Coming Soon
            </div>
          </div>
        </div>

        {/* Feature Status */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            ✅ Implemented Features
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• User authentication and session management</li>
            <li>• User list with search, filtering, and pagination</li>
            <li>• User detail view with activity logs (in progress)</li>
            <li>• User creation and editing (in progress)</li>
          </ul>
          <h3 className="text-sm font-semibold text-blue-900 mt-4 mb-2">
            🚧 In Progress
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Analytics dashboard (Task 12)</li>
            <li>• Dashboard layout with navigation (Task 13)</li>
            <li>• CSV export functionality (Task 7.2)</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
