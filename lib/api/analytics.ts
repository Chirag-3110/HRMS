/**
 * Analytics API functions
 * 
 * This module contains API calls for analytics data:
 * - Fetch summary statistics (total users, active users, new users)
 * - Fetch registration trends over time
 * - Fetch role breakdown
 * - Fetch status breakdown
 * 
 * All functions use axios for HTTP requests.
 * 
 * Validates Requirements:
 * - 10.1: Display summary statistics (total users, active users, new users)
 * - 10.2: Display registration trend chart (12 months)
 * - 10.3: Display role breakdown chart
 * - 10.4: Display status breakdown chart
 * - 10.5: Display loading indicators during fetch
 */

import { apiClient } from '../axios';
import type { UserRole, UserStatus } from '../schemas/user';

/**
 * TypeScript Interfaces for Analytics API Responses
 * Matches design document specifications
 */

export interface AnalyticsSummary {
  totalUsers: number;
  activeUsers: number;
  newUsersLast30Days: number;
}

export interface RegistrationTrendPoint {
  month: string;
  count: number;
}

export interface RegistrationTrend {
  data: RegistrationTrendPoint[];
}

export interface RoleBreakdownItem {
  role: UserRole;
  count: number;
}

export interface RoleBreakdown {
  data: RoleBreakdownItem[];
}

export interface StatusBreakdownItem {
  status: UserStatus;
  count: number;
}

export interface StatusBreakdown {
  data: StatusBreakdownItem[];
}

export interface DateRangeFilter {
  startDate?: string; // ISO 8601 format
  endDate?: string; // ISO 8601 format
}

/**
 * API Error transformation for analytics endpoints
 */
export class AnalyticsApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'AnalyticsApiError';
  }
}

/**
 * Transform axios errors into user-friendly messages
 */
function transformAnalyticsError(error: unknown): AnalyticsApiError {
  if (error instanceof AnalyticsApiError) {
    return error;
  }

  // Handle axios errors
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as {
      response?: {
        status: number;
        data?: { message?: string; error?: string };
      };
      message?: string;
    };

    const status = axiosError.response?.status;
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message;

    switch (status) {
      case 400:
        return new AnalyticsApiError(
          errorMessage || 'Invalid analytics request. Please check your parameters.',
          400,
          error
        );
      case 401:
        return new AnalyticsApiError(
          'You are not authenticated. Please log in again.',
          401,
          error
        );
      case 403:
        return new AnalyticsApiError(
          'You do not have permission to view analytics.',
          403,
          error
        );
      case 404:
        return new AnalyticsApiError(
          'Analytics data not found.',
          404,
          error
        );
      case 500:
        return new AnalyticsApiError(
          'An error occurred while fetching analytics. Please try again later.',
          500,
          error
        );
      case 503:
        return new AnalyticsApiError(
          'Analytics service is temporarily unavailable. Please try again later.',
          503,
          error
        );
      default:
        return new AnalyticsApiError(
          errorMessage || 'An unexpected error occurred while fetching analytics.',
          status,
          error
        );
    }
  }

  // Handle network errors
  if (error instanceof Error) {
    if (error.message.includes('timeout')) {
      return new AnalyticsApiError(
        'Request timed out. Please check your connection and try again.',
        undefined,
        error
      );
    }
    if (error.message.includes('Network Error')) {
      return new AnalyticsApiError(
        'Network error. Please check your internet connection.',
        undefined,
        error
      );
    }
    return new AnalyticsApiError(error.message, undefined, error);
  }

  return new AnalyticsApiError(
    'An unknown error occurred while fetching analytics.',
    undefined,
    error
  );
}

/**
 * Fetch analytics summary statistics
 * 
 * Returns total users, active users, and new users in the last 30 days
 * 
 * @returns Promise with analytics summary data
 * @throws AnalyticsApiError with user-friendly message
 * 
 * Validates Requirements: 10.1
 */
export async function fetchAnalyticsSummary(): Promise<AnalyticsSummary> {
  try {
    const response = await apiClient.get<AnalyticsSummary>('/analytics/summary');
    return response.data;
  } catch (error) {
    throw transformAnalyticsError(error);
  }
}

/**
 * Fetch user registration trends over time
 * 
 * Returns registration counts grouped by month for the specified date range
 * Defaults to last 12 months if no date range provided
 * 
 * @param dateRange - Optional date range filter for trends
 * @returns Promise with registration trend data
 * @throws AnalyticsApiError with user-friendly message
 * 
 * Validates Requirements: 10.2
 */
export async function fetchRegistrationTrends(
  dateRange?: DateRangeFilter
): Promise<RegistrationTrend> {
  try {
    const response = await apiClient.get<RegistrationTrend>(
      '/analytics/registration-trends',
      {
        params: {
          ...(dateRange?.startDate && { startDate: dateRange.startDate }),
          ...(dateRange?.endDate && { endDate: dateRange.endDate }),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw transformAnalyticsError(error);
  }
}

/**
 * Fetch user distribution by role
 * 
 * Returns count of users for each role (Admin, Member, Guest)
 * 
 * @param dateRange - Optional date range filter for role breakdown
 * @returns Promise with role breakdown data
 * @throws AnalyticsApiError with user-friendly message
 * 
 * Validates Requirements: 10.3
 */
export async function fetchRoleBreakdown(
  dateRange?: DateRangeFilter
): Promise<RoleBreakdown> {
  try {
    const response = await apiClient.get<RoleBreakdown>(
      '/analytics/role-breakdown',
      {
        params: {
          ...(dateRange?.startDate && { startDate: dateRange.startDate }),
          ...(dateRange?.endDate && { endDate: dateRange.endDate }),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw transformAnalyticsError(error);
  }
}

/**
 * Fetch user distribution by account status
 * 
 * Returns count of users for each status (active, deactivated)
 * 
 * @param dateRange - Optional date range filter for status breakdown
 * @returns Promise with status breakdown data
 * @throws AnalyticsApiError with user-friendly message
 * 
 * Validates Requirements: 10.4
 */
export async function fetchStatusBreakdown(
  dateRange?: DateRangeFilter
): Promise<StatusBreakdown> {
  try {
    const response = await apiClient.get<StatusBreakdown>(
      '/analytics/status-breakdown',
      {
        params: {
          ...(dateRange?.startDate && { startDate: dateRange.startDate }),
          ...(dateRange?.endDate && { endDate: dateRange.endDate }),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw transformAnalyticsError(error);
  }
}
