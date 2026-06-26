'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface NotificationContainerProps {
  /**
   * Child notification components
   */
  children: React.ReactNode;
  /**
   * Position of the notification container
   * @default 'top-right'
   */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
  /**
   * Optional additional CSS classes
   */
  className?: string;
}

/**
 * NotificationContainer Component
 * 
 * A container for stacking multiple notification components.
 * Positions notifications in a corner or top-center of the viewport.
 * 
 * @example
 * ```tsx
 * <NotificationContainer position="top-right">
 *   {error && <ErrorNotification message={error} onDismiss={() => setError(null)} />}
 *   {success && <SuccessNotification message={success} onDismiss={() => setSuccess(null)} />}
 * </NotificationContainer>
 * ```
 */
export const NotificationContainer = React.forwardRef<
  HTMLDivElement,
  NotificationContainerProps
>(({ children, position = 'top-right', className }, ref) => {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'fixed z-50 flex flex-col gap-3 w-full max-w-md pointer-events-none',
        positionClasses[position],
        className
      )}
      aria-live="polite"
      aria-atomic="false"
    >
      <div className="flex flex-col gap-3 pointer-events-auto">
        {children}
      </div>
    </div>
  );
});

NotificationContainer.displayName = 'NotificationContainer';
