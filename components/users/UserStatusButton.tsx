/**
 * UserStatusButton Component
 * 
 * A reusable button component for toggling user account status between 
 * active and deactivated. Provides visual feedback, confirmation dialogs,
 * and integrates with the user management system.
 * 
 * Features:
 * - Display current user status (active/suspended)
 * - Toggle status between active and suspended
 * - Confirmation dialog before status change
 * - Loading states during status updates
 * - Success/error notifications
 * - Visual states (active = green, suspended/deactivated = red)
 * - Optimistic UI updates via useUpdateUserStatus hook
 * 
 * Validates Requirements:
 * - 7.1: Display appropriate action button based on status
 * - 7.2: Display appropriate action button based on status
 * - 7.3: Show confirmation dialog before status change
 * - 7.4: Update user status via User_Management_Service
 * - 7.5: Update user status via User_Management_Service
 * - 7.6: Update status display immediately after successful change
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SuccessNotification } from '@/components/common/SuccessNotification';
import { ErrorNotification } from '@/components/common/ErrorNotification';
import { useUpdateUserStatus } from '@/lib/hooks/useUserMutations';
import type { UserStatus } from '@/lib/schemas/user';
import { cn } from '@/lib/utils';

export interface UserStatusButtonProps {
  /**
   * The ID of the user whose status will be changed
   */
  userId: string;
  
  /**
   * The current status of the user account
   */
  currentStatus: UserStatus;
  
  /**
   * Optional callback when status change succeeds
   */
  onStatusChange?: (newStatus: UserStatus) => void;
  
  /**
   * Optional button variant
   * @default "outline"
   */
  variant?: 'default' | 'outline' | 'ghost';
  
  /**
   * Optional button size
   * @default "default"
   */
  size?: 'default' | 'sm' | 'lg';
  
  /**
   * Optional additional CSS classes
   */
  className?: string;
}

/**
 * UserStatusButton Component
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <UserStatusButton 
 *   userId="user123" 
 *   currentStatus="active" 
 * />
 * 
 * // With callback
 * <UserStatusButton 
 *   userId="user456" 
 *   currentStatus="deactivated"
 *   onStatusChange={(newStatus) => console.log('Status changed to:', newStatus)}
 * />
 * ```
 */
export function UserStatusButton({
  userId,
  currentStatus,
  onStatusChange,
  variant = 'outline',
  size = 'default',
  className,
}: UserStatusButtonProps) {
  // State management
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Determine the target status (opposite of current)
  const targetStatus: UserStatus = currentStatus === 'active' ? 'deactivated' : 'active';
  
  // Initialize mutation hook
  const { mutate: updateStatus, isPending } = useUpdateUserStatus(userId, {
    onSuccess: (data) => {
      // Close confirmation dialog
      setShowConfirmDialog(false);
      
      // Show success notification
      const message = data.status === 'active' 
        ? 'User account activated successfully'
        : 'User account deactivated successfully';
      setSuccessMessage(message);
      
      // Call optional callback
      onStatusChange?.(data.status);
    },
    onError: (error) => {
      // Close confirmation dialog
      setShowConfirmDialog(false);
      
      // Show error notification
      const message = error instanceof Error 
        ? error.message 
        : 'Failed to update user status. Please try again.';
      setErrorMessage(message);
    },
  });
  
  /**
   * Handle button click - open confirmation dialog
   */
  const handleButtonClick = () => {
    setShowConfirmDialog(true);
  };
  
  /**
   * Handle confirmation - execute status change
   */
  const handleConfirm = () => {
    updateStatus({ status: targetStatus });
  };
  
  /**
   * Handle cancel - close dialog
   */
  const handleCancel = () => {
    setShowConfirmDialog(false);
  };
  
  /**
   * Get button text based on target status
   */
  const getButtonText = () => {
    if (isPending) {
      return targetStatus === 'active' ? 'Activating...' : 'Deactivating...';
    }
    return targetStatus === 'active' ? 'Activate Account' : 'Deactivate Account';
  };
  
  /**
   * Get button styling based on target action
   */
  const getButtonClassName = () => {
    if (targetStatus === 'deactivated') {
      // Deactivate button (current status is active) - use red styling
      return 'border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400';
    }
    // Activate button (current status is deactivated) - use green styling
    return 'border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400';
  };
  
  /**
   * Get dialog content based on target action
   */
  const getDialogContent = () => {
    if (targetStatus === 'active') {
      return {
        title: 'Activate User Account',
        description: 'Are you sure you want to activate this user account? The user will be able to access the platform and all associated features.',
        confirmButton: 'Activate Account',
        confirmClass: 'bg-green-600 hover:bg-green-700 text-white',
      };
    }
    return {
      title: 'Deactivate User Account',
      description: 'Are you sure you want to deactivate this user account? The user will lose access to the platform and all active sessions will be revoked. This action can be reversed later.',
      confirmButton: 'Deactivate Account',
      confirmClass: 'bg-red-600 hover:bg-red-700 text-white',
    };
  };
  
  const dialogContent = getDialogContent();
  
  return (
    <>
      {/* Status Toggle Button */}
      <Button
        variant={variant}
        size={size}
        onClick={handleButtonClick}
        disabled={isPending}
        className={cn(
          variant === 'outline' && getButtonClassName(),
          className
        )}
        aria-label={getButtonText()}
      >
        {getButtonText()}
      </Button>
      
      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogContent.title}</DialogTitle>
            <DialogDescription>{dialogContent.description}</DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isPending}
              className={dialogContent.confirmClass}
            >
              {isPending ? 'Processing...' : dialogContent.confirmButton}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Success Notification */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <SuccessNotification
            message={successMessage}
            onDismiss={() => setSuccessMessage(null)}
          />
        </div>
      )}
      
      {/* Error Notification */}
      {errorMessage && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <ErrorNotification
            message={errorMessage}
            onDismiss={() => setErrorMessage(null)}
          />
        </div>
      )}
    </>
  );
}
