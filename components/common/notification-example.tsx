/**
 * Notification Components Example
 * 
 * This file demonstrates how to use the notification components
 * in your application. This is NOT a production component - it's
 * just an example for developers.
 * 
 * DO NOT import this file in production code.
 */

'use client';

import * as React from 'react';
import { ErrorNotification, SuccessNotification, NotificationContainer } from './index';
import { Button } from '@/components/ui/button';

export function NotificationExample() {
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const showErrorNotification = () => {
    setError('Failed to save user data. Please try again.');
  };

  const showSuccessNotification = () => {
    setSuccess('User data saved successfully!');
  };

  const showMultipleNotifications = () => {
    setError('This is an error message that stays until dismissed');
    setTimeout(() => {
      setSuccess('This success message will auto-dismiss after 5 seconds');
    }, 500);
  };

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">Notification Components Example</h2>
      
      <div className="space-x-4">
        <Button onClick={showErrorNotification}>
          Show Error
        </Button>
        
        <Button onClick={showSuccessNotification}>
          Show Success
        </Button>
        
        <Button onClick={showMultipleNotifications}>
          Show Both (Stacked)
        </Button>
      </div>

      {/* Notification Container - positioned in top-right */}
      <NotificationContainer position="top-right">
        {error && (
          <ErrorNotification 
            message={error} 
            onDismiss={() => setError(null)} 
          />
        )}
        
        {success && (
          <SuccessNotification 
            message={success} 
            onDismiss={() => setSuccess(null)} 
          />
        )}
      </NotificationContainer>
    </div>
  );
}

/**
 * Typical Usage Pattern in a Page/Component:
 * 
 * ```tsx
 * 'use client';
 * 
 * import { useState } from 'react';
 * import { ErrorNotification, SuccessNotification, NotificationContainer } from '@/components/common';
 * 
 * export default function UserForm() {
 *   const [error, setError] = useState<string | null>(null);
 *   const [success, setSuccess] = useState<string | null>(null);
 *   
 *   const handleSubmit = async (data: UserData) => {
 *     try {
 *       await createUser(data);
 *       setSuccess('User created successfully!');
 *       setError(null);
 *     } catch (err) {
 *       setError(err.message || 'Failed to create user');
 *       setSuccess(null);
 *     }
 *   };
 *   
 *   return (
 *     <>
 *       <form onSubmit={handleSubmit}>
 *         {/* form fields *\/}
 *       </form>
 *       
 *       <NotificationContainer>
 *         {error && <ErrorNotification message={error} onDismiss={() => setError(null)} />}
 *         {success && <SuccessNotification message={success} onDismiss={() => setSuccess(null)} />}
 *       </NotificationContainer>
 *     </>
 *   );
 * }
 * ```
 */
