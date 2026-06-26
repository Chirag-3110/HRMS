import axios, { AxiosError } from 'axios';

/**
 * Authentication API Layer
 * 
 * Provides functions for superadmin authentication including login,
 * logout, and session verification.
 * 
 * Validates Requirements:
 * - 1.2: Credential verification and session creation
 * - 1.3: Authentication error handling
 */

// Types for authentication
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'superadmin';
  };
  accessToken: string;
  refreshToken: string;
}

export interface SessionData {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'superadmin';
  };
  expires: string;
}

export interface AuthError {
  message: string;
  code?: string;
  statusCode?: number;
}

// API base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || 'https://api.phelbo.com';
const API_TIMEOUT = parseInt(process.env.API_TIMEOUT || '30000', 10);

// Create axios instance for authentication requests
const authApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Transform API errors into user-friendly messages
 * 
 * @param error - Axios error object
 * @returns AuthError with user-friendly message
 */
function transformAuthError(error: unknown): AuthError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    
    // Network or timeout errors
    if (!axiosError.response) {
      if (axiosError.code === 'ECONNABORTED') {
        return {
          message: 'Authentication request timed out. Please try again.',
          code: 'TIMEOUT',
          statusCode: 0,
        };
      }
      return {
        message: 'Unable to connect to authentication service. Please check your connection.',
        code: 'NETWORK_ERROR',
        statusCode: 0,
      };
    }

    const statusCode = axiosError.response.status;
    const serverMessage = axiosError.response.data?.message || axiosError.response.data?.error;

    // Handle specific HTTP status codes
    switch (statusCode) {
      case 401:
        return {
          message: serverMessage || 'Invalid email or password. Please try again.',
          code: 'INVALID_CREDENTIALS',
          statusCode: 401,
        };
      case 403:
        return {
          message: 'You do not have permission to access this resource.',
          code: 'FORBIDDEN',
          statusCode: 403,
        };
      case 429:
        return {
          message: 'Too many login attempts. Please try again later.',
          code: 'RATE_LIMITED',
          statusCode: 429,
        };
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          message: 'Authentication service is temporarily unavailable. Please try again later.',
          code: 'SERVER_ERROR',
          statusCode,
        };
      default:
        return {
          message: serverMessage || 'An unexpected error occurred during authentication.',
          code: 'UNKNOWN_ERROR',
          statusCode,
        };
    }
  }

  // Non-axios errors
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
    };
  }

  return {
    message: 'An unexpected error occurred.',
    code: 'UNKNOWN_ERROR',
  };
}

/**
 * Authenticate a superadmin with email and password
 * 
 * Validates Requirements:
 * - 1.2: Verify credentials and create session
 * - 1.3: Handle invalid credentials with error messages
 * 
 * @param credentials - Email and password
 * @returns Promise with login response containing user data and tokens
 * @throws AuthError if authentication fails
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await authApiClient.post<LoginResponse>('/auth/superadmin/login', credentials);
    return response.data;
  } catch (error) {
    throw transformAuthError(error);
  }
}

/**
 * Logout the current superadmin and terminate their session
 * 
 * Validates Requirements:
 * - 1.6: Terminate session and clear authentication tokens
 * 
 * @param accessToken - Current user's access token
 * @returns Promise that resolves when logout is complete
 * @throws AuthError if logout fails
 */
export async function logout(accessToken: string): Promise<void> {
  try {
    await authApiClient.post(
      '/auth/superadmin/logout',
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  } catch (error) {
    // Log error but don't throw - allow client to clear local session even if server logout fails
    console.error('Logout error:', transformAuthError(error));
  }
}

/**
 * Verify the current session is valid
 * 
 * Validates Requirements:
 * - 1.4: Session expiration detection
 * - 1.5: Secure session management
 * 
 * @param accessToken - Current user's access token
 * @returns Promise with session data if valid
 * @throws AuthError if session is invalid or expired
 */
export async function verifySession(accessToken: string): Promise<SessionData> {
  try {
    const response = await authApiClient.get<SessionData>('/auth/verify', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    const authError = transformAuthError(error);
    
    // Transform 401 errors to session expiration
    if (authError.statusCode === 401) {
      throw {
        message: 'Your session has expired. Please log in again.',
        code: 'SESSION_EXPIRED',
        statusCode: 401,
      } as AuthError;
    }
    
    throw authError;
  }
}

/**
 * Refresh the access token using a refresh token
 * 
 * Validates Requirements:
 * - 1.5: Secure session management with token refresh
 * 
 * @param refreshToken - Current user's refresh token
 * @returns Promise with new access token
 * @throws AuthError if refresh fails
 */
export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
  try {
    const response = await authApiClient.post<{ accessToken: string }>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  } catch (error) {
    // Transform token refresh failures to session expiration
    transformAuthError(error);
    
    throw {
      message: 'Your session has expired. Please log in again.',
      code: 'SESSION_EXPIRED',
      statusCode: 401,
    } as AuthError;
  }
}
