/**
 * ActivityLog Component Tests
 * 
 * Tests the ActivityLog component functionality including:
 * - Display of activity entries
 * - Pagination (50 entries per page)
 * - Filtering by activity type
 * - Filtering by date range
 * - Reverse chronological ordering
 * 
 * Validates Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActivityLog } from '../ActivityLog';
import type { Activity } from '@/lib/api/users';

// Helper to create mock activities
function createMockActivity(overrides: Partial<Activity> = {}): Activity {
  return {
    id: `activity-${Math.random()}`,
    timestamp: new Date().toISOString(),
    actionType: 'login',
    description: 'User logged in',
    ...overrides,
  };
}

// Helper to create multiple activities
function createMockActivities(count: number, baseDate = new Date()): Activity[] {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(baseDate);
    date.setHours(date.getHours() - index); // Each activity 1 hour earlier
    return createMockActivity({
      id: `activity-${index + 1}`,
      timestamp: date.toISOString(),
      actionType: index % 3 === 0 ? 'login' : index % 3 === 1 ? 'logout' : 'profile_update',
      description: `Activity ${index + 1}`,
    });
  });
}

describe('ActivityLog Component', () => {
  describe('Display Requirements (Req 9.1, 9.2)', () => {
    it('should display activity entries with timestamp, action type, and description', () => {
      const activities = [
        createMockActivity({
          id: '1',
          timestamp: '2024-01-15T15:45:00.000Z',
          actionType: 'login',
          description: 'User logged in from Chrome',
        }),
      ];

      render(<ActivityLog activities={activities} />);

      // Check that activity is displayed
      expect(screen.getByText('User logged in from Chrome')).toBeInTheDocument();
      expect(screen.getByText('Login')).toBeInTheDocument();
      
      // Check timestamp is formatted and displayed
      const timestamp = screen.getByText(/Jan 15, 2024 at/i);
      expect(timestamp).toBeInTheDocument();
    });

    it('should display header with activity count', () => {
      const activities = createMockActivities(5);
      render(<ActivityLog activities={activities} />);

      expect(screen.getByText('Activity Log')).toBeInTheDocument();
      expect(screen.getByText('5 activities')).toBeInTheDocument();
    });

    it('should display empty state when no activities exist', () => {
      render(<ActivityLog activities={[]} />);

      expect(screen.getByText('No activity history available')).toBeInTheDocument();
    });

    it('should display loading state', () => {
      render(<ActivityLog activities={[]} loading={true} />);

      // Check for loading animation elements
      const loadingElements = document.querySelectorAll('.animate-pulse');
      expect(loadingElements.length).toBeGreaterThan(0);
    });
  });

  describe('Pagination (Req 9.3)', () => {
    it('should paginate activities with 50 entries per page', () => {
      const activities = createMockActivities(75);
      render(<ActivityLog activities={activities} />);

      // Should show "Showing 1 to 50 of 75 activities"
      expect(screen.getByText(/Showing 1 to 50 of 75 activities/i)).toBeInTheDocument();

      // Should only display 50 activities (not all 75)
      const activityCards = document.querySelectorAll('.bg-white.rounded-lg.border');
      expect(activityCards.length).toBe(50);
    });

    it('should navigate to next page', async () => {
      const user = userEvent.setup();
      const activities = createMockActivities(75);
      render(<ActivityLog activities={activities} />);

      // Click next button
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      // Should now show page 2
      expect(screen.getByText(/Showing 51 to 75 of 75 activities/i)).toBeInTheDocument();
    });

    it('should navigate to previous page', async () => {
      const user = userEvent.setup();
      const activities = createMockActivities(75);
      render(<ActivityLog activities={activities} />);

      // Go to page 2
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      // Go back to page 1
      const prevButton = screen.getByRole('button', { name: /previous/i });
      await user.click(prevButton);

      expect(screen.getByText(/Showing 1 to 50 of 75 activities/i)).toBeInTheDocument();
    });

    it('should disable previous button on first page', () => {
      const activities = createMockActivities(75);
      render(<ActivityLog activities={activities} />);

      const prevButton = screen.getByRole('button', { name: /previous/i });
      expect(prevButton).toBeDisabled();
    });

    it('should disable next button on last page', async () => {
      const user = userEvent.setup();
      const activities = createMockActivities(75);
      render(<ActivityLog activities={activities} />);

      // Go to page 2 (last page)
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      expect(nextButton).toBeDisabled();
    });
  });

  describe('Activity Type Filtering (Req 9.4)', () => {
    it('should filter activities by action type', async () => {
      const user = userEvent.setup();
      const activities = [
        createMockActivity({ id: '1', actionType: 'login', description: 'Login activity' }),
        createMockActivity({ id: '2', actionType: 'logout', description: 'Logout activity' }),
        createMockActivity({ id: '3', actionType: 'login', description: 'Another login' }),
      ];

      render(<ActivityLog activities={activities} />);

      // Initially should show all 3 activities
      expect(screen.getByText('3 activities')).toBeInTheDocument();

      // Open activity type filter dropdown
      const activityTypeSelect = screen.getByRole('combobox', { name: /activity type/i });
      await user.click(activityTypeSelect);

      // Select "Login" from dropdown
      const loginOption = screen.getByRole('option', { name: /^Login$/i });
      await user.click(loginOption);

      // Should now show only 2 activities (the login ones)
      expect(screen.getByText('2 activities')).toBeInTheDocument();
      expect(screen.getByText('Login activity')).toBeInTheDocument();
      expect(screen.getByText('Another login')).toBeInTheDocument();
      expect(screen.queryByText('Logout activity')).not.toBeInTheDocument();
    });

    it('should show all activities when "All types" is selected', async () => {
      const user = userEvent.setup();
      const activities = createMockActivities(10);
      render(<ActivityLog activities={activities} />);

      // Filter by a specific type first
      const activityTypeSelect = screen.getByRole('combobox', { name: /activity type/i });
      await user.click(activityTypeSelect);
      
      const loginOption = screen.getByRole('option', { name: /^Login$/i });
      await user.click(loginOption);

      // Now select "All types"
      await user.click(activityTypeSelect);
      const allTypesOption = screen.getByRole('option', { name: /all types/i });
      await user.click(allTypesOption);

      // Should show all 10 activities again
      expect(screen.getByText('10 activities')).toBeInTheDocument();
    });
  });

  describe('Date Range Filtering (Req 9.4)', () => {
    it('should filter activities by start date', async () => {
      const user = userEvent.setup();
      const baseDate = new Date('2024-01-15T12:00:00.000Z');
      const activities = [
        createMockActivity({ id: '1', timestamp: '2024-01-10T12:00:00.000Z', description: 'Old activity' }),
        createMockActivity({ id: '2', timestamp: '2024-01-15T12:00:00.000Z', description: 'Recent activity' }),
        createMockActivity({ id: '3', timestamp: '2024-01-20T12:00:00.000Z', description: 'Newest activity' }),
      ];

      render(<ActivityLog activities={activities} />);

      // Set start date filter
      const startDateInput = screen.getByLabelText(/start date/i);
      await user.type(startDateInput, '2024-01-15');

      // Should only show activities from Jan 15 onwards
      expect(screen.getByText('2 activities')).toBeInTheDocument();
      expect(screen.queryByText('Old activity')).not.toBeInTheDocument();
      expect(screen.getByText('Recent activity')).toBeInTheDocument();
      expect(screen.getByText('Newest activity')).toBeInTheDocument();
    });

    it('should filter activities by end date', async () => {
      const user = userEvent.setup();
      const activities = [
        createMockActivity({ id: '1', timestamp: '2024-01-10T12:00:00.000Z', description: 'Old activity' }),
        createMockActivity({ id: '2', timestamp: '2024-01-15T12:00:00.000Z', description: 'Recent activity' }),
        createMockActivity({ id: '3', timestamp: '2024-01-20T12:00:00.000Z', description: 'Newest activity' }),
      ];

      render(<ActivityLog activities={activities} />);

      // Set end date filter
      const endDateInput = screen.getByLabelText(/end date/i);
      await user.type(endDateInput, '2024-01-15');

      // Should only show activities up to Jan 15
      expect(screen.getByText('2 activities')).toBeInTheDocument();
      expect(screen.getByText('Old activity')).toBeInTheDocument();
      expect(screen.getByText('Recent activity')).toBeInTheDocument();
      expect(screen.queryByText('Newest activity')).not.toBeInTheDocument();
    });

    it('should filter activities by date range', async () => {
      const user = userEvent.setup();
      const activities = [
        createMockActivity({ id: '1', timestamp: '2024-01-05T12:00:00.000Z', description: 'Too old' }),
        createMockActivity({ id: '2', timestamp: '2024-01-10T12:00:00.000Z', description: 'In range 1' }),
        createMockActivity({ id: '3', timestamp: '2024-01-15T12:00:00.000Z', description: 'In range 2' }),
        createMockActivity({ id: '4', timestamp: '2024-01-20T12:00:00.000Z', description: 'Too new' }),
      ];

      render(<ActivityLog activities={activities} />);

      // Set date range filter
      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);
      
      await user.type(startDateInput, '2024-01-10');
      await user.type(endDateInput, '2024-01-15');

      // Should only show activities in range
      expect(screen.getByText('2 activities')).toBeInTheDocument();
      expect(screen.queryByText('Too old')).not.toBeInTheDocument();
      expect(screen.getByText('In range 1')).toBeInTheDocument();
      expect(screen.getByText('In range 2')).toBeInTheDocument();
      expect(screen.queryByText('Too new')).not.toBeInTheDocument();
    });
  });

  describe('Clear Filters', () => {
    it('should clear all filters when clear button is clicked', async () => {
      const user = userEvent.setup();
      const activities = createMockActivities(10);
      render(<ActivityLog activities={activities} />);

      // Apply filters
      const activityTypeSelect = screen.getByRole('combobox', { name: /activity type/i });
      await user.click(activityTypeSelect);
      const loginOption = screen.getByRole('option', { name: /^Login$/i });
      await user.click(loginOption);

      const startDateInput = screen.getByLabelText(/start date/i);
      await user.type(startDateInput, '2024-01-15');

      // Clear filters button should appear
      const clearButton = screen.getByRole('button', { name: /clear filters/i });
      expect(clearButton).toBeInTheDocument();

      // Click clear button
      await user.click(clearButton);

      // All filters should be reset
      expect(screen.getByText('10 activities')).toBeInTheDocument();
      expect(startDateInput).toHaveValue('');
    });
  });

  describe('Reverse Chronological Ordering (Req 9.5)', () => {
    it('should display activities in reverse chronological order (newest first)', () => {
      const activities = [
        createMockActivity({ id: '1', timestamp: '2024-01-10T12:00:00.000Z', description: 'Oldest' }),
        createMockActivity({ id: '2', timestamp: '2024-01-15T12:00:00.000Z', description: 'Middle' }),
        createMockActivity({ id: '3', timestamp: '2024-01-20T12:00:00.000Z', description: 'Newest' }),
      ];

      render(<ActivityLog activities={activities} />);

      const activityCards = document.querySelectorAll('.bg-white.rounded-lg.border');
      
      // First card should be the newest
      expect(within(activityCards[0] as HTMLElement).getByText('Newest')).toBeInTheDocument();
      
      // Second card should be middle
      expect(within(activityCards[1] as HTMLElement).getByText('Middle')).toBeInTheDocument();
      
      // Third card should be oldest
      expect(within(activityCards[2] as HTMLElement).getByText('Oldest')).toBeInTheDocument();
    });
  });

  describe('Filter State Persistence', () => {
    it('should reset to page 1 when filters change', async () => {
      const user = userEvent.setup();
      const activities = createMockActivities(75);
      render(<ActivityLog activities={activities} />);

      // Go to page 2
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);
      expect(screen.getByText(/Showing 51 to 75/i)).toBeInTheDocument();

      // Apply a filter
      const activityTypeSelect = screen.getByRole('combobox', { name: /activity type/i });
      await user.click(activityTypeSelect);
      const loginOption = screen.getByRole('option', { name: /^Login$/i });
      await user.click(loginOption);

      // Should reset to page 1 - after filtering, we'll have 25 login activities (every 3rd is login)
      // So it should show "Showing 1 to 25 of 25 activities" (no pagination needed)
      expect(screen.getByText('25 activities')).toBeInTheDocument();
    });
  });

  describe('Empty Filter Results', () => {
    it('should show appropriate message when filters return no results', async () => {
      const user = userEvent.setup();
      const activities = [
        createMockActivity({ id: '1', actionType: 'login', description: 'Login activity' }),
      ];

      render(<ActivityLog activities={activities} />);

      // Filter by date in the future that won't match any activities
      const startDateInput = screen.getByLabelText(/start date/i);
      await user.type(startDateInput, '2099-01-01');

      expect(screen.getByText('No activities match the selected filters')).toBeInTheDocument();
    });
  });
});
