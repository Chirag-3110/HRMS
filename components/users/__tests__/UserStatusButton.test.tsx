/**
 * UserStatusButton Component Tests
 * 
 * Tests the UserStatusButton component functionality including:
 * - Rendering with different status values
 * - Confirmation dialog display
 * - Status change execution
 * - Loading states
 * - Success/error notifications
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserStatusButton } from '../UserStatusButton';
import * as useUserMutations from '@/lib/hooks/useUserMutations';

// Mock the useUpdateUserStatus hook
vi.mock('@/lib/hooks/useUserMutations', () => ({
  useUpdateUserStatus: vi.fn(),
}));

// Create a wrapper with QueryClientProvider
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe('UserStatusButton', () => {
  const mockMutate = vi.fn();
  const mockUseUpdateUserStatus = useUserMutations.useUpdateUserStatus as ReturnType<typeof vi.fn>;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation
    mockUseUpdateUserStatus.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });
  
  describe('Rendering', () => {
    it('should render "Deactivate Account" button when user is active', () => {
      render(
        <UserStatusButton userId="user123" currentStatus="active" />,
        { wrapper: createWrapper() }
      );
      
      expect(screen.getByRole('button', { name: /deactivate account/i })).toBeInTheDocument();
    });
    
    it('should render "Activate Account" button when user is deactivated', () => {
      render(
        <UserStatusButton userId="user123" currentStatus="deactivated" />,
        { wrapper: createWrapper() }
      );
      
      expect(screen.getByRole('button', { name: /activate account/i })).toBeInTheDocument();
    });
    
    it('should apply green styling for activate button', () => {
      render(
        <UserStatusButton userId="user123" currentStatus="deactivated" />,
        { wrapper: createWrapper() }
      );
      
      const button = screen.getByRole('button', { name: /activate account/i });
      expect(button).toHaveClass('border-green-300', 'text-green-600');
    });
    
    it('should apply red styling for deactivate button', () => {
      render(
        <UserStatusButton userId="user123" currentStatus="active" />,
        { wrapper: createWrapper() }
      );
      
      const button = screen.getByRole('button', { name: /deactivate account/i });
      expect(button).toHaveClass('border-red-300', 'text-red-600');
    });
  });
  
  describe('Confirmation Dialog', () => {
    it('should show confirmation dialog when button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <UserStatusButton userId="user123" currentStatus="active" />,
        { wrapper: createWrapper() }
      );
      
      const button = screen.getByRole('button', { name: /deactivate account/i });
      await user.click(button);
      
      expect(screen.getByText('Deactivate User Account')).toBeInTheDocument();
      expect(screen.getByText(/are you sure you want to deactivate/i)).toBeInTheDocument();
    });
    
    it('should show activate confirmation dialog when user is deactivated', async () => {
      const user = userEvent.setup();
      
      render(
        <UserStatusButton userId="user123" currentStatus="deactivated" />,
        { wrapper: createWrapper() }
      );
      
      const button = screen.getByRole('button', { name: /activate account/i });
      await user.click(button);
      
      expect(screen.getByText('Activate User Account')).toBeInTheDocument();
      expect(screen.getByText(/are you sure you want to activate/i)).toBeInTheDocument();
    });
    
    it('should close dialog when cancel is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <UserStatusButton userId="user123" currentStatus="active" />,
        { wrapper: createWrapper() }
      );
      
      // Open dialog
      const openButton = screen.getByRole('button', { name: /deactivate account/i });
      await user.click(openButton);
      
      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);
      
      // Dialog should be closed
      await waitFor(() => {
        expect(screen.queryByText('Deactivate User Account')).not.toBeInTheDocument();
      });
    });
  });
  
  describe('Status Change Execution', () => {
    it('should call mutate with correct status when confirmed', async () => {
      const user = userEvent.setup();
      
      render(
        <UserStatusButton userId="user123" currentStatus="active" />,
        { wrapper: createWrapper() }
      );
      
      // Open dialog
      const openButton = screen.getByRole('button', { name: /deactivate account/i });
      await user.click(openButton);
      
      // Click confirm
      const confirmButton = screen.getByRole('button', { name: /deactivate account/i });
      await user.click(confirmButton);
      
      expect(mockMutate).toHaveBeenCalledWith({ status: 'deactivated' });
    });
    
    it('should call mutate with activate status when user is deactivated', async () => {
      const user = userEvent.setup();
      
      render(
        <UserStatusButton userId="user123" currentStatus="deactivated" />,
        { wrapper: createWrapper() }
      );
      
      // Open dialog
      const openButton = screen.getByRole('button', { name: /activate account/i });
      await user.click(openButton);
      
      // Click confirm
      const confirmButton = screen.getByRole('button', { name: /activate account/i });
      await user.click(confirmButton);
      
      expect(mockMutate).toHaveBeenCalledWith({ status: 'active' });
    });
    
    it('should call onStatusChange callback on success', async () => {
      const user = userEvent.setup();
      const onStatusChange = vi.fn();
      
      // Mock successful mutation
      mockUseUpdateUserStatus.mockImplementation((userId, callbacks) => {
        return {
          mutate: (data: any) => {
            callbacks?.onSuccess?.({ ...data, status: data.status });
          },
          isPending: false,
        };
      });
      
      render(
        <UserStatusButton 
          userId="user123" 
          currentStatus="active"
          onStatusChange={onStatusChange}
        />,
        { wrapper: createWrapper() }
      );
      
      // Open dialog and confirm
      const openButton = screen.getByRole('button', { name: /deactivate account/i });
      await user.click(openButton);
      
      const confirmButton = screen.getByRole('button', { name: /deactivate account/i });
      await user.click(confirmButton);
      
      expect(onStatusChange).toHaveBeenCalledWith('deactivated');
    });
  });
  
  describe('Loading States', () => {
    it('should show loading text when mutation is pending', () => {
      mockUseUpdateUserStatus.mockReturnValue({
        mutate: mockMutate,
        isPending: true,
      });
      
      render(
        <UserStatusButton userId="user123" currentStatus="active" />,
        { wrapper: createWrapper() }
      );
      
      expect(screen.getByRole('button', { name: /deactivating/i })).toBeInTheDocument();
    });
    
    it('should disable button when mutation is pending', () => {
      mockUseUpdateUserStatus.mockReturnValue({
        mutate: mockMutate,
        isPending: true,
      });
      
      render(
        <UserStatusButton userId="user123" currentStatus="active" />,
        { wrapper: createWrapper() }
      );
      
      const button = screen.getByRole('button', { name: /deactivating/i });
      expect(button).toBeDisabled();
    });
  });
  
  describe('Notifications', () => {
    it('should show success notification on successful status change', async () => {
      const user = userEvent.setup();
      
      // Mock successful mutation
      mockUseUpdateUserStatus.mockImplementation((userId, callbacks) => {
        return {
          mutate: (data: any) => {
            callbacks?.onSuccess?.({ status: 'deactivated' });
          },
          isPending: false,
        };
      });
      
      render(
        <UserStatusButton userId="user123" currentStatus="active" />,
        { wrapper: createWrapper() }
      );
      
      // Open dialog and confirm
      const openButton = screen.getByRole('button', { name: /deactivate account/i });
      await user.click(openButton);
      
      const confirmButton = screen.getByRole('button', { name: /deactivate account/i });
      await user.click(confirmButton);
      
      await waitFor(() => {
        expect(screen.getByText(/user account deactivated successfully/i)).toBeInTheDocument();
      });
    });
    
    it('should show error notification on failed status change', async () => {
      const user = userEvent.setup();
      
      // Mock failed mutation
      mockUseUpdateUserStatus.mockImplementation((userId, callbacks) => {
        return {
          mutate: () => {
            callbacks?.onError?.(new Error('Network error'));
          },
          isPending: false,
        };
      });
      
      render(
        <UserStatusButton userId="user123" currentStatus="active" />,
        { wrapper: createWrapper() }
      );
      
      // Open dialog and confirm
      const openButton = screen.getByRole('button', { name: /deactivate account/i });
      await user.click(openButton);
      
      const confirmButton = screen.getByRole('button', { name: /deactivate account/i });
      await user.click(confirmButton);
      
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });
  });
});
