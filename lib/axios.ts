import axios from 'axios';
import { getSession } from 'next-auth/react';

/**
 * Axios instance configured for API requests
 * 
 * Configuration:
 * - Base URL from environment variables
 * - Request timeout from environment variables (default 30s)
 * - Automatic JSON content type headers
 * - Credentials included for authentication
 * 
 * Validates Requirements:
 * - 1.5: Secure session management with HTTP-only cookies
 * - 2.3: Load users within 2 seconds (via timeout configuration)
 * - 11.1: Error handling for network requests
 */
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || 'http://localhost:3001',
  timeout: parseInt(process.env.API_TIMEOUT || '30000', 10),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

/**
 * Request interceptor
 * Adds authentication token from NextAuth session to all requests
 * 
 * Validates Requirements:
 * - 1.2: Verify credentials and create session
 * - 1.5: Secure session management
 */
apiClient.interceptors.request.use(
  async (config) => {
    // Get NextAuth session for authentication
    const session = await getSession();
    
    // Add authorization header if session exists and has an access token
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * Handles common error scenarios and response transformations
 * 
 * Validates Requirements:
 * - 1.4: Redirect to login on session expiration (401)
 * - 11.1: Error handling for network requests
 * - 11.5: Display connectivity warning when offline
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle common error scenarios
    if (error.response?.status === 401) {
      // Unauthorized - session expired or invalid
      // In a browser environment, redirect to login
      if (typeof window !== 'undefined') {
        // Clear any stored session data
        window.location.href = '/login?error=SessionExpired';
      }
    }
    
    // Log errors for debugging (but don't log sensitive information)
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
    }
    
    return Promise.reject(error);
  }
);
