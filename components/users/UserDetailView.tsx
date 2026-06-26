/**
 * UserDetailView Component
 * 
 * Displays comprehensive user profile information with activity history.
 * 
 * Features:
 * - Display user fields: full name, email, phone number, role, account status, 
 *   registration date, last login date
 * - Render ActivityLog component with user activities
 * - Add "Edit" and status change action buttons
 * - Implement back navigation to user list
 * 
 * Validates Requirements:
 * - 4.1: Display detailed user view when a superadmin clicks on a user row
 * - 4.2: Display User_Profile information including all fields
 * - 4.3: Display the user's Activity_Log with the most recent 50 activities
 * - 9.1: Integrates ActivityLog component to display user activity history
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityLog } from './ActivityLog';
import type { UserDetailResponse } from '@/lib/api/users';
import type { UserRole, UserStatus } from '@/lib/schemas/user';

export interface UserDetailViewProps {
  /**
   * Complete user data including profile and activity history
   */
  user: UserDetailResponse;
  
  /**
   * Optional loading state
   */
  loading?: boolean;
  
  /**
   * Callback when Edit button is clicked
   */
  onEdit?: () => void;
  
  /**
   * Callback when status change button is clicked
   */
  onStatusChange?: (newStatus: UserStatus) => void;
}

/**
 * Format date to human-readable format
 */
function formatDate(isoDate: string | undefined): string {
  if (!isoDate) return 'Never';
  
  const date = new Date(isoDate);
  
  // Format: "January 15, 2024"
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  return date.toLocaleDateString('en-US', options);
}

/**
 * Format date with time to human-readable format
 */
function formatDateTime(isoDate: string | undefined): string {
  if (!isoDate) return 'Never';
  
  const date = new Date(isoDate);
  
  // Format: "January 15, 2024 at 3:45 PM"
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };
  
  const formattedDate = date.toLocaleDateString('en-US', dateOptions);
  const formattedTime = date.toLocaleTimeString('en-US', timeOptions);
  
  return `${formattedDate} at ${formattedTime}`;
}

/**
 * Get badge styling based on user status
 */
function getStatusBadgeClass(status: UserStatus): string {
  return status === 'active'
    ? 'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-green-100 text-green-700'
    : 'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-red-100 text-red-700';
}

/**
 * Get badge styling based on user role
 */
function getRoleBadgeClass(role: UserRole): string {
  const baseClass =
    'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium';
  
  switch (role) {
    case 'Admin':
      return `${baseClass} bg-purple-100 text-purple-700`;
    case 'Member':
      return `${baseClass} bg-blue-100 text-blue-700`;
    case 'Guest':
      return `${baseClass} bg-gray-100 text-gray-700`;
    default:
      return `${baseClass} bg-gray-100 text-gray-700`;
  }
}

/**
 * UserDetailView Component
 */
export function UserDetailView({
  user,
  loading = false,
  onEdit,
  onStatusChange,
}: UserDetailViewProps) {
  const router = useRouter();
  
  /**
   * Handle back navigation to user list
   */
  const handleBack = () => {
    router.push('/users');
  };
  
  /**
   * Handle status change action
   */
  const handleStatusChange = () => {
    if (onStatusChange) {
      const newStatus: UserStatus = user.status === 'active' ? 'deactivated' : 'active';
      onStatusChange(newStatus);
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 animate-pulse rounded" />
        <div className="h-96 bg-gray-200 animate-pulse rounded" />
        <div className="h-64 bg-gray-200 animate-pulse rounded" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header with back navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
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
        
        {/* Action buttons */}
        <div className="flex items-center gap-3">
          {onStatusChange && (
            <Button
              variant="outline"
              onClick={handleStatusChange}
              className={user.status === 'active' ? 'border-red-300 text-red-600 hover:bg-red-50' : ''}
            >
              {user.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
            </Button>
          )}
          {onEdit && (
            <Button variant="default" onClick={onEdit}>
              Edit User
            </Button>
          )}
        </div>
      </div>
      
      {/* User Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{user.fullName}</CardTitle>
              <CardDescription className="text-base mt-1">
                User ID: {user.id}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className={getRoleBadgeClass(user.role)}>{user.role}</span>
              <span className={getStatusBadgeClass(user.status)}>
                {user.status === 'active' ? 'Active' : 'Deactivated'}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Email Address</label>
                  <p className="text-base text-gray-900 mt-1">{user.email}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone Number</label>
                  <p className="text-base text-gray-900 mt-1">
                    {user.phoneNumber || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Role</label>
                  <p className="text-base text-gray-900 mt-1">{user.role}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Account Status</label>
                  <p className="text-base text-gray-900 mt-1">
                    {user.status === 'active' ? 'Active' : 'Deactivated'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Registration Date</label>
                  <p className="text-base text-gray-900 mt-1">
                    {formatDate(user.registrationDate)}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Login</label>
                  <p className="text-base text-gray-900 mt-1">
                    {formatDateTime(user.lastLoginDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Activity Log Section */}
      <Card>
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
          <CardDescription>
            Recent activities and actions performed by this user
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityLog activities={user.activities} />
        </CardContent>
      </Card>
    </div>
  );
}
