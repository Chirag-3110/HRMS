import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getTenants, type Tenant } from '@/lib/api/users';

/**
 * Custom React Query hook for fetching dynamic tenants/vendors list.
 * 
 * @returns React Query result with tenants list
 */
export function useTenants(): UseQueryResult<Tenant[], Error> {
  return useQuery({
    queryKey: ['tenants'],
    queryFn: getTenants,
    staleTime: 5 * 60 * 1000, // 5 minutes stale time
  });
}
