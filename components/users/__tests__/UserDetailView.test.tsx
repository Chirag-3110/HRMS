/**
 * Unit Tests for UserDetailView Component
 * 
 * Tests:
 * - Renders user profile information correctly
 * - Displays all required user fields
 * - Handles optional fields (phone number, last login)
 * - Renders ActivityLog component with user activities
 * - Shows Edit and status change buttons
 * - Handles back navigation
 * - Handles button click callbacks
 * - Shows loading state
 * - Formats dates correctly
 * - Displays correct status and role badges
 * 
 * Validates Requirements:
 * - 4.1: Display detailed user view
 * - 4.2: Display User_Profile information
 * - 4.3: Display user's Activity_Log
 * - 4.4: Provide way to return to user list
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserDetailView } from '../UserDetailView';
import type { UserDetailResponse } from '@/lib/api/users';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

const mockPush = vi.fn();

// Import after mock setup
import { useRouter } from 'next/navigation';

describe('UserDetailView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
    });
  });

  const mockUserWithAllFields: UserDetailResponse = {
    id: 'user-123',
    email: 'john.doe@example.com',
    fullName: 'John Doe',
    phoneNumber: '+1234567890',
    role: 'Admin',
    status: 'active',
    registrationDate: '2024-01-15T10:30:00Z',
    lastLoginDate: '2024-03-20T14:45:00Z',
    activities: [
      {
        id: 'activity-1',
        timestamp: '2024-03-20T14:45:00Z',
        actionType: 'login',
        description: 'User logged in successfully',
      },
      {
        id: 'activity-2',
        timestamp: '2024-03-19T09:20:00Z',
        actionType: 'profile_update',
        description: 'User updated their profile',
      },
    ],
  };

  const mockUserWithoutOptionalFields: UserDetailResponse = {
    id: 'user-456',
    email: 'jane.smith@example.com',
    fullName: 'Jane Smith',
    role: 'Member',
    status: 'deactivated',
    registrationDate: '2024-02-01T08:00:00Z',
    activities: [],
  };

  describe('Rendering', () => {
    it('renders user profile with all fields', () => {
      render(<UserDetailView user={mockUserWithAllFields} />);

      // Check for user name and ID
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText(/User ID: user-123/)).toBeInTheDocument();

      // Check for contact information
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
      expect(screen.getByText('+1234567890')).toBeInTheDocument();

      // Check for account information (role and status appear in multiple places)
      const adminElements = screen.getAllByText('Admin');
      expect(adminElements.length).toBeGreaterThan(0);
      const activeElements = screen.getAllByText('Active');
      expect(activeElements.length).toBeGreaterThan(0);
    });

    it('renders user profile without optional fields', () => {
      render(<UserDetailView user={mockUserWithoutOptionalFields} />);

      // Check for user name
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();

      // Check for email
      expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();

      // Check that "Not provided" is shown for missing phone number
      expect(screen.getByText('Not provided')).toBeInTheDocument();

      // Check for deactivated status (appears in multiple places)
      const deactivatedElements = screen.getAllByText('Deactivated');
      expect(deactivatedElements.length).toBeGreaterThan(0);

      // Check that "Never" is shown for missing last login
      expect(screen.getByText('Never')).toBeInTheDocument();
    });

    it('displays registration date in correct format', () => {
      render(<UserDetailView user={mockUserWithAllFields} />);

      // Should display "January 15, 2024"
      expect(screen.getByText(/January 15, 2024/)).toBeInTheDocument();
    });

    it('displays last login date in correct format with time', () => {
      render(<UserDetailView user={mockUserWithAllFields} />);

      // Should display "March 20, 2024 at X:XX PM/AM"
      expect(screen.getByText(/March 20, 2024 at/)).toBeInTheDocument();
    });

    it('renders ActivityLog component with user activities', () => {
      render(<UserDetailView user={mockUserWithAllFields} />);

      // Check for activity log section
      expect(screen.getByText('Activity History')).toBeInTheDocument();
      expect(
        screen.getByText(/Recent activities and actions performed by this user/)
      ).toBeInTheDocument();

      // Check that activities are rendered (ActivityLog component should handle display)
      expect(screen.getByText('User logged in successfully')).toBeInTheDocument();
    });

    it('shows loading state', () => {
      render(<UserDetailView user={mockUserWithAllFields} loading={true} />);

      // Loading skeletons should be present
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Status and Role Badges', () => {
    it('displays active status badge with correct styling', () => {
      render(<UserDetailView user={mockUserWithAllFields} />);

      const statusBadges = screen.getAllByText('Active');
      expect(statusBadges.length).toBeGreaterThan(0);
      
      // Check for green styling (active status)
      const badge = statusBadges[0];
      expect(badge).toHaveClass('bg-green-100', 'text-green-700');
    });

    it('displays deactivated status badge with correct styling', () => {
      render(<UserDetailView user={mockUserWithoutOptionalFields} />);

      const statusBadges = screen.getAllByText('Deactivated');
      expect(statusBadges.length).toBeGreaterThan(0);
      
      // Check for red styling (deactivated status)
      const badge = statusBadges[0];
      expect(badge).toHaveClass('bg-red-100', 'text-red-700');
    });

    it('displays role badge with correct styling for Admin', () => {
      render(<UserDetailView user={mockUserWithAllFields} />);

      const roleBadges = screen.getAllByText('Admin');
      const badge = roleBadges[0];
      
      // Check for purple styling (Admin role)
      expect(badge).toHaveClass('bg-purple-100', 'text-purple-700');
    });

    it('displays role badge with correct styling for Member', () => {
      render(<UserDetailView user={mockUserWithoutOptionalFields} />);

      const roleBadges = screen.getAllByText('Member');
      const badge = roleBadges[0];
      
      // Check for blue styling (Member role)
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-700');
    });
  });

  describe('Navigation and Actions', () => {
    it('renders back button', () => {
      render(<UserDetailView user={mockUserWithAllFields} />);

      const backButton = screen.getByRole('button', { name: /Back to Users/i });
      expect(backButton).toBeInTheDocument();
    });

    it('navigates back to user list when back button is clicked', () => {
      render(<UserDetailView user={mockUserWithAllFields} />);

      const backButton = screen.getByRole('button', { name: /Back to Users/i });
      fireEvent.click(backButton);

      expect(mockPush).toHaveBeenCalledWith('/users');
    });

    it('renders Edit button when onEdit callback is provided', () => {
      const mockOnEdit = vi.fn();
      render(<UserDetailView user={mockUserWithAllFields} onEdit={mockOnEdit} />);

      const editButton = screen.getByRole('button', { name: /Edit User/i });
      expect(editButton).toBeInTheDocument();
    });

    it('calls onEdit callback when Edit button is clicked', () => {
      const mockOnEdit = vi.fn();
      render(<UserDetailView user={mockUserWithAllFields} onEdit={mockOnEdit} />);

      const editButton = screen.getByRole('button', { name: /Edit User/i });
      fireEvent.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    it('does not render Edit button when onEdit callback is not provided', () => {
      render(<UserDetailView user={mockUserWithAllFields} />);

      const editButton = screen.queryByRole('button', { name: /Edit User/i });
      expect(editButton).not.toBeInTheDocument();
    });

    it('renders Deactivate button for active user when onStatusChange is provided', () => {
      const mockOnStatusChange = vi.fn();
      render(
        <UserDetailView
          user={mockUserWithAllFields}
          onStatusChange={mockOnStatusChange}
        />
      );

      const statusButton = screen.getByRole('button', {
        name: /Deactivate Account/i,
      });
      expect(statusButton).toBeInTheDocument();
    });

    it('renders Activate button for deactivated user when onStatusChange is provided', () => {
      const mockOnStatusChange = vi.fn();
      render(
        <UserDetailView
          user={mockUserWithoutOptionalFields}
          onStatusChange={mockOnStatusChange}
        />
      );

      const statusButton = screen.getByRole('button', {
        name: /Activate Account/i,
      });
      expect(statusButton).toBeInTheDocument();
    });

    it('calls onStatusChange with correct new status when Deactivate button is clicked', () => {
      const mockOnStatusChange = vi.fn();
      render(
        <UserDetailView
          user={mockUserWithAllFields}
          onStatusChange={mockOnStatusChange}
        />
      );

      const statusButton = screen.getByRole('button', {
        name: /Deactivate Account/i,
      });
      fireEvent.click(statusButton);

      expect(mockOnStatusChange).toHaveBeenCalledWith('deactivated');
    });

    it('calls onStatusChange with correct new status when Activate button is clicked', () => {
      const mockOnStatusChange = vi.fn();
      render(
        <UserDetailView
          user={mockUserWithoutOptionalFields}
          onStatusChange={mockOnStatusChange}
        />
      );

      const statusButton = screen.getByRole('button', {
        name: /Activate Account/i,
      });
      fireEvent.click(statusButton);

      expect(mockOnStatusChange).toHaveBeenCalledWith('active');
    });

    it('does not render status change button when onStatusChange is not provided', () => {
      render(<UserDetailView user={mockUserWithAllFields} />);

      const deactivateButton = screen.queryByRole('button', {
        name: /Deactivate Account/i,
      });
      const activateButton = screen.queryByRole('button', {
        name: /Activate Account/i,
      });

      expect(deactivateButton).not.toBeInTheDocument();
      expect(activateButton).not.toBeInTheDocument();
    });
  });

  describe('Activity Log Integration', () => {
    it('passes activities to ActivityLog component', () => {
      render(<UserDetailView user={mockUserWithAllFields} />);

      // Check that activities are displayed (ActivityLog component handles the rendering)
      expect(screen.getByText('User logged in successfully')).toBeInTheDocument();
      expect(screen.getByText('User updated their profile')).toBeInTheDocument();
    });

    it('handles empty activities array', () => {
      render(<UserDetailView user={mockUserWithoutOptionalFields} />);

      // Should still render ActivityLog section
      expect(screen.getByText('Activity History')).toBeInTheDocument();
      
      // ActivityLog component will show "No activity history available" message
      expect(screen.getByText('No activity history available')).toBeInTheDocument();
    });
  });

  describe('Requirement Validation', () => {
    it('validates Requirement 4.2: displays all required User_Profile fields', () => {
      render(<UserDetailView user={mockUserWithAllFields} />);

      // Full name
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      
      // Email
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
      
      // Phone number
      expect(screen.getByText('+1234567890')).toBeInTheDocument();
      
      // Role (appears in multiple places)
      const adminElements = screen.getAllByText('Admin');
      expect(adminElements.length).toBeGreaterThan(0);
      
      // Account status (appears in multiple places)
      const activeElements = screen.getAllByText('Active');
      expect(activeElements.length).toBeGreaterThan(0);
      
      // Registration date
      expect(screen.getByText(/January 15, 2024/)).toBeInTheDocument();
      
      // Last login date
      expect(screen.getByText(/March 20, 2024 at/)).toBeInTheDocument();
    });

    it('validates Requirement 4.3: displays user Activity_Log', () => {
      render(<UserDetailView user={mockUserWithAllFields} />);

      // Activity Log section should be present
      expect(screen.getByText('Activity History')).toBeInTheDocument();
      
      // Activities should be displayed
      expect(screen.getByText('User logged in successfully')).toBeInTheDocument();
    });

    it('validates Requirement 4.4: provides way to return to user list', () => {
      render(<UserDetailView user={mockUserWithAllFields} />);

      const backButton = screen.getByRole('button', { name: /Back to Users/i });
      expect(backButton).toBeInTheDocument();
      
      fireEvent.click(backButton);
      expect(mockPush).toHaveBeenCalledWith('/users');
    });
  });
});
