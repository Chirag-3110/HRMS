'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { queryClient } from '@/lib/query-client';

/**
 * Application providers wrapper
 * 
 * Wraps the application with:
 * - SessionProvider for NextAuth.js authentication
 * - QueryClientProvider for TanStack Query state management
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}
