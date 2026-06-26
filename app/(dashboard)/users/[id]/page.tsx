/**
 * User Detail Page
 * 
 * Displays comprehensive user profile information with activity history.
 * Uses the useUserDetail hook to fetch data and the UserDetailView component
 * to render the user information.
 * 
 * Features:
 * - Fetch user detail using useUserDetail hook
 * - Display UserDetailView component with user data
 * - Handle loading states with skeleton UI
 * - Handle error states with error notification
 * - Handle user not found (404) errors
 * - Edit functionality with UserForm component (Task 10.4)
 * - Toggle between view and edit modes
 * - Update user data with optimistic updates
 * 
 * Validates Requirements:
 * - 4.1: Display detailed user view when accessing user detail route
 * - 4.2: Display User_Profile information including all fields
 * - 4.3: Display the user's Activity_Log with the most recent 50 activities
 * - 6.1: Edit button and form
 * - 6.2: Pre-populate edit form with current data
 * - 6.3: Allow modification of name, email, phone, role
 * - 6.4: Update user information
 * - 6.5: Display error for duplicate email
 * - 6.6: Display updated information after successful edit
 * 
 * Tasks: 9.5 Create user detail page, 10.4 Add edit functionality
 */

'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { UserDetailView } from '@/components/users/UserDetailView';
import { UserForm } from '@/components/users/UserForm';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ErrorNotification } from '@/components/common/ErrorNotification';
import { SuccessNotification } from '@/components/common/SuccessNotification';
import { NotificationContainer } from '@/components/common/NotificationContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserDetail } from '@/lib/hooks/useUserDetail';
import { useUpdateUser } from '@/lib/hooks/useUserMutations';
import { AlertCircle } from 'lucide-react';
import type { UpdateUserFormData } from '@/lib/schemas/user';

/**
 * User Detail Page Component
 * 
 * Fetches and displays detailed user information including profile data
 * and activity history. Handles loading and error states appropriately.
 */
export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  // Fetch user detail data using custom hook
  const { data: user, isLoading, error } = useUserDetail(userId);

  // Update user mutation hook
  const updateUserMutation = useUpdateUser(userId);

  // Local state for edit mode toggle
  const [isEditMode, setIsEditMode] = React.useState(false);

  // Local state for dismissible error notification
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Local state for success notification
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  /**
   * Sync API errors to error notification state
   */
  React.useEffect(() => {
    if (error) {
      setErrorMessage(error.message || 'Failed to load user details. Please try again.');
    }
  }, [error]);

  /**
   * Sync mutation errors to error notification state
   */
  React.useEffect(() => {
    if (updateUserMutation.isError) {
      const mutationError = updateUserMutation.error as Error;
      setErrorMessage(mutationError.message || 'Failed to update user. Please try again.');
    }
  }, [updateUserMutation.isError, updateUserMutation.error]);

  /**
   * Handle navigation back to user list
   */
  const handleBackToList = React.useCallback(() => {
    router.push('/users');
  }, [router]);

  /**
   * Handle toggling to edit mode
   */
  const handleEdit = React.useCallback(() => {
    setIsEditMode(true);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, []);

  /**
   * Handle canceling edit mode
   */
  const handleCancelEdit = React.useCallback(() => {
    setIsEditMode(false);
    setErrorMessage(null);
  }, []);

  /**
   * Handle form submission for user update
   * Requirement 6.4: Update user information
   * Requirement 6.6: Display success message and updated information
   */
  const handleUpdateUser = React.useCallback(
    async (data: UpdateUserFormData) => {
      try {
        await updateUserMutation.mutateAsync(data);
        
        // Show success notification
        setSuccessMessage('User updated successfully');
        
        // Exit edit mode
        setIsEditMode(false);
        
        // Clear error message if any
        setErrorMessage(null);
      } catch (err) {
        // Error handling is managed by the mutation hook and useEffect
        // The error notification will be displayed automatically
        console.error('Error updating user:', err);
      }
    },
    [updateUserMutation]
  );

  /**
   * Loading State - Display skeleton UI while fetching user data
   * Requirement 14.1: Display loading skeletons during data fetch
   */
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
          <div className="flex gap-3">
            <div className="h-10 w-40 bg-gray-200 animate-pulse rounded" />
            <div className="h-10 w-32 bg-gray-200 animate-pulse rounded" />
          </div>
        </div>
        
        {/* User profile card skeleton */}
        <div className="h-96 bg-gray-200 animate-pulse rounded-lg" />
        
        {/* Activity log skeleton */}
        <div className="h-64 bg-gray-200 animate-pulse rounded-lg" />
      </div>
    );
  }

  /**
   * Error State - Display error notification when user fetch fails
   * Requirement 11.1: Display error notification with descriptive message
   */
  if (error || !user) {
    const is404Error = error?.message?.includes('not found') || error?.message?.includes('404');
    
    return (
      <div className="flex flex-col gap-6 p-6">
        {/* Error Notification */}
        {errorMessage && (
          <ErrorNotification
            message={errorMessage}
            onDismiss={() => setErrorMessage(null)}
          />
        )}

        {/* User Not Found State */}
        {is404Error ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-20">
            <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">User Not Found</h2>
            <p className="text-gray-600 mb-6">
              The user you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={handleBackToList} variant="default">
              Back to Users List
            </Button>
          </div>
        ) : (
          /* Generic Error State */
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-20">
            <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Error Loading User</h2>
            <p className="text-gray-600 mb-6">
              We couldn't load the user details. Please try again.
            </p>
            <div className="flex gap-3">
              <Button onClick={() => window.location.reload()} variant="default">
                Retry
              </Button>
              <Button onClick={handleBackToList} variant="outline">
                Back to Users List
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  /**
   * Success State - Display user detail view with full user information
   * OR display edit form when in edit mode
   * Requirements:
   * - 4.1: Display detailed user view
   * - 4.2: Display complete user profile information
   * - 4.3: Display user's activity log with recent activities
   * - 6.1: Edit button and form
   * - 6.2: Pre-populate edit form with current data
   * - 6.3: Allow modification of name, email, phone, role
   */
  return (
    <div className="p-6">
      {/* Notification Container */}
      <NotificationContainer position="top-right">
        {errorMessage && (
          <ErrorNotification
            message={errorMessage}
            onDismiss={() => setErrorMessage(null)}
          />
        )}
        {successMessage && (
          <SuccessNotification
            message={successMessage}
            onDismiss={() => setSuccessMessage(null)}
          />
        )}
      </NotificationContainer>

      {/* Edit Mode - Display UserForm with pre-populated data */}
      {isEditMode ? (
        <div className="space-y-6">
          {/* Header with back navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToList}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg
                  className="w-5 h-5 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Users
              </Button>
            </div>
          </div>

          {/* Edit User Form Card */}
          <Card>
            <CardHeader>
              <CardTitle>Edit User</CardTitle>
              <CardDescription>
                Update user information for {user.fullName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserForm
                mode="edit"
                initialData={{
                  email: user.email,
                  fullName: user.fullName,
                  phoneNumber: user.phoneNumber,
                  role: user.role,
                }}
                onSubmit={handleUpdateUser}
                onCancel={handleCancelEdit}
                isLoading={updateUserMutation.isPending}
              />
            </CardContent>
          </Card>
        </div>
      ) : (
        /* View Mode - Display UserDetailView */
        <UserDetailView
          user={user}
          loading={false}
          onEdit={handleEdit}
          onStatusChange={(newStatus) => {
            // TODO: Implement status change functionality in task 11.1
            console.log('Change status to:', newStatus);
          }}
        />
      )}
    </div>
  );
}
