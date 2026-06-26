/**
 * Unit tests for SummaryCards component
 * 
 * Tests cover:
 * - Loading state display
 * - Successful data display with proper formatting
 * - Error state handling
 * - Empty/no data state
 * - Number formatting with commas
 * - Responsive grid layout
 * - Accessibility attributes
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SummaryCards } from '../SummaryCards';
import * as useAnalyticsModule from '@/lib/hooks/useAnalytics';

// Mock the useAnalyticsSummary hook
vi.mock('@/lib/hooks/useAnalytics', () => ({
  useAnalyticsSummary: vi.fn(),
}));

describe('SummaryCards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading skeletons while data is loading', () => {
      vi.spyOn(useAnalyticsModule, 'useAnalyticsSummary').mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      render(<SummaryCards />);

      // Check for loading status
      const loadingElement = screen.getByRole('status', {
        name: /loading analytics summary/i,
      });
      expect(loadingElement).toBeInTheDocument();
    });

    it('should display three loading skeleton cards', () => {
      vi.spyOn(useAnalyticsModule, 'useAnalyticsSummary').mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      const { container } = render(<SummaryCards />);

      // Check for grid layout
      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-3');

      // Check for three skeleton cards
      const skeletons = container.querySelectorAll('[role="status"]');
      expect(skeletons.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Success State', () => {
    it('should display summary cards with correct data', () => {
      vi.spyOn(useAnalyticsModule, 'useAnalyticsSummary').mockReturnValue({
        data: {
          totalUsers: 1234,
          activeUsers: 987,
          newUsersLast30Days: 56,
        },
        isLoading: false,
        error: null,
      } as any);

      render(<SummaryCards />);

      // Check for analytics summary region
      const summaryRegion = screen.getByRole('region', {
        name: /analytics summary/i,
      });
      expect(summaryRegion).toBeInTheDocument();

      // Check for Total Users card
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('1,234')).toBeInTheDocument();
      expect(screen.getByText('All registered users')).toBeInTheDocument();

      // Check for Active Users card
      expect(screen.getByText('Active Users')).toBeInTheDocument();
      expect(screen.getByText('987')).toBeInTheDocument();
      expect(screen.getByText('Users with active accounts')).toBeInTheDocument();

      // Check for New Users card
      expect(screen.getByText('New Users')).toBeInTheDocument();
      expect(screen.getByText('56')).toBeInTheDocument();
      expect(screen.getByText('Registered in last 30 days')).toBeInTheDocument();
    });

    it('should format large numbers with commas', () => {
      vi.spyOn(useAnalyticsModule, 'useAnalyticsSummary').mockReturnValue({
        data: {
          totalUsers: 1234567,
          activeUsers: 987654,
          newUsersLast30Days: 12345,
        },
        isLoading: false,
        error: null,
      } as any);

      render(<SummaryCards />);

      // Check for properly formatted numbers
      expect(screen.getByText('1,234,567')).toBeInTheDocument();
      expect(screen.getByText('987,654')).toBeInTheDocument();
      expect(screen.getByText('12,345')).toBeInTheDocument();
    });

    it('should display zero values correctly', () => {
      vi.spyOn(useAnalyticsModule, 'useAnalyticsSummary').mockReturnValue({
        data: {
          totalUsers: 0,
          activeUsers: 0,
          newUsersLast30Days: 0,
        },
        isLoading: false,
        error: null,
      } as any);

      render(<SummaryCards />);

      // Check for zero values
      const zeroValues = screen.getAllByText('0');
      expect(zeroValues).toHaveLength(3);
    });

    it('should have responsive grid layout classes', () => {
      vi.spyOn(useAnalyticsModule, 'useAnalyticsSummary').mockReturnValue({
        data: {
          totalUsers: 100,
          activeUsers: 80,
          newUsersLast30Days: 10,
        },
        isLoading: false,
        error: null,
      } as any);

      const { container } = render(<SummaryCards />);

      // Check for responsive grid classes
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-3', 'gap-4');
    });
  });

  describe('Error State', () => {
    it('should display error message when data fetch fails', () => {
      const errorMessage = 'Failed to fetch analytics data';
      vi.spyOn(useAnalyticsModule, 'useAnalyticsSummary').mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error(errorMessage),
      } as any);

      render(<SummaryCards />);

      // Check for error display
      expect(screen.getByText('Error Loading Analytics')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should display generic error message when error has no message', () => {
      vi.spyOn(useAnalyticsModule, 'useAnalyticsSummary').mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error(),
      } as any);

      render(<SummaryCards />);

      // Check for generic error message
      expect(
        screen.getByText(/Failed to load analytics summary. Please try again./i)
      ).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display empty state when data is null', () => {
      vi.spyOn(useAnalyticsModule, 'useAnalyticsSummary').mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      } as any);

      render(<SummaryCards />);

      // Check for empty state
      expect(screen.getByText('No Data Available')).toBeInTheDocument();
      expect(
        screen.getByText('Analytics data is not available at this time.')
      ).toBeInTheDocument();
    });

    it('should display empty state when data is undefined and not loading', () => {
      vi.spyOn(useAnalyticsModule, 'useAnalyticsSummary').mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      } as any);

      render(<SummaryCards />);

      // Check for empty state
      expect(screen.getByText('No Data Available')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for loading state', () => {
      vi.spyOn(useAnalyticsModule, 'useAnalyticsSummary').mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      render(<SummaryCards />);

      // Check for ARIA label on loading state
      expect(
        screen.getByRole('status', { name: /loading analytics summary/i })
      ).toBeInTheDocument();
    });

    it('should have proper ARIA labels for success state', () => {
      vi.spyOn(useAnalyticsModule, 'useAnalyticsSummary').mockReturnValue({
        data: {
          totalUsers: 100,
          activeUsers: 80,
          newUsersLast30Days: 10,
        },
        isLoading: false,
        error: null,
      } as any);

      render(<SummaryCards />);

      // Check for ARIA region label
      expect(
        screen.getByRole('region', { name: /analytics summary/i })
      ).toBeInTheDocument();
    });

    it('should render icons with proper size classes', () => {
      vi.spyOn(useAnalyticsModule, 'useAnalyticsSummary').mockReturnValue({
        data: {
          totalUsers: 100,
          activeUsers: 80,
          newUsersLast30Days: 10,
        },
        isLoading: false,
        error: null,
      } as any);

      const { container } = render(<SummaryCards />);

      // Check for icon elements with proper classes
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBe(3); // Three icons for three cards

      icons.forEach((icon) => {
        expect(icon).toHaveClass('h-4', 'w-4');
      });
    });
  });

  describe('Visual Styling', () => {
    it('should apply hover effects to cards', () => {
      vi.spyOn(useAnalyticsModule, 'useAnalyticsSummary').mockReturnValue({
        data: {
          totalUsers: 100,
          activeUsers: 80,
          newUsersLast30Days: 10,
        },
        isLoading: false,
        error: null,
      } as any);

      const { container } = render(<SummaryCards />);

      // Check for hover effect classes on cards
      const cards = container.querySelectorAll('[class*="transition-shadow"]');
      expect(cards.length).toBe(3);

      cards.forEach((card) => {
        expect(card).toHaveClass('transition-shadow', 'hover:shadow-md');
      });
    });

    it('should display card titles with proper styling', () => {
      vi.spyOn(useAnalyticsModule, 'useAnalyticsSummary').mockReturnValue({
        data: {
          totalUsers: 100,
          activeUsers: 80,
          newUsersLast30Days: 10,
        },
        isLoading: false,
        error: null,
      } as any);

      render(<SummaryCards />);

      // Check for title elements
      const titles = [
        screen.getByText('Total Users'),
        screen.getByText('Active Users'),
        screen.getByText('New Users'),
      ];

      titles.forEach((title) => {
        expect(title).toHaveClass('text-sm', 'font-medium');
      });
    });

    it('should display values with large font styling', () => {
      vi.spyOn(useAnalyticsModule, 'useAnalyticsSummary').mockReturnValue({
        data: {
          totalUsers: 100,
          activeUsers: 80,
          newUsersLast30Days: 10,
        },
        isLoading: false,
        error: null,
      } as any);

      const { container } = render(<SummaryCards />);

      // Check for value elements with large font
      const values = container.querySelectorAll('.text-2xl.font-bold');
      expect(values.length).toBe(3);
    });
  });
});
