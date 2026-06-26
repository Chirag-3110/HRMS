import { QueryClient } from '@tanstack/react-query';

/**
 * TanStack Query client configuration
 * 
 * Configured with:
 * - 30 second stale time for data freshness
 * - 5 minute cache time for garbage collection
 * - Disabled refetch on window focus
 * - 2 retry attempts for failed requests
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
      gcTime: 300000, // 5 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});
