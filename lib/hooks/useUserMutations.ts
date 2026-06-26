/**
 * Custom hooks for user mutations
 * 
 * This module provides TanStack Query mutation hooks for user management:
 * - Create new users
 * - Update user information
 * - Change user status (activate/deactivate)
 * - Update user roles
 * 
 * All mutations implement:
 * - Optimistic updates for immediate UI feedback
 * - Cache invalidation after successful mutations
 * - Error handling with rollback on failure
 * 
 * Validates Requirements:
 * - 5.3: Create user accounts
 * - 5.6: Display success message and add new user to list
 * - 6.4: Update user information
 * - 6.6: Display updated information
 * - 7.4: Change user status
 * - 7.6: Update user status display immediately
 * - 8.3: Update user role
 * - 8.4: Update user profile display
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createUser, updateUser, updateStatus } from '../api/users';
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateStatusRequest,
  PaginatedUsersResponse,
} from '../api/users';
import type { UserRole } from '../schemas/user';

/**
 * Mutation options for callbacks
 */
interface MutationCallbacks<TData = User, TVariables = unknown> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
}

/**
 * Hook for creating a new user
 * 
 * Features:
 * - Optimistically adds user to the cache
 * - Invalidates user list queries on success
 * - Rolls back on error
 * 
 * @param callbacks - Optional success and error callbacks
 * @returns Mutation object with mutate function and status
 * 
 * Validates Requirements: 5.3, 5.6
 */
export function useCreateUser(callbacks?: MutationCallbacks<User, CreateUserRequest>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    
    onMutate: async (newUser) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['users'] });

      // Snapshot the previous value
      const previousUsers = queryClient.getQueriesData<PaginatedUsersResponse>({ 
        queryKey: ['users'] 
      });

      // Optimistically update to the new value
      queryClient.setQueriesData<PaginatedUsersResponse>(
        { queryKey: ['users'] },
        (old) => {
          if (!old) return old;
          
          // Create optimistic user object
          const optimisticUser: User = {
            id: `temp-${Date.now()}`, // Temporary ID
            email: newUser.email,
            fullName: newUser.fullName,
            phoneNumber: newUser.phoneNumber,
            role: newUser.role,
            status: 'active',
            registrationDate: new Date().toISOString(),
          };

          return {
            ...old,
            users: [optimisticUser, ...old.users],
            pagination: {
              ...old.pagination,
              totalCount: old.pagination.totalCount + 1,
            },
          };
        }
      );

      // Return context with the previous data for rollback
      return { previousUsers };
    },

    onError: (error, variables, context) => {
      // Rollback to previous data on error
      if (context?.previousUsers) {
        context.previousUsers.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      
      // Call optional error callback
      callbacks?.onError?.(error, variables);
    },

    onSuccess: (data, variables) => {
      // Invalidate and refetch user list queries to get fresh data
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      // Call optional success callback
      callbacks?.onSuccess?.(data, variables);
    },
  });
}

/**
 * Hook for updating user information
 * 
 * Features:
 * - Optimistically updates user data in cache
 * - Invalidates related queries on success
 * - Rolls back on error
 * 
 * @param userId - The ID of the user being updated
 * @param callbacks - Optional success and error callbacks
 * @returns Mutation object with mutate function and status
 * 
 * Validates Requirements: 6.4, 6.6
 */
export function useUpdateUser(
  userId: string,
  callbacks?: MutationCallbacks<User, UpdateUserRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: UpdateUserRequest) => updateUser(userId, userData),
    
    onMutate: async (updatedData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['users'] });
      await queryClient.cancelQueries({ queryKey: ['user', userId] });

      // Snapshot previous values
      const previousUsers = queryClient.getQueriesData<PaginatedUsersResponse>({ 
        queryKey: ['users'] 
      });
      const previousUserDetail = queryClient.getQueryData<User>(['user', userId]);

      // Optimistically update user in list queries
      queryClient.setQueriesData<PaginatedUsersResponse>(
        { queryKey: ['users'] },
        (old) => {
          if (!old || !old.users || !Array.isArray(old.users)) return old;
          
          return {
            ...old,
            users: old.users.map((user) =>
              user.id === userId
                ? { ...user, ...updatedData }
                : user
            ),
          };
        }
      );

      // Optimistically update user detail query
      queryClient.setQueryData<User>(
        ['user', userId],
        (old) => {
          if (!old) return old;
          return { ...old, ...updatedData };
        }
      );

      return { previousUsers, previousUserDetail };
    },

    onError: (error, variables, context) => {
      // Rollback to previous data on error
      if (context?.previousUsers) {
        context.previousUsers.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousUserDetail) {
        queryClient.setQueryData(['user', userId], context.previousUserDetail);
      }
      
      callbacks?.onError?.(error, variables);
    },

    onSuccess: (data, variables) => {
      // Invalidate queries to get fresh data
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      
      callbacks?.onSuccess?.(data, variables);
    },
  });
}

/**
 * Hook for updating user account status
 * 
 * Features:
 * - Optimistically updates status in cache
 * - Invalidates related queries on success
 * - Rolls back on error
 * 
 * @param userId - The ID of the user whose status is being changed
 * @param callbacks - Optional success and error callbacks
 * @returns Mutation object with mutate function and status
 * 
 * Validates Requirements: 7.4, 7.6
 */
export function useUpdateUserStatus(
  userId: string,
  callbacks?: MutationCallbacks<User, UpdateStatusRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (statusData: UpdateStatusRequest) => updateStatus(userId, statusData),
    
    onMutate: async (statusData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['users'] });
      await queryClient.cancelQueries({ queryKey: ['user', userId] });

      // Snapshot previous values
      const previousUsers = queryClient.getQueriesData<PaginatedUsersResponse>({ 
        queryKey: ['users'] 
      });
      const previousUserDetail = queryClient.getQueryData<User>(['user', userId]);

      // Optimistically update status in list queries
      queryClient.setQueriesData<PaginatedUsersResponse>(
        { queryKey: ['users'] },
        (old) => {
          if (!old || !old.users || !Array.isArray(old.users)) return old;
          
          return {
            ...old,
            users: old.users.map((user) =>
              user.id === userId
                ? { ...user, status: statusData.status }
                : user
            ),
          };
        }
      );

      // Optimistically update status in detail query
      queryClient.setQueryData<User>(
        ['user', userId],
        (old) => {
          if (!old) return old;
          return { ...old, status: statusData.status };
        }
      );

      return { previousUsers, previousUserDetail };
    },

    onError: (error, variables, context) => {
      // Rollback to previous data on error
      if (context?.previousUsers) {
        context.previousUsers.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousUserDetail) {
        queryClient.setQueryData(['user', userId], context.previousUserDetail);
      }
      
      callbacks?.onError?.(error, variables);
    },

    onSuccess: (data, variables) => {
      // Invalidate queries to get fresh data
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      
      callbacks?.onSuccess?.(data, variables);
    },
  });
}

/**
 * Hook for updating user role
 * 
 * Features:
 * - Optimistically updates role in cache
 * - Invalidates related queries on success
 * - Rolls back on error
 * 
 * Note: This uses the same updateUser API endpoint but provides a dedicated
 * hook for role updates with appropriate callbacks and naming
 * 
 * @param userId - The ID of the user whose role is being changed
 * @param callbacks - Optional success and error callbacks
 * @returns Mutation object with mutate function and status
 * 
 * Validates Requirements: 8.3, 8.4
 */
export function useUpdateUserRole(
  userId: string,
  callbacks?: MutationCallbacks<User, { role: UserRole }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ role }: { role: UserRole }) => updateUser(userId, { role }),
    
    onMutate: async ({ role }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['users'] });
      await queryClient.cancelQueries({ queryKey: ['user', userId] });

      // Snapshot previous values
      const previousUsers = queryClient.getQueriesData<PaginatedUsersResponse>({ 
        queryKey: ['users'] 
      });
      const previousUserDetail = queryClient.getQueryData<User>(['user', userId]);

      // Optimistically update role in list queries
      queryClient.setQueriesData<PaginatedUsersResponse>(
        { queryKey: ['users'] },
        (old) => {
          if (!old || !old.users || !Array.isArray(old.users)) return old;
          
          return {
            ...old,
            users: old.users.map((user) =>
              user.id === userId
                ? { ...user, role }
                : user
            ),
          };
        }
      );

      // Optimistically update role in detail query
      queryClient.setQueryData<User>(
        ['user', userId],
        (old) => {
          if (!old) return old;
          return { ...old, role };
        }
      );

      return { previousUsers, previousUserDetail };
    },

    onError: (error, variables, context) => {
      // Rollback to previous data on error
      if (context?.previousUsers) {
        context.previousUsers.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousUserDetail) {
        queryClient.setQueryData(['user', userId], context.previousUserDetail);
      }
      
      callbacks?.onError?.(error, variables);
    },

    onSuccess: (data, variables) => {
      // Invalidate queries to get fresh data
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      
      callbacks?.onSuccess?.(data, variables);
    },
  });
}
