'use client';

import * as React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ErrorNotificationProps {
  /**
   * The error message to display
   */
  message: string;
  /**
   * Callback function called when the notification is dismissed
   */
  onDismiss: () => void;
  /**
   * Optional additional CSS classes
   */
  className?: string;
}

/**
 * ErrorNotification Component
 * 
 * Displays error messages to the user with a dismiss button.
 * Error notifications remain visible until explicitly dismissed by the user.
 * 
 * @example
 * ```tsx
 * <ErrorNotification 
 *   message="Failed to load user data" 
 *   onDismiss={() => setError(null)} 
 * />
 * ```
 */
const ErrorNotification = React.forwardRef<
  HTMLDivElement,
  ErrorNotificationProps
>(({ message, onDismiss, className }, ref) => {
  return (
    <div
      ref={ref}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={cn(
        'flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 shadow-md',
        'animate-in slide-in-from-top-5 duration-300',
        className
      )}
    >
      {/* Error Icon */}
      <AlertCircle 
        className="h-5 w-5 flex-shrink-0 text-red-600 mt-0.5" 
        aria-hidden="true"
      />
      
      {/* Message Content */}
      <div className="flex-1 text-sm text-red-800">
        <p className="font-medium">Error</p>
        <p className="mt-1">{message}</p>
      </div>
      
      {/* Dismiss Button */}
      <button
        type="button"
        onClick={onDismiss}
        className={cn(
          'flex-shrink-0 rounded-md p-1 text-red-600 hover:bg-red-100',
          'focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2',
          'transition-colors'
        )}
        aria-label="Dismiss error notification"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
});

ErrorNotification.displayName = 'ErrorNotification';

export { ErrorNotification };
