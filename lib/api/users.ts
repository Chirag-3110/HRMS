/**
 * User Management API functions
 * 
 * This module contains API calls for user CRUD operations:
 * - Fetch paginated user lists with filtering and search
 * - Get user details with activity logs
 * - Create new users
 * - Update existing users
 * - Change user status (activate/deactivate)
 * - Update user roles
 * 
 * All functions use axios for HTTP requests.
 * 
 * Validates Requirements:
 * - 2.1: User list display with pagination
 * - 2.3: Load users within 2 seconds
 * - 4.1: View detailed user information
 * - 5.3: Create user accounts
 * - 6.4: Update user information
 * - 7.4: Change user status
 * - 8.3: Update user roles
 */

import { apiClient } from '../axios';
import type { UserRole, UserStatus } from '../schemas/user';

/**
 * TypeScript Interfaces for API Responses
 * Matches design document specifications
 */

export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: UserRole;
  status: UserStatus;
  registrationDate: string;
  lastLoginDate?: string;
}

export interface Activity {
  id: string;
  timestamp: string;
  actionType: string;
  description: string;
}

export interface PaginationMetadata {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface PaginatedUsersResponse {
  users: User[];
  pagination: PaginationMetadata;
}

export interface UserDetailResponse extends User {
  activities: Activity[];
}

export interface GetUsersParams {
  page: number;
  pageSize: 10 | 25 | 50 | 100;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface CreateUserRequest {
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  role?: UserRole;
}

export interface UpdateStatusRequest {
  status: UserStatus;
}

/**
 * API Error transformation
 * Converts API errors into user-friendly messages
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Transform axios errors into user-friendly messages
 */
function transformApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
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
        return new ApiError(
          errorMessage || 'Invalid request. Please check your input.',
          400,
          error
        );
      case 401:
        return new ApiError(
          'You are not authenticated. Please log in again.',
          401,
          error
        );
      case 403:
        return new ApiError(
          'You do not have permission to perform this action.',
          403,
          error
        );
      case 404:
        return new ApiError(
          errorMessage || 'The requested resource was not found.',
          404,
          error
        );
      case 409:
        return new ApiError(
          errorMessage || 'A conflict occurred. This resource may already exist.',
          409,
          error
        );
      case 422:
        return new ApiError(
          errorMessage || 'Validation failed. Please check your input.',
          422,
          error
        );
      case 500:
        return new ApiError(
          'An internal server error occurred. Please try again later.',
          500,
          error
        );
      case 503:
        return new ApiError(
          'The service is temporarily unavailable. Please try again later.',
          503,
          error
        );
      default:
        return new ApiError(
          errorMessage || 'An unexpected error occurred. Please try again.',
          status,
          error
        );
    }
  }

  // Handle network errors
  if (error instanceof Error) {
    if (error.message.includes('timeout')) {
      return new ApiError(
        'Request timed out. Please check your connection and try again.',
        undefined,
        error
      );
    }
    if (error.message.includes('Network Error')) {
      return new ApiError(
        'Network error. Please check your internet connection.',
        undefined,
        error
      );
    }
    return new ApiError(error.message, undefined, error);
  }

  return new ApiError(
    'An unknown error occurred. Please try again.',
    undefined,
    error
  );
}

/**
 * Fetch paginated list of users with optional filtering and search
 * 
 * @param params - Pagination and filter parameters
 * @returns Promise with paginated users response
 * @throws ApiError with user-friendly message
 * 
 * Validates Requirements: 2.1, 2.3, 3.1, 3.2, 3.3, 3.4
 */
export async function getUsers(
  params: GetUsersParams
): Promise<PaginatedUsersResponse> {
  try {
    const response = await apiClient.get<PaginatedUsersResponse>('/users', {
      params: {
        page: params.page,
        pageSize: params.pageSize,
        ...(params.search && { search: params.search }),
        ...(params.role && { role: params.role }),
        ...(params.status && { status: params.status }),
      },
    });
    return response.data;
  } catch (error) {
    throw transformApiError(error);
  }
}

/**
 * Fetch detailed information for a specific user including activity log
 * 
 * @param userId - The unique identifier of the user
 * @returns Promise with user detail response including activities
 * @throws ApiError with user-friendly message
 * 
 * Validates Requirements: 4.1, 4.2, 9.1
 */
export async function getUserDetail(
  userId: string
): Promise<UserDetailResponse> {
  try {
    const response = await apiClient.get<UserDetailResponse>(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw transformApiError(error);
  }
}

/**
 * Create a new user account
 * 
 * @param userData - User creation data
 * @returns Promise with created user information
 * @throws ApiError with user-friendly message (e.g., duplicate email)
 * 
 * Validates Requirements: 5.3, 5.4, 5.6
 */
export async function createUser(userData: CreateUserRequest): Promise<User> {
  try {
    const response = await apiClient.post<User>('/users', userData);
    return response.data;
  } catch (error) {
    throw transformApiError(error);
  }
}

/**
 * Update existing user information
 * 
 * @param userId - The unique identifier of the user
 * @param userData - Partial user data to update
 * @returns Promise with updated user information
 * @throws ApiError with user-friendly message (e.g., duplicate email)
 * 
 * Validates Requirements: 6.4, 6.5, 6.6
 */
export async function updateUser(
  userId: string,
  userData: UpdateUserRequest
): Promise<User> {
  try {
    const response = await apiClient.patch<User>(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    throw transformApiError(error);
  }
}

/**
 * Update user account status (activate or deactivate)
 * 
 * @param userId - The unique identifier of the user
 * @param statusData - New status for the user
 * @returns Promise with updated user information
 * @throws ApiError with user-friendly message
 * 
 * Validates Requirements: 7.4, 7.5, 7.6
 */
export async function updateStatus(
  userId: string,
  statusData: UpdateStatusRequest
): Promise<User> {
  try {
    const response = await apiClient.patch<User>(
      `/users/${userId}/status`,
      statusData
    );
    return response.data;
  } catch (error) {
    throw transformApiError(error);
  }
}
