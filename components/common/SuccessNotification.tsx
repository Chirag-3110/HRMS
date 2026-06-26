'use client';

import * as React from 'react';
import { X, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SuccessNotificationProps {
  /**
   * The success message to display
   */
  message: string;
  /**
   * Optional callback function called when the notification is dismissed
   * (either automatically after 5 seconds or manually)
   */
  onDismiss?: () => void;
  /**
   * Duration in milliseconds before auto-dismiss
   * @default 5000 (5 seconds)
   */
  duration?: number;
  /**
   * Optional additional CSS classes
   */
  className?: string;
}

/**
 * SuccessNotification Component
 * 
 * Displays success messages to the user with automatic dismissal after 5 seconds.
 * Users can also manually dismiss the notification before auto-dismiss.
 * 
 * @example
 * ```tsx
 * <SuccessNotification 
 *   message="User created successfully" 
 *   onDismiss={() => setSuccess(null)} 
 * />
 * ```
 */
const SuccessNotification = React.forwardRef<
  HTMLDivElement,
  SuccessNotificationProps
>(({ message, onDismiss, duration = 5000, className }, ref) => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    // Set up auto-dismiss timer
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Call onDismiss after animation completes
      setTimeout(() => {
        onDismiss?.();
      }, 300); // Match animation duration
    }, duration);

    // Clean up timer on unmount
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    // Call onDismiss after animation completes
    setTimeout(() => {
      onDismiss?.();
    }, 300); // Match animation duration
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        'flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 shadow-md',
        'animate-in slide-in-from-top-5 duration-300',
        className
      )}
    >
      {/* Success Icon */}
      <CheckCircle 
        className="h-5 w-5 flex-shrink-0 text-green-600 mt-0.5" 
        aria-hidden="true"
      />
      
      {/* Message Content */}
      <div className="flex-1 text-sm text-green-800">
        <p className="font-medium">Success</p>
        <p className="mt-1">{message}</p>
      </div>
      
      {/* Dismiss Button */}
      <button
        type="button"
        onClick={handleDismiss}
        className={cn(
          'flex-shrink-0 rounded-md p-1 text-green-600 hover:bg-green-100',
          'focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2',
          'transition-colors'
        )}
        aria-label="Dismiss success notification"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
});

SuccessNotification.displayName = 'SuccessNotification';

export { SuccessNotification };
