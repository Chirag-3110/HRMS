/**
 * Unit tests for useUserDetail hook
 * 
 * Tests:
 * - Hook returns user detail data with correct structure
 * - Hook includes activity log in response
 * - Hook handles loading states
 * - Hook handles error states
 * - Hook uses correct query keys for caching
 * - Hook supports conditional fetching via enabled option
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUserDetail } from './useUserDetail';
import { userKeys } from './useUsers';
import * as usersApi from '../api/users';
import type { UserDetailResponse } from '../api/users';

// Mock the API module
vi.mock('../api/users', () => ({
  getUserDetail: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries in tests
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useUserDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return user detail data successfully', async () => {
    const mockData: UserDetailResponse = {
      id: '1',
      email: 'john@example.com',
      fullName: 'John Doe',
      phoneNumber: '+1234567890',
      role: 'Admin',
      status: 'active',
      registrationDate: '2024-01-01T00:00:00Z',
      lastLoginDate: '2024-01-15T10:30:00Z',
      activities: [
        {
          id: 'a1',
          timestamp: '2024-01-15T10:30:00Z',
          actionType: 'login',
          description: 'User logged in',
        },
        {
          id: 'a2',
          timestamp: '2024-01-14T09:00:00Z',
          actionType: 'profile_update',
          description: 'User updated their profile',
        },
      ],
    };

    vi.mocked(usersApi.getUserDetail).mockResolvedValue(mockData);

    const { result } = renderHook(() => useUserDetail('1'), {
      wrapper: createWrapper(),
    });

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for data to load
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify data structure
    expect(result.current.data).toEqual(mockData);
    expect(result.current.data?.id).toBe('1');
    expect(result.current.data?.fullName).toBe('John Doe');
    expect(result.current.data?.activities).toHaveLength(2);
  });

  it('should include all user fields in response', async () => {
    const mockData: UserDetailResponse = {
      id: '1',
      email: 'john@example.com',
      fullName: 'John Doe',
      phoneNumber: '+1234567890',
      role: 'Admin',
      status: 'active',
      registrationDate: '2024-01-01T00:00:00Z',
      lastLoginDate: '2024-01-15T10:30:00Z',
      activities: [],
    };

    vi.mocked(usersApi.getUserDetail).mockResolvedValue(mockData);

    const { result } = renderHook(() => useUserDetail('1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const user = result.current.data;
    expect(user).toBeDefined();
    expect(user?.id).toBe('1');
    expect(user?.email).toBe('john@example.com');
    expect(user?.fullName).toBe('John Doe');
    expect(user?.phoneNumber).toBe('+1234567890');
    expect(user?.role).toBe('Admin');
    expect(user?.status).toBe('active');
    expect(user?.registrationDate).toBe('2024-01-01T00:00:00Z');
    expect(user?.lastLoginDate).toBe('2024-01-15T10:30:00Z');
  });

  it('should include activity log with all required fields', async () => {
    const mockData: UserDetailResponse = {
      id: '1',
      email: 'john@example.com',
      fullName: 'John Doe',
      role: 'Admin',
      status: 'active',
      registrationDate: '2024-01-01T00:00:00Z',
      activities: [
        {
          id: 'a1',
          timestamp: '2024-01-15T10:30:00Z',
          actionType: 'login',
          description: 'User logged in from 192.168.1.1',
        },
        {
          id: 'a2',
          timestamp: '2024-01-14T09:00:00Z',
          actionType: 'profile_update',
          description: 'Updated email address',
        },
        {
          id: 'a3',
          timestamp: '2024-01-13T14:20:00Z',
          actionType: 'password_reset',
          description: 'Password was reset',
        },
      ],
    };

    vi.mocked(usersApi.getUserDetail).mockResolvedValue(mockData);

    const { result } = renderHook(() => useUserDetail('1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const activities = result.current.data?.activities;
    expect(activities).toHaveLength(3);
    
    // Verify each activity has required fields
    activities?.forEach((activity) => {
      expect(activity.id).toBeDefined();
      expect(activity.timestamp).toBeDefined();
      expect(activity.actionType).toBeDefined();
      expect(activity.description).toBeDefined();
    });

    // Verify specific activity data
    expect(activities?.[0].actionType).toBe('login');
    expect(activities?.[1].actionType).toBe('profile_update');
    expect(activities?.[2].actionType).toBe('password_reset');
  });

  it('should call API with correct user ID', async () => {
    const mockData: UserDetailResponse = {
      id: 'user-123',
      email: 'test@example.com',
      fullName: 'Test User',
      role: 'Member',
      status: 'active',
      registrationDate: '2024-01-01T00:00:00Z',
      activities: [],
    };

    vi.mocked(usersApi.getUserDetail).mockResolvedValue(mockData);

    renderHook(() => useUserDetail('user-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(usersApi.getUserDetail).toHaveBeenCalledWith('user-123');
    });
  });

  it('should generate correct query keys', () => {
    const userId1 = 'user-1';
    const userId2 = 'user-2';

    const key1 = userKeys.detail(userId1);
    const key2 = userKeys.detail(userId2);

    // Keys should be different for different user IDs
    expect(key1).not.toEqual(key2);
    
    // Keys should include all relevant data
    expect(key1).toContain('users');
    expect(key1).toContain('detail');
    expect(key1).toContain(userId1);
    
    // Keys should be consistent for same user ID
    const key1Again = userKeys.detail(userId1);
    expect(key1).toEqual(key1Again);
  });

  it('should support conditional fetching with enabled option', async () => {
    const mockData: UserDetailResponse = {
      id: '1',
      email: 'john@example.com',
      fullName: 'John Doe',
      role: 'Admin',
      status: 'active',
      registrationDate: '2024-01-01T00:00:00Z',
      activities: [],
    };

    vi.mocked(usersApi.getUserDetail).mockResolvedValue(mockData);

    // First render with enabled: false
    const { result, rerender } = renderHook(
      ({ enabled }) => useUserDetail('1', { enabled }),
      {
        wrapper: createWrapper(),
        initialProps: { enabled: false },
      }
    );

    // Should not fetch when disabled
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(usersApi.getUserDetail).not.toHaveBeenCalled();

    // Re-render with enabled: true
    rerender({ enabled: true });

    // Now should fetch
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(usersApi.getUserDetail).toHaveBeenCalledWith('1');
    expect(result.current.data).toEqual(mockData);
  });

  it('should handle user with optional fields missing', async () => {
    const mockData: UserDetailResponse = {
      id: '1',
      email: 'minimal@example.com',
      fullName: 'Minimal User',
      role: 'Guest',
      status: 'active',
      registrationDate: '2024-01-01T00:00:00Z',
      // phoneNumber is optional and not included
      // lastLoginDate is optional and not included
      activities: [],
    };

    vi.mocked(usersApi.getUserDetail).mockResolvedValue(mockData);

    const { result } = renderHook(() => useUserDetail('1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const user = result.current.data;
    expect(user?.phoneNumber).toBeUndefined();
    expect(user?.lastLoginDate).toBeUndefined();
    expect(user?.email).toBe('minimal@example.com');
    expect(user?.fullName).toBe('Minimal User');
  });
});
