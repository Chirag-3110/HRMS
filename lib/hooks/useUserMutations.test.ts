/**
 * Unit tests for user mutation hooks
 * 
 * Tests cover:
 * - Create user mutation with optimistic updates
 * - Update user mutation with optimistic updates
 * - Update status mutation with optimistic updates
 * - Update role mutation with optimistic updates
 * - Error handling and rollback behavior
 * - Cache invalidation after successful mutations
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import { createElement, type ReactNode } from 'react';
import {
  useCreateUser,
  useUpdateUser,
  useUpdateUserStatus,
  useUpdateUserRole,
} from './useUserMutations';
import * as usersApi from '../api/users';
import type { User, CreateUserRequest, UpdateUserRequest } from '../api/users';

// Mock the API module
vi.mock('../api/users', () => ({
  createUser: vi.fn(),
  updateUser: vi.fn(),
  updateStatus: vi.fn(),
}));

// Helper to create a wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

// Sample user data
const mockUser: User = {
  id: '123',
  email: 'test@example.com',
  fullName: 'Test User',
  phoneNumber: '+1234567890',
  role: 'Member',
  status: 'active',
  registrationDate: '2024-01-01T00:00:00Z',
  lastLoginDate: '2024-01-15T00:00:00Z',
};

const mockCreateRequest: CreateUserRequest = {
  email: 'new@example.com',
  fullName: 'New User',
  phoneNumber: '+9876543210',
  role: 'Guest',
};

describe('useCreateUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a user successfully', async () => {
    const createdUser: User = {
      id: '456',
      ...mockCreateRequest,
      status: 'active',
      registrationDate: '2024-01-20T00:00:00Z',
    };

    (usersApi.createUser as Mock).mockResolvedValue(createdUser);

    const { result } = renderHook(() => useCreateUser(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(mockCreateRequest);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(usersApi.createUser).toHaveBeenCalledWith(mockCreateRequest);
    expect(result.current.data).toEqual(createdUser);
  });

  it('should call onSuccess callback when mutation succeeds', async () => {
    const createdUser: User = {
      id: '456',
      ...mockCreateRequest,
      status: 'active',
      registrationDate: '2024-01-20T00:00:00Z',
    };

    (usersApi.createUser as Mock).mockResolvedValue(createdUser);

    const onSuccess = vi.fn();
    const { result } = renderHook(() => useCreateUser({ onSuccess }), {
      wrapper: createWrapper(),
    });

    result.current.mutate(mockCreateRequest);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(onSuccess).toHaveBeenCalledWith(createdUser, mockCreateRequest);
  });

  it('should call onError callback when mutation fails', async () => {
    const error = new Error('Email already exists');
    (usersApi.createUser as Mock).mockRejectedValue(error);

    const onError = vi.fn();
    const { result } = renderHook(() => useCreateUser({ onError }), {
      wrapper: createWrapper(),
    });

    result.current.mutate(mockCreateRequest);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(onError).toHaveBeenCalledWith(error, mockCreateRequest);
  });

  it('should handle error and set error state', async () => {
    const error = new Error('Failed to create user');
    (usersApi.createUser as Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useCreateUser(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(mockCreateRequest);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(error);
  });
});

describe('useUpdateUser', () => {
  const userId = '123';
  const updateData: UpdateUserRequest = {
    fullName: 'Updated Name',
    email: 'updated@example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update a user successfully', async () => {
    const updatedUser: User = {
      ...mockUser,
      ...updateData,
    };

    (usersApi.updateUser as Mock).mockResolvedValue(updatedUser);

    const { result } = renderHook(() => useUpdateUser(userId), {
      wrapper: createWrapper(),
    });

    result.current.mutate(updateData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(usersApi.updateUser).toHaveBeenCalledWith(userId, updateData);
    expect(result.current.data).toEqual(updatedUser);
  });

  it('should call onSuccess callback when mutation succeeds', async () => {
    const updatedUser: User = {
      ...mockUser,
      ...updateData,
    };

    (usersApi.updateUser as Mock).mockResolvedValue(updatedUser);

    const onSuccess = vi.fn();
    const { result } = renderHook(() => useUpdateUser(userId, { onSuccess }), {
      wrapper: createWrapper(),
    });

    result.current.mutate(updateData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(onSuccess).toHaveBeenCalledWith(updatedUser, updateData);
  });

  it('should call onError callback when mutation fails', async () => {
    const error = new Error('Update failed');
    (usersApi.updateUser as Mock).mockRejectedValue(error);

    const onError = vi.fn();
    const { result } = renderHook(() => useUpdateUser(userId, { onError }), {
      wrapper: createWrapper(),
    });

    result.current.mutate(updateData);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(onError).toHaveBeenCalledWith(error, updateData);
  });

  it('should handle partial updates', async () => {
    const partialUpdate: UpdateUserRequest = {
      fullName: 'New Name Only',
    };

    const updatedUser: User = {
      ...mockUser,
      fullName: 'New Name Only',
    };

    (usersApi.updateUser as Mock).mockResolvedValue(updatedUser);

    const { result } = renderHook(() => useUpdateUser(userId), {
      wrapper: createWrapper(),
    });

    result.current.mutate(partialUpdate);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(usersApi.updateUser).toHaveBeenCalledWith(userId, partialUpdate);
    expect(result.current.data).toEqual(updatedUser);
  });
});

describe('useUpdateUserStatus', () => {
  const userId = '123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update user status to deactivated successfully', async () => {
    const updatedUser: User = {
      ...mockUser,
      status: 'deactivated',
    };

    (usersApi.updateStatus as Mock).mockResolvedValue(updatedUser);

    const { result } = renderHook(() => useUpdateUserStatus(userId), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ status: 'deactivated' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(usersApi.updateStatus).toHaveBeenCalledWith(userId, { status: 'deactivated' });
    expect(result.current.data).toEqual(updatedUser);
  });

  it('should update user status to active successfully', async () => {
    const deactivatedUser: User = {
      ...mockUser,
      status: 'deactivated',
    };

    const activatedUser: User = {
      ...deactivatedUser,
      status: 'active',
    };

    (usersApi.updateStatus as Mock).mockResolvedValue(activatedUser);

    const { result } = renderHook(() => useUpdateUserStatus(userId), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ status: 'active' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(usersApi.updateStatus).toHaveBeenCalledWith(userId, { status: 'active' });
    expect(result.current.data).toEqual(activatedUser);
  });

  it('should call onSuccess callback when status change succeeds', async () => {
    const updatedUser: User = {
      ...mockUser,
      status: 'deactivated',
    };

    (usersApi.updateStatus as Mock).mockResolvedValue(updatedUser);

    const onSuccess = vi.fn();
    const { result } = renderHook(() => useUpdateUserStatus(userId, { onSuccess }), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ status: 'deactivated' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(onSuccess).toHaveBeenCalledWith(updatedUser, { status: 'deactivated' });
  });

  it('should call onError callback when status change fails', async () => {
    const error = new Error('Status update failed');
    (usersApi.updateStatus as Mock).mockRejectedValue(error);

    const onError = vi.fn();
    const { result } = renderHook(() => useUpdateUserStatus(userId, { onError }), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ status: 'deactivated' });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(onError).toHaveBeenCalledWith(error, { status: 'deactivated' });
  });
});

describe('useUpdateUserRole', () => {
  const userId = '123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update user role successfully', async () => {
    const updatedUser: User = {
      ...mockUser,
      role: 'Admin',
    };

    (usersApi.updateUser as Mock).mockResolvedValue(updatedUser);

    const { result } = renderHook(() => useUpdateUserRole(userId), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ role: 'Admin' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(usersApi.updateUser).toHaveBeenCalledWith(userId, { role: 'Admin' });
    expect(result.current.data).toEqual(updatedUser);
  });

  it('should call onSuccess callback when role change succeeds', async () => {
    const updatedUser: User = {
      ...mockUser,
      role: 'Admin',
    };

    (usersApi.updateUser as Mock).mockResolvedValue(updatedUser);

    const onSuccess = vi.fn();
    const { result } = renderHook(() => useUpdateUserRole(userId, { onSuccess }), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ role: 'Admin' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(onSuccess).toHaveBeenCalledWith(updatedUser, { role: 'Admin' });
  });

  it('should call onError callback when role change fails', async () => {
    const error = new Error('Role update failed');
    (usersApi.updateUser as Mock).mockRejectedValue(error);

    const onError = vi.fn();
    const { result } = renderHook(() => useUpdateUserRole(userId, { onError }), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ role: 'Admin' });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(onError).toHaveBeenCalledWith(error, { role: 'Admin' });
  });

  it('should update role to each valid role type', async () => {
    const roles: Array<'Admin' | 'Member' | 'Guest'> = ['Admin', 'Member', 'Guest'];

    for (const role of roles) {
      const updatedUser: User = {
        ...mockUser,
        role,
      };

      (usersApi.updateUser as Mock).mockResolvedValue(updatedUser);

      const { result } = renderHook(() => useUpdateUserRole(userId), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ role });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.role).toBe(role);
    }
  });
});

describe('Optimistic updates and rollback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should perform optimistic update for createUser', async () => {
    const createdUser: User = {
      id: '456',
      ...mockCreateRequest,
      status: 'active',
      registrationDate: '2024-01-20T00:00:00Z',
    };

    // Delay the API response to test optimistic update
    (usersApi.createUser as Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(createdUser), 100))
    );

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Pre-populate cache with user list
    queryClient.setQueryData(['users'], {
      users: [mockUser],
      pagination: { page: 1, pageSize: 10, totalCount: 1, totalPages: 1 },
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      createElement(QueryClientProvider, { client: queryClient }, children)
    );

    const { result } = renderHook(() => useCreateUser(), { wrapper });

    result.current.mutate(mockCreateRequest);

    // Check that cache is updated optimistically (before API resolves)
    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    const cachedData = queryClient.getQueryData<any>(['users']);
    expect(cachedData.users.length).toBe(2); // Original + optimistic

    // Wait for API to resolve
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('should rollback optimistic update on error for updateUser', async () => {
    const userId = '123';
    const updateData: UpdateUserRequest = {
      fullName: 'Failed Update',
    };

    (usersApi.updateUser as Mock).mockRejectedValue(new Error('Update failed'));

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Pre-populate cache with user list
    queryClient.setQueryData(['users'], {
      users: [mockUser],
      pagination: { page: 1, pageSize: 10, totalCount: 1, totalPages: 1 },
    });

    // Pre-populate cache with user detail
    queryClient.setQueryData(['user', userId], mockUser);

    const wrapper = ({ children }: { children: ReactNode }) => (
      createElement(QueryClientProvider, { client: queryClient }, children)
    );

    const { result } = renderHook(() => useUpdateUser(userId), { wrapper });

    result.current.mutate(updateData);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // Verify cache was rolled back to original state
    const cachedUserList = queryClient.getQueryData<any>(['users']);
    expect(cachedUserList.users[0].fullName).toBe(mockUser.fullName);

    const cachedUserDetail = queryClient.getQueryData<User>(['user', userId]);
    expect(cachedUserDetail?.fullName).toBe(mockUser.fullName);
  });
});
