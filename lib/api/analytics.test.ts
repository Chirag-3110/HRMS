/**
 * Unit tests for Analytics API functions
 * 
 * Tests cover:
 * - fetchAnalyticsSummary
 * - fetchRegistrationTrends
 * - fetchRoleBreakdown
 * - fetchStatusBreakdown
 * - Error handling and transformation
 * - Date range filtering
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../axios';
import {
  fetchAnalyticsSummary,
  fetchRegistrationTrends,
  fetchRoleBreakdown,
  fetchStatusBreakdown,
  AnalyticsApiError,
  type AnalyticsSummary,
  type RegistrationTrend,
  type RoleBreakdown,
  type StatusBreakdown,
} from './analytics';

// Mock the axios instance
vi.mock('../axios', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('Analytics API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchAnalyticsSummary', () => {
    it('should fetch analytics summary successfully', async () => {
      const mockSummary: AnalyticsSummary = {
        totalUsers: 150,
        activeUsers: 120,
        newUsersLast30Days: 25,
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockSummary });

      const result = await fetchAnalyticsSummary();

      expect(apiClient.get).toHaveBeenCalledWith('/analytics/summary');
      expect(result).toEqual(mockSummary);
    });

    it('should handle errors with proper transformation', async () => {
      const mockError = {
        response: {
          status: 500,
          data: { message: 'Internal server error' },
        },
      };

      vi.mocked(apiClient.get).mockRejectedValue(mockError);

      await expect(fetchAnalyticsSummary()).rejects.toThrow(AnalyticsApiError);
      await expect(fetchAnalyticsSummary()).rejects.toThrow(
        'An error occurred while fetching analytics. Please try again later.'
      );
    });

    it('should handle unauthorized errors', async () => {
      const mockError = {
        response: {
          status: 401,
        },
      };

      vi.mocked(apiClient.get).mockRejectedValue(mockError);

      await expect(fetchAnalyticsSummary()).rejects.toThrow(
        'You are not authenticated. Please log in again.'
      );
    });
  });

  describe('fetchRegistrationTrends', () => {
    it('should fetch registration trends without date range', async () => {
      const mockTrends: RegistrationTrend = {
        data: [
          { month: '2024-01', count: 10 },
          { month: '2024-02', count: 15 },
          { month: '2024-03', count: 20 },
        ],
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockTrends });

      const result = await fetchRegistrationTrends();

      expect(apiClient.get).toHaveBeenCalledWith('/analytics/registration-trends', {
        params: {},
      });
      expect(result).toEqual(mockTrends);
    });

    it('should fetch registration trends with date range', async () => {
      const mockTrends: RegistrationTrend = {
        data: [
          { month: '2024-01', count: 10 },
          { month: '2024-02', count: 15 },
        ],
      };

      const dateRange = {
        startDate: '2024-01-01',
        endDate: '2024-02-28',
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockTrends });

      const result = await fetchRegistrationTrends(dateRange);

      expect(apiClient.get).toHaveBeenCalledWith('/analytics/registration-trends', {
        params: {
          startDate: '2024-01-01',
          endDate: '2024-02-28',
        },
      });
      expect(result).toEqual(mockTrends);
    });

    it('should handle partial date range', async () => {
      const mockTrends: RegistrationTrend = {
        data: [{ month: '2024-01', count: 10 }],
      };

      const dateRange = {
        startDate: '2024-01-01',
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockTrends });

      const result = await fetchRegistrationTrends(dateRange);

      expect(apiClient.get).toHaveBeenCalledWith('/analytics/registration-trends', {
        params: {
          startDate: '2024-01-01',
        },
      });
      expect(result).toEqual(mockTrends);
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      vi.mocked(apiClient.get).mockRejectedValue(networkError);

      await expect(fetchRegistrationTrends()).rejects.toThrow(
        'Network error. Please check your internet connection.'
      );
    });
  });

  describe('fetchRoleBreakdown', () => {
    it('should fetch role breakdown successfully', async () => {
      const mockBreakdown: RoleBreakdown = {
        data: [
          { role: 'Admin', count: 10 },
          { role: 'Member', count: 100 },
          { role: 'Guest', count: 40 },
        ],
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockBreakdown });

      const result = await fetchRoleBreakdown();

      expect(apiClient.get).toHaveBeenCalledWith('/analytics/role-breakdown', {
        params: {},
      });
      expect(result).toEqual(mockBreakdown);
    });

    it('should fetch role breakdown with date range', async () => {
      const mockBreakdown: RoleBreakdown = {
        data: [
          { role: 'Admin', count: 5 },
          { role: 'Member', count: 50 },
        ],
      };

      const dateRange = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockBreakdown });

      const result = await fetchRoleBreakdown(dateRange);

      expect(apiClient.get).toHaveBeenCalledWith('/analytics/role-breakdown', {
        params: {
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        },
      });
      expect(result).toEqual(mockBreakdown);
    });

    it('should handle 403 forbidden errors', async () => {
      const mockError = {
        response: {
          status: 403,
        },
      };

      vi.mocked(apiClient.get).mockRejectedValue(mockError);

      await expect(fetchRoleBreakdown()).rejects.toThrow(
        'You do not have permission to view analytics.'
      );
    });
  });

  describe('fetchStatusBreakdown', () => {
    it('should fetch status breakdown successfully', async () => {
      const mockBreakdown: StatusBreakdown = {
        data: [
          { status: 'active', count: 120 },
          { status: 'deactivated', count: 30 },
        ],
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockBreakdown });

      const result = await fetchStatusBreakdown();

      expect(apiClient.get).toHaveBeenCalledWith('/analytics/status-breakdown', {
        params: {},
      });
      expect(result).toEqual(mockBreakdown);
    });

    it('should fetch status breakdown with date range', async () => {
      const mockBreakdown: StatusBreakdown = {
        data: [{ status: 'active', count: 100 }],
      };

      const dateRange = {
        startDate: '2024-01-01',
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockBreakdown });

      const result = await fetchStatusBreakdown(dateRange);

      expect(apiClient.get).toHaveBeenCalledWith('/analytics/status-breakdown', {
        params: {
          startDate: '2024-01-01',
        },
      });
      expect(result).toEqual(mockBreakdown);
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('timeout of 30000ms exceeded');
      vi.mocked(apiClient.get).mockRejectedValue(timeoutError);

      await expect(fetchStatusBreakdown()).rejects.toThrow(
        'Request timed out. Please check your connection and try again.'
      );
    });

    it('should handle 404 not found errors', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { message: 'Analytics endpoint not found' },
        },
      };

      vi.mocked(apiClient.get).mockRejectedValue(mockError);

      await expect(fetchStatusBreakdown()).rejects.toThrow('Analytics data not found.');
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('should handle errors with custom messages', async () => {
      const mockError = {
        response: {
          status: 400,
          data: { message: 'Invalid date format provided' },
        },
      };

      vi.mocked(apiClient.get).mockRejectedValue(mockError);

      await expect(fetchRegistrationTrends()).rejects.toThrow(
        'Invalid date format provided'
      );
    });

    it('should handle service unavailable errors', async () => {
      const mockError = {
        response: {
          status: 503,
        },
      };

      vi.mocked(apiClient.get).mockRejectedValue(mockError);

      await expect(fetchAnalyticsSummary()).rejects.toThrow(
        'Analytics service is temporarily unavailable. Please try again later.'
      );
    });

    it('should handle unknown errors gracefully', async () => {
      vi.mocked(apiClient.get).mockRejectedValue('unknown error');

      await expect(fetchAnalyticsSummary()).rejects.toThrow(
        'An unknown error occurred while fetching analytics.'
      );
    });
  });
});
