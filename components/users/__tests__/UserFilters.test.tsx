/**
 * Tests for UserFilters component
 * Feature: phelbo-superadmin-labs
 * 
 * Tests Requirements:
 * - 3.3: Provide filter dropdowns for user role and account status
 * - 3.4: Display users matching all selected filter criteria
 * - 3.5: Persist filter state in URL query parameters (via parent)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserFilters } from '../UserFilters';

describe('UserFilters', () => {
  describe('Rendering', () => {
    it('should render both role and status filter dropdowns', () => {
      const onRoleChange = vi.fn();
      const onStatusChange = vi.fn();
      
      render(
        <UserFilters
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
        />
      );
      
      expect(screen.getByLabelText('Filter by role')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by status')).toBeInTheDocument();
    });

    it('should render role filter with label', () => {
      const onRoleChange = vi.fn();
      const onStatusChange = vi.fn();
      
      render(
        <UserFilters
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
        />
      );
      
      expect(screen.getByText('Role')).toBeInTheDocument();
    });

    it('should render status filter with label', () => {
      const onRoleChange = vi.fn();
      const onStatusChange = vi.fn();
      
      render(
        <UserFilters
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
        />
      );
      
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('should display default "All" values when no filters are set', () => {
      const onRoleChange = vi.fn();
      const onStatusChange = vi.fn();
      
      render(
        <UserFilters
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
        />
      );
      
      const roleTrigger = screen.getByLabelText('Filter by role');
      const statusTrigger = screen.getByLabelText('Filter by status');
      
      expect(roleTrigger).toHaveTextContent('All roles');
      expect(statusTrigger).toHaveTextContent('All statuses');
    });

    it('should display current roleFilter value', () => {
      const onRoleChange = vi.fn();
      const onStatusChange = vi.fn();
      
      render(
        <UserFilters
          roleFilter="Admin"
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
        />
      );
      
      const roleTrigger = screen.getByLabelText('Filter by role');
      expect(roleTrigger).toHaveTextContent('Admin');
    });

    it('should display current statusFilter value', () => {
      const onRoleChange = vi.fn();
      const onStatusChange = vi.fn();
      
      render(
        <UserFilters
          statusFilter="active"
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
        />
      );
      
      const statusTrigger = screen.getByLabelText('Filter by status');
      expect(statusTrigger).toHaveTextContent('Active');
    });

    it('should apply custom className', () => {
      const onRoleChange = vi.fn();
      const onStatusChange = vi.fn();
      
      const { container } = render(
        <UserFilters
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
          className="custom-class"
        />
      );
      
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('custom-class');
    });
  });

  describe('Role Filter - Requirement 3.3', () => {
    it('should display all role options when role dropdown is opened', async () => {
      const user = userEvent.setup();
      const onRoleChange = vi.fn();
      const onStatusChange = vi.fn();
      
      render(
        <UserFilters
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
        />
      );
      
      const roleTrigger = screen.getByLabelText('Filter by role');
      await user.click(roleTrigger);
      
      // Wait for dropdown to open
      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'All roles' })).toBeInTheDocument();
      });
      
      expect(screen.getByRole('option', { name: 'Admin' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Member' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Guest' })).toBeInTheDocument();
    });

    it('should call onRoleChange when Admin is selected', async () => {
      const user = userEvent.setup();
      const onRoleChange = vi.fn();
      const onStatusChange = vi.fn();
      
      render(
        <UserFilters
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
        />
      );
      
      const roleTrigger = screen.getByLabelText('Filter by role');
      await user.click(roleTrigger);
      
      const adminOption = await screen.findByRole('option', { name: 'Admin' });
      await user.click(adminOption);
      
      expect(onRoleChange).toHaveBeenCalledWith('Admin');
      expect(onRoleChange).toHaveBeenCalledTimes(1);
    });

    it('should call onRoleChange when Member is selected', async () => {
      const user = userEvent.setup();
      const onRoleChange = vi.fn();
      const onStatusChange = vi.fn();
      
      render(
        <UserFilters
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
        />
      );
      
      const roleTrigger = screen.getByLabelText('Filter by role');
      await user.click(roleTrigger);
      
      const memberOption = await screen.findByRole('option', { name: 'Member' });
      await user.click(memberOption);
      
      expect(onRoleChange).toHaveBeenCalledWith('Member');
    });

    it('should call onRoleChange when Guest is selected', async () => {
      const user = userEvent.setup();
      const onRoleChange = vi.fn();
      const onStatusChange = vi.fn();
      
      render(
        <UserFilters
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
        />
      );
      
      const roleTrigger = screen.getByLabelText('Filter by role');
      await user.click(roleTrigger);
      
      const guestOption = await screen.findByRole('option', { name: 'Guest' });
      await user.click(guestOption);
      
      expect(onRoleChange).toHaveBeenCalledWith('Guest');
    });

    it('should call onRoleChange with "All" when All roles is selected', async () => {
      const user = userEvent.setup();
      const onRoleChange = vi.fn();
      const onStatusChange = vi.fn();
      
      render(
        <UserFilters
          roleFilter="Admin"
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
        />
      );
      
      const roleTrigger = screen.getByLabelText('Filter by role');
      await user.click(roleTrigger);
      
      const allOption = await screen.findByRole('option', { name: 'All roles' });
      await user.click(allOption);
      
      expect(onRoleChange).toHaveBeenCalledWith('All');
    });

    it('should not call onStatusChange when role is changed', async () => {
      const user = userEvent.setup();
      const onRoleChange = vi.fn();
      const onStatusChange = vi.fn();
      
      render(
        <UserFilters
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
        />
      );
      
      const roleTrigger = screen.getByLabelText('Filter by role');
      await user.click(roleTrigger);
      
      const adminOption = await screen.findByRole('option', { name: 'Admin' });
      await user.click(adminOption);
      
      expect(onRoleChange).toHaveBeenCalled();
      expect(onStatusChange).not.toHaveBeenCalled();
    });
  });

  describe('Status Filter - Requirement 3.3', () => {
    it('should display all status options when status dropdown is opened', async () => {
      const user = userEvent.setup();
      const onRoleChange = vi.fn();
      const onStatusChange = vi.fn();
      
      render(
        <UserFilters
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
        />
      );
      
      const statusTrigger = screen.getByLabelText('Filter by status');
      await user.click(statusTrigger);
      
      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'All statuses' })).toBeInTheDocument();
      });
      
      expect(screen.getByRole('option', { name: 'Active' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Deactivated' })).toBeInTheDocument();
    });

    it('should call onStatusChange when Active is selected', async () => {
      const user = userEvent.setup();
      const onRoleChange = vi.fn();
      const onStatusChange = vi.fn();
      
      render(
        <UserFilters
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
        />
      );
      
      const statusTrigger = screen.getByLabelText('Filter by status');
      await user.click(statusTrigger);
      
      const activeOption = await screen.findByRole('option', { name: 'Active' });
      await user.click(activeOption);
      
      expect(onStatusChange).toHaveBeenCalledWith('active');
      expect(onStatusChange).toHaveBeenCalledTimes(1);
    });

    it('should call onStatusChange when Deactivated is selected', async () => {
      const user = userEvent.setup();
      const onRoleChange = vi.fn();
      const onStatusChange = vi.fn();
      
      render(
        <UserFilters
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
        />
      );
      
      const statusTrigger = screen.getByLabelText('Filter by status');
      await user.click(statusTrigger);
      
      const deactivatedOption = await screen.findByRole('option', { name: 'Deactivated' });
      await user.click(deactivatedOption);
      
      expect(onStatusChange).toHaveBeenCalledWith('deactivated');
    });

    it('should call onStatusChange with "All" when All statuses is selected', async () => {
      const user = userEvent.setup();
      const onRoleChange = vi.fn();
      const onStatusChange = vi.fn();
      
      render(
        <UserFilters
          statusFilter="active"
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
        />
      );
      
      const statusTrigger = screen.getByLabelText('Filter by status');
      await user.click(statusTrigger);
      
      const allOption = await screen.findByRole('option', { name: 'All statuses' });
      await user.click(allOption);
      
      expect(onStatusChange).toHaveBeenCalledWith('All');
    });

    it('should not call onRoleChange when status is changed', async () => {
      const user = userEvent.setup();
      const onRoleChange = vi.fn();
      const onStatusChange = vi.fn();
      
      render(
        <UserFilters
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
        />
      );
      
      const statusTrigger = screen.getByLabelText('Filter by status');
      await user.click(statusTrigger);
      
      const activeOption = await screen.findByRole('option', { name: 'Active' });
      await user.click(activeOption);
      
      expect(onStatusChange).toHaveBeenCalled();
      expect(onRoleChange).not.toHaveBeenCalled();
    });
  });

  describe('Combined Filters - Requirement 3.4', () => {
    it('should handle both role and status filters independently', async () => {
      const user = userEvent.setup();
      const onRoleChange = vi.fn();
      const onStatusChange = vi.fn();
      
      render(
        <UserFilters
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
        />
      );
      
      // Select role
      const roleTrigger = screen.getByLabelText('Filter by role');
      await user.click(roleTrigger);
      const adminOption = await screen.findByRole('option', { name: 'Admin' });
      await user.click(adminOption);
      
      // Select status
      const statusTrigger = screen.getByLabelText('Filter by status');
      await user.click(statusTrigger);
      const activeOption = await screen.findByRole('option', { name: 'Active' });
      await user.click(activeOption);
      
      expect(onRoleChange).toHaveBeenCalledWith('Admin');
      expect(onStatusChange).toHaveBeenCalledWith('active');
    });

    it('should maintain role filter when status filter changes', async () => {
      const user = userEvent.setup();
      const onRoleChange = vi.fn();
      const onStatusChange = vi.fn();
      
      const { rerender } = render(
        <UserFilters
          roleFilter="Member"
          statusFilter="All"
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
        />
      );
      
      // Change status filter
      const statusTrigger = screen.getByLabelText('Filter by status');
      await user.click(statusTrigger);
      const activeOption = await screen.findByRole('option', { name: 'Active' });
      await user.click(activeOption);
      
      // Simulate parent updating state
      rerender(
        <UserFilters
          roleFilter="Member"
          statusFilter="active"
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
        />
      );
      
      const roleTrigger = screen.getByLabelText('Filter by role');
      expect(roleTrigger).toHaveTextContent('Member');
    });

    it('should maintain status filter when role filter changes', async () => {
      const user = userEvent.setup();
      const onRoleChange = vi.fn();
      const onStatusChange = vi.fn();
      
      const { rerender } = render(
        <UserFilters
          roleFilter="All"
          statusFilter="deactivated"
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
        />
      );
      
      // Change role filter
      const roleTrigger = screen.getByLabelText('Filter by role');
      await user.click(roleTrigger);
      const guestOption = await screen.findByRole('option', { name: 'Guest' });
      await user.click(guestOption);
      
      // Simulate parent updating state
      rerender(
        <UserFilters
          roleFilter="Guest"
          statusFilter="deactivated"
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
        />
      );
      
      const statusTrigger = screen.getByLabelText('Filter by status');
      expect(statusTrigger).toHaveTextContent('Deactivated');
    });
  });

  describe('URL Persistence Support - Requirement 3.5', () => {
    it('should sync with roleFilter prop changes', () => {
      const onRoleChange = vi.fn();
      const onStatusChange = vi.fn();
      
      const { rerender } = render(
        <UserFilters
          roleFilter="All"
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
        />
      );
      
      const roleTrigger = screen.getByLabelText('Filter by role');
      expect(roleTrigger).toHaveTextContent('All roles');
      
      // Simulate URL parameter change (parent updates roleFilter prop)
      rerender(
        <UserFilters
          roleFilter="Admin"
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
        />
      );
      
      expect(roleTrigger).toHaveTextContent('Admin');
    });

    it('should sync with statusFilter prop changes', () => {
      const onRoleChange = vi.fn();
      const onStatusChange = vi.fn();
      
      const { rerender } = render(
        <UserFilters
          statusFilter="All"
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
        />
      );
      
      const statusTrigger = screen.getByLabelText('Filter by status');
      expect(statusTrigger).toHaveTextContent('All statuses');
      
      // Simulate URL parameter change (parent updates statusFilter prop)
      rerender(
        <UserFilters
          statusFilter="active"
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
        />
      );
      
      expect(statusTrigger).toHaveTextContent('Active');
    });

    it('should handle filter reset (both to All)', () => {
      const onRoleChange = vi.fn();
      const onStatusChange = vi.fn();
      
      const { rerender } = render(
        <UserFilters
          roleFilter="Admin"
          statusFilter="active"
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
        />
      );
      
      // Reset filters
      rerender(
        <UserFilters
          roleFilter="All"
          statusFilter="All"
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
        />
      );
      
      const roleTrigger = screen.getByLabelText('Filter by role');
      const statusTrigger = screen.getByLabelText('Filter by status');
      
      expect(roleTrigger).toHaveTextContent('All roles');
      expect(statusTrigger).toHaveTextContent('All statuses');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA label on role filter', () => {
      const onRoleChange = vi.fn();
      const onStatusChange = vi.fn();
      
      render(
        <UserFilters
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
        />
      );
      
      const roleTrigger = screen.getByLabelText('Filter by role');
      expect(roleTrigger).toBeInTheDocument();
    });

    it('should have proper ARIA label on status filter', () => {
      const onRoleChange = vi.fn();
      const onStatusChange = vi.fn();
      
      render(
        <UserFilters
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
        />
      );
      
      const statusTrigger = screen.getByLabelText('Filter by status');
      expect(statusTrigger).toBeInTheDocument();
    });

    it('should have associated labels for both filters', () => {
      const onRoleChange = vi.fn();
      const onStatusChange = vi.fn();
      
      render(
        <UserFilters
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
        />
      );
      
      const roleLabel = screen.getByText('Role');
      const statusLabel = screen.getByText('Status');
      
      expect(roleLabel).toBeInTheDocument();
      expect(statusLabel).toBeInTheDocument();
    });

    it('should be keyboard accessible - role filter', async () => {
      const user = userEvent.setup();
      const onRoleChange = vi.fn();
      const onStatusChange = vi.fn();
      
      render(
        <UserFilters
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
        />
      );
      
      const roleTrigger = screen.getByLabelText('Filter by role');
      
      // Tab to role filter
      await user.tab();
      expect(roleTrigger).toHaveFocus();
      
      // Open with Enter
      await user.keyboard('{Enter}');
      
      // Options should be visible
      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Admin' })).toBeInTheDocument();
      });
    });

    it('should be keyboard accessible - status filter', async () => {
      const user = userEvent.setup();
      const onRoleChange = vi.fn();
      const onStatusChange = vi.fn();
      
      render(
        <UserFilters
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
        />
      );
      
      const statusTrigger = screen.getByLabelText('Filter by status');
      
      // Focus status filter
      statusTrigger.focus();
      expect(statusTrigger).toHaveFocus();
      
      // Open with Space
      await user.keyboard(' ');
      
      // Options should be visible
      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Active' })).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid filter changes', async () => {
      const user = userEvent.setup();
      const onRoleChange = vi.fn();
      const onStatusChange = vi.fn();
      
      render(
        <UserFilters
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
        />
      );
      
      const roleTrigger = screen.getByLabelText('Filter by role');
      
      // Rapidly change role filter
      await user.click(roleTrigger);
      const adminOption = await screen.findByRole('option', { name: 'Admin' });
      await user.click(adminOption);
      
      await user.click(roleTrigger);
      const memberOption = await screen.findByRole('option', { name: 'Member' });
      await user.click(memberOption);
      
      await user.click(roleTrigger);
      const guestOption = await screen.findByRole('option', { name: 'Guest' });
      await user.click(guestOption);
      
      expect(onRoleChange).toHaveBeenCalledTimes(3);
      expect(onRoleChange).toHaveBeenNthCalledWith(1, 'Admin');
      expect(onRoleChange).toHaveBeenNthCalledWith(2, 'Member');
      expect(onRoleChange).toHaveBeenNthCalledWith(3, 'Guest');
    });

    it('should handle undefined filter props gracefully', () => {
      const onRoleChange = vi.fn();
      const onStatusChange = vi.fn();
      
      render(
        <UserFilters
          roleFilter={undefined}
          statusFilter={undefined}
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
        />
      );
      
      const roleTrigger = screen.getByLabelText('Filter by role');
      const statusTrigger = screen.getByLabelText('Filter by status');
      
      // Should default to "All"
      expect(roleTrigger).toHaveTextContent('All roles');
      expect(statusTrigger).toHaveTextContent('All statuses');
    });

    it('should handle all combinations of role and status', () => {
      const onRoleChange = vi.fn();
      const onStatusChange = vi.fn();
      
      const roles: Array<'All' | 'Admin' | 'Member' | 'Guest'> = ['All', 'Admin', 'Member', 'Guest'];
      const statuses: Array<'All' | 'active' | 'deactivated'> = ['All', 'active', 'deactivated'];
      
      roles.forEach(role => {
        statuses.forEach(status => {
          const { unmount } = render(
            <UserFilters
              roleFilter={role}
              statusFilter={status}
              onRoleChange={onRoleChange}
              onStatusChange={onStatusChange}
            />
          );
          
          const roleTrigger = screen.getByLabelText('Filter by role');
          const statusTrigger = screen.getByLabelText('Filter by status');
          
          expect(roleTrigger).toBeInTheDocument();
          expect(statusTrigger).toBeInTheDocument();
          
          unmount();
        });
      });
    });
  });

  describe('Component Lifecycle', () => {
    it('should handle re-renders correctly', () => {
      const onRoleChange = vi.fn();
      const onStatusChange = vi.fn();
      
      const { rerender } = render(
        <UserFilters
          roleFilter="Admin"
          statusFilter="active"
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
        />
      );
      
      // Re-render with same props
      rerender(
        <UserFilters
          roleFilter="Admin"
          statusFilter="active"
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
        />
      );
      
      const roleTrigger = screen.getByLabelText('Filter by role');
      const statusTrigger = screen.getByLabelText('Filter by status');
      
      expect(roleTrigger).toHaveTextContent('Admin');
      expect(statusTrigger).toHaveTextContent('Active');
    });

    it('should handle callback function changes', async () => {
      const user = userEvent.setup();
      const onRoleChange1 = vi.fn();
      const onRoleChange2 = vi.fn();
      const onStatusChange = vi.fn();
      
      const { rerender } = render(
        <UserFilters
          onRoleChange={onRoleChange1}
          onStatusChange={onStatusChange}
        />
      );
      
      // Change the callback function
      rerender(
        <UserFilters
          onRoleChange={onRoleChange2}
          onStatusChange={onStatusChange}
        />
      );
      
      // Trigger change
      const roleTrigger = screen.getByLabelText('Filter by role');
      await user.click(roleTrigger);
      const adminOption = await screen.findByRole('option', { name: 'Admin' });
      await user.click(adminOption);
      
      // New callback should be called
      expect(onRoleChange2).toHaveBeenCalledWith('Admin');
      expect(onRoleChange1).not.toHaveBeenCalled();
    });
  });

  describe('Layout and Styling', () => {
    it('should render filters in horizontal layout', () => {
      const onRoleChange = vi.fn();
      const onStatusChange = vi.fn();
      
      const { container } = render(
        <UserFilters
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
        />
      );
      
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('flex');
    });

    it('should have gap between filters', () => {
      const onRoleChange = vi.fn();
      const onStatusChange = vi.fn();
      
      const { container } = render(
        <UserFilters
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
        />
      );
      
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('gap-3');
    });

    it('should have minimum width for select elements', () => {
      const onRoleChange = vi.fn();
      const onStatusChange = vi.fn();
      
      render(
        <UserFilters
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
        />
      );
      
      const roleContainer = screen.getByText('Role').parentElement;
      const statusContainer = screen.getByText('Status').parentElement;
      
      expect(roleContainer).toHaveClass('min-w-[140px]');
      expect(statusContainer).toHaveClass('min-w-[160px]');
    });
  });
});
