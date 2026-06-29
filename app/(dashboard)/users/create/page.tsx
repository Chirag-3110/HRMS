/**
 * User Creation Page
 * 
 * Provides a form for creating new user accounts in the Phelbo platform.
 * Uses the UserForm component with the useUserMutations hook to handle
 * form submission and user creation.
 * 
 * Features:
 * - Render UserForm component in 'create' mode
 * - Handle form submission with createUser mutation
 * - Display success notification on successful creation
 * - Display error notification on failure (duplicate email, validation errors)
 * - Redirect to user list after successful creation
 * - Handle cancel action to return to user list
 * - Proper loading states during submission
 * 
 * Validates Requirements:
 * - 5.1: Provide "Create User" form accessible via button
 * - 5.2: Require email, full name, and role fields
 * - 5.3: Create user account via User_Management_Service
 * - 5.4: Display error for duplicate email
 * - 5.5: Display field-specific validation errors
 * - 5.6: Display success message and navigate to user list
 * 
 * Task: 10.3 Create user creation page
 */

'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserForm } from '@/components/users/UserForm';
import { ErrorNotification } from '@/components/common/ErrorNotification';
import { SuccessNotification } from '@/components/common/SuccessNotification';
import { useCreateUser } from '@/lib/hooks/useUserMutations';
import type { CreateUserFormData, UpdateUserFormData } from '@/lib/schemas/user';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * User Creation Form Content Component
 * 
 * Wrapped in Suspense because it calls useSearchParams() which can bail out of static rendering.
 */
function CreateUserFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantId = searchParams.get('tenantId') || undefined;
  
  // Local state for notifications
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  /**
   * Initialize create user mutation hook
   * Provides mutate function, loading state, and error handling
   */
  const createUserMutation = useCreateUser({
    onSuccess: (data) => {
      // Display success notification
      setSuccessMessage(`User "${data.fullName}" created successfully`);
      
      // Clear any previous error messages
      setErrorMessage(null);
      
      // Redirect to user list after 1.5 seconds to allow user to see success message
      // Requirement 5.6: Display success message and add new user to list
      setTimeout(() => {
        router.push('/users');
      }, 1500);
    },
    onError: (error) => {
      // Parse and display error message
      // Requirement 5.4: Display error for duplicate email
      // Requirement 5.5: Display field-specific validation errors
      const errorMsg = error.message || 'Failed to create user. Please try again.';
      
      // Check for specific error types
      if (errorMsg.toLowerCase().includes('already exists') || 
          errorMsg.toLowerCase().includes('duplicate')) {
        setErrorMessage('A user with this email address already exists. Please use a different email.');
      } else if (errorMsg.toLowerCase().includes('validation')) {
        setErrorMessage('Please check the form fields and ensure all required information is valid.');
      } else {
        setErrorMessage(errorMsg);
      }
      
      // Clear any previous success messages
      setSuccessMessage(null);
    },
  });

  /**
   * Handle form submission
   * Validates data and calls createUser mutation
   * 
   * @param data - User form data from UserForm component
   */
  const handleSubmit = React.useCallback(
    async (data: CreateUserFormData | UpdateUserFormData) => {
      // Clear any previous notifications
      setErrorMessage(null);
      setSuccessMessage(null);
      
      // Submit user creation request
      // Requirement 5.3: Create user account via User_Management_Service
      createUserMutation.mutate({
        ...(data as CreateUserFormData),
        tenantId,
      });
    },
    [createUserMutation, tenantId]
  );

  /**
   * Handle cancel action
   * Returns user to the user list page
   */
  const handleCancel = React.useCallback(() => {
    router.push('/users');
  }, [router]);

  /**
   * Handle back to list navigation
   */
  const handleBackToList = React.useCallback(() => {
    router.push('/users');
  }, [router]);

  return (
    <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackToList}
          className="flex items-center gap-2"
          aria-label="Back to users list"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New User</h1>
          <p className="mt-1 text-sm text-gray-500">
            Add a new user to the Phelbo platform
          </p>
        </div>
      </div>

      {/* Success Notification */}
      {/* Requirement 5.6: Display success message */}
      {successMessage && (
        <SuccessNotification
          message={successMessage}
          onDismiss={() => setSuccessMessage(null)}
        />
      )}

      {/* Error Notification */}
      {/* Requirement 5.4: Display error for duplicate email */}
      {/* Requirement 5.5: Display field-specific validation errors */}
      {errorMessage && (
        <ErrorNotification
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
        />
      )}

      {/* User Creation Form */}
      {/* Requirement 5.1: Provide "Create User" button that opens creation form */}
      {/* Requirement 5.2: Require email, full name, and role fields */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <UserForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createUserMutation.isPending}
        />
      </div>

      {/* Help Text */}
      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> After creating a user, they will receive a welcome email
          with instructions to set up their account and password.
        </p>
      </div>
    </div>
  );
}

/**
 * User Creation Page Component
 * 
 * Provides the interface for superadmins to create new Phelbo users.
 * Handles form submission, error handling, and success feedback.
 * Wrapped in Suspense to satisfy Next.js static site generation requirements for useSearchParams.
 */
export default function CreateUserPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-12 max-w-3xl mx-auto">
        <p className="text-slate-500 font-sans">Loading creation form...</p>
      </div>
    }>
      <CreateUserFormContent />
    </Suspense>
  );
}
