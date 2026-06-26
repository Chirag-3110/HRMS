/**
 * MSW Provider Component
 * 
 * Initializes Mock Service Worker for development mode.
 * This allows the app to work without a real backend API.
 */

'use client';

import { useEffect, useState } from 'react';

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [isMswReady, setIsMswReady] = useState(false);

  useEffect(() => {
    // Only enable MSW in development mode
    if (process.env.NODE_ENV === 'development') {
      import('../lib/mocks/browser').then(({ worker }) => {
        worker.start({
          onUnhandledRequest: 'bypass', // Don't warn about non-API requests
        }).then(() => {
          setIsMswReady(true);
          console.log('[MSW] Mock API enabled ✓');
        });
      });
    } else {
      setIsMswReady(true);
    }
  }, []);

  // Show loading state while MSW is initializing
  if (!isMswReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing mock API...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
