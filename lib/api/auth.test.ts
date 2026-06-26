import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

// Mock axios module
vi.mock('axios', () => {
  const mockAxiosInstance = {
    post: vi.fn(),
    get: vi.fn(),
  };
  
  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
      isAxiosError: vi.fn(),
    },
    isAxiosError: vi.fn(),
  };
});

// Import after mocking
const { login, logout, verifySession, refreshAccessToken } = await import('./auth');
import type { LoginRequest, LoginResponse, SessionData } from './auth';

describe('Authentication API Layer', () => {
  const mockAccessToken = 'mock-access-token';
  const mockRefreshToken = 'mock-refresh-token';
  
  const mockUser = {
    id: 'user-123',
    email: 'admin@phelbo.com',
    name: 'Admin User',
    role: 'superadmin' as const,
  };

  const mockLoginResponse: LoginResponse = {
    user: mockUser,
    accessToken: mockAccessToken,
    refreshToken: mockRefreshToken,
  };

  const mockSessionData: SessionData = {
    user: mockUser,
    expires: '2024-12-31T23:59:59Z',
  };

  // Get the mock axios instance
  const mockAxiosInstance = axios.create();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    const validCredentials: LoginRequest = {
      email: 'admin@phelbo.com',
      password: 'securePassword123',
    };

    it('should successfully authenticate with valid credentials', async () => {
      vi.mocked(mockAxiosInstance.post).mockResolvedValueOnce({ data: mockLoginResponse });

      const result = await login(validCredentials);

      expect(result).toEqual(mockLoginResponse);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/auth/superadmin/login',
        validCredentials
      );
    });

    it('should handle invalid credentials with 401 error', async () => {
      const errorResponse = {
        response: {
          status: 401,
          data: { message: 'Invalid email or password' },
        },
        isAxiosError: true,
      };
      vi.mocked(mockAxiosInstance.post).mockRejectedValueOnce(errorResponse);
      vi.mocked(axios.isAxiosError).mockReturnValueOnce(true);

      await expect(login(validCredentials)).rejects.toMatchObject({
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS',
        statusCode: 401,
      });
    });

    it('should handle rate limiting with 429 error', async () => {
      const errorResponse = {
        response: {
          status: 429,
          data: {},
        },
        isAxiosError: true,
      };
      vi.mocked(mockAxiosInstance.post).mockRejectedValueOnce(errorResponse);
      vi.mocked(axios.isAxiosError).mockReturnValueOnce(true);

      await expect(login(validCredentials)).rejects.toMatchObject({
        message: 'Too many login attempts. Please try again later.',
        code: 'RATE_LIMITED',
        statusCode: 429,
      });
    });

    it('should handle server errors with 500 error', async () => {
      const errorResponse = {
        response: {
          status: 500,
          data: {},
        },
        isAxiosError: true,
      };
      vi.mocked(mockAxiosInstance.post).mockRejectedValueOnce(errorResponse);
      vi.mocked(axios.isAxiosError).mockReturnValueOnce(true);

      await expect(login(validCredentials)).rejects.toMatchObject({
        message: 'Authentication service is temporarily unavailable. Please try again later.',
        code: 'SERVER_ERROR',
        statusCode: 500,
      });
    });

    it('should handle network timeout errors', async () => {
      const errorResponse = {
        code: 'ECONNABORTED',
        response: undefined,
        isAxiosError: true,
      };
      vi.mocked(mockAxiosInstance.post).mockRejectedValueOnce(errorResponse);
      vi.mocked(axios.isAxiosError).mockReturnValueOnce(true);

      await expect(login(validCredentials)).rejects.toMatchObject({
        message: 'Authentication request timed out. Please try again.',
        code: 'TIMEOUT',
        statusCode: 0,
      });
    });

    it('should handle network connection errors', async () => {
      const errorResponse = {
        response: undefined,
        isAxiosError: true,
      };
      vi.mocked(mockAxiosInstance.post).mockRejectedValueOnce(errorResponse);
      vi.mocked(axios.isAxiosError).mockReturnValueOnce(true);

      await expect(login(validCredentials)).rejects.toMatchObject({
        message: 'Unable to connect to authentication service. Please check your connection.',
        code: 'NETWORK_ERROR',
        statusCode: 0,
      });
    });

    it('should handle forbidden access with 403 error', async () => {
      const errorResponse = {
        response: {
          status: 403,
          data: {},
        },
        isAxiosError: true,
      };
      vi.mocked(mockAxiosInstance.post).mockRejectedValueOnce(errorResponse);
      vi.mocked(axios.isAxiosError).mockReturnValueOnce(true);

      await expect(login(validCredentials)).rejects.toMatchObject({
        message: 'You do not have permission to access this resource.',
        code: 'FORBIDDEN',
        statusCode: 403,
      });
    });

    it('should handle unknown errors gracefully', async () => {
      const errorResponse = {
        response: {
          status: 418, // I'm a teapot - unexpected status
          data: {},
        },
        isAxiosError: true,
      };
      vi.mocked(mockAxiosInstance.post).mockRejectedValueOnce(errorResponse);
      vi.mocked(axios.isAxiosError).mockReturnValueOnce(true);

      await expect(login(validCredentials)).rejects.toMatchObject({
        message: 'An unexpected error occurred during authentication.',
        code: 'UNKNOWN_ERROR',
        statusCode: 418,
      });
    });
  });

  describe('logout', () => {
    it('should successfully logout with valid token', async () => {
      vi.mocked(mockAxiosInstance.post).mockResolvedValueOnce({ data: {} });

      await expect(logout(mockAccessToken)).resolves.toBeUndefined();
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/auth/superadmin/logout',
        {},
        {
          headers: {
            Authorization: `Bearer ${mockAccessToken}`,
          },
        }
      );
    });

    it('should not throw error if logout fails (graceful degradation)', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const errorResponse = {
        response: {
          status: 500,
          data: {},
        },
        isAxiosError: true,
      };
      vi.mocked(mockAxiosInstance.post).mockRejectedValueOnce(errorResponse);
      vi.mocked(axios.isAxiosError).mockReturnValueOnce(true);

      // Should resolve without throwing
      await expect(logout(mockAccessToken)).resolves.toBeUndefined();
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle network errors gracefully during logout', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const errorResponse = {
        response: undefined,
        isAxiosError: true,
      };
      vi.mocked(mockAxiosInstance.post).mockRejectedValueOnce(errorResponse);
      vi.mocked(axios.isAxiosError).mockReturnValueOnce(true);

      // Should resolve without throwing even on network error
      await expect(logout(mockAccessToken)).resolves.toBeUndefined();
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('verifySession', () => {
    it('should successfully verify a valid session', async () => {
      vi.mocked(mockAxiosInstance.get).mockResolvedValueOnce({ data: mockSessionData });

      const result = await verifySession(mockAccessToken);

      expect(result).toEqual(mockSessionData);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/auth/verify', {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      });
    });

    it('should transform 401 error to session expired message', async () => {
      const errorResponse = {
        response: {
          status: 401,
          data: {},
        },
        isAxiosError: true,
      };
      vi.mocked(mockAxiosInstance.get).mockRejectedValueOnce(errorResponse);
      vi.mocked(axios.isAxiosError).mockReturnValueOnce(true);

      await expect(verifySession(mockAccessToken)).rejects.toMatchObject({
        message: 'Your session has expired. Please log in again.',
        code: 'SESSION_EXPIRED',
        statusCode: 401,
      });
    });

    it('should handle network errors during session verification', async () => {
      const errorResponse = {
        response: undefined,
        isAxiosError: true,
      };
      vi.mocked(mockAxiosInstance.get).mockRejectedValueOnce(errorResponse);
      vi.mocked(axios.isAxiosError).mockReturnValueOnce(true);

      await expect(verifySession(mockAccessToken)).rejects.toMatchObject({
        message: 'Unable to connect to authentication service. Please check your connection.',
        code: 'NETWORK_ERROR',
        statusCode: 0,
      });
    });

    it('should handle server errors during session verification', async () => {
      const errorResponse = {
        response: {
          status: 503,
          data: {},
        },
        isAxiosError: true,
      };
      vi.mocked(mockAxiosInstance.get).mockRejectedValueOnce(errorResponse);
      vi.mocked(axios.isAxiosError).mockReturnValueOnce(true);

      await expect(verifySession(mockAccessToken)).rejects.toMatchObject({
        message: 'Authentication service is temporarily unavailable. Please try again later.',
        code: 'SERVER_ERROR',
        statusCode: 503,
      });
    });
  });

  describe('refreshAccessToken', () => {
    it('should successfully refresh access token', async () => {
      const newToken = 'new-access-token';
      vi.mocked(mockAxiosInstance.post).mockResolvedValueOnce({ data: { accessToken: newToken } });

      const result = await refreshAccessToken(mockRefreshToken);

      expect(result).toEqual({ accessToken: newToken });
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/refresh', {
        refreshToken: mockRefreshToken,
      });
    });

    it('should transform refresh failure to session expired', async () => {
      const errorResponse = {
        response: {
          status: 401,
          data: {},
        },
        isAxiosError: true,
      };
      vi.mocked(mockAxiosInstance.post).mockRejectedValueOnce(errorResponse);
      vi.mocked(axios.isAxiosError).mockReturnValueOnce(true);

      await expect(refreshAccessToken(mockRefreshToken)).rejects.toMatchObject({
        message: 'Your session has expired. Please log in again.',
        code: 'SESSION_EXPIRED',
        statusCode: 401,
      });
    });

    it('should handle expired refresh token', async () => {
      const errorResponse = {
        response: {
          status: 403,
          data: { message: 'Refresh token expired' },
        },
        isAxiosError: true,
      };
      vi.mocked(mockAxiosInstance.post).mockRejectedValueOnce(errorResponse);
      vi.mocked(axios.isAxiosError).mockReturnValueOnce(true);

      await expect(refreshAccessToken(mockRefreshToken)).rejects.toMatchObject({
        message: 'Your session has expired. Please log in again.',
        code: 'SESSION_EXPIRED',
        statusCode: 401,
      });
    });

    it('should handle network errors during token refresh', async () => {
      const errorResponse = {
        code: 'ECONNABORTED',
        response: undefined,
        isAxiosError: true,
      };
      vi.mocked(mockAxiosInstance.post).mockRejectedValueOnce(errorResponse);
      vi.mocked(axios.isAxiosError).mockReturnValueOnce(true);

      await expect(refreshAccessToken(mockRefreshToken)).rejects.toMatchObject({
        message: 'Your session has expired. Please log in again.',
        code: 'SESSION_EXPIRED',
        statusCode: 401,
      });
    });
  });

  describe('Error Edge Cases', () => {
    it('should handle non-axios errors', async () => {
      const genericError = new Error('Something went wrong');
      vi.mocked(mockAxiosInstance.post).mockRejectedValueOnce(genericError);
      vi.mocked(axios.isAxiosError).mockReturnValueOnce(false);

      await expect(login({ email: 'test@test.com', password: 'pass' })).rejects.toMatchObject({
        message: 'Something went wrong',
        code: 'UNKNOWN_ERROR',
      });
    });

    it('should handle completely unknown error objects', async () => {
      vi.mocked(mockAxiosInstance.post).mockRejectedValueOnce('string error');
      vi.mocked(axios.isAxiosError).mockReturnValueOnce(false);

      await expect(login({ email: 'test@test.com', password: 'pass' })).rejects.toMatchObject({
        message: 'An unexpected error occurred.',
        code: 'UNKNOWN_ERROR',
      });
    });

    it('should handle errors with custom server messages', async () => {
      const errorResponse = {
        response: {
          status: 401,
          data: { message: 'Custom error message from server' },
        },
        isAxiosError: true,
      };
      vi.mocked(mockAxiosInstance.post).mockRejectedValueOnce(errorResponse);
      vi.mocked(axios.isAxiosError).mockReturnValueOnce(true);

      await expect(login({ email: 'test@test.com', password: 'pass' })).rejects.toMatchObject({
        message: 'Custom error message from server',
        code: 'INVALID_CREDENTIALS',
        statusCode: 401,
      });
    });

    it('should handle errors with error field instead of message', async () => {
      const errorResponse = {
        response: {
          status: 401,
          data: { error: 'Error from error field' },
        },
        isAxiosError: true,
      };
      vi.mocked(mockAxiosInstance.post).mockRejectedValueOnce(errorResponse);
      vi.mocked(axios.isAxiosError).mockReturnValueOnce(true);

      await expect(login({ email: 'test@test.com', password: 'pass' })).rejects.toMatchObject({
        message: 'Error from error field',
        code: 'INVALID_CREDENTIALS',
        statusCode: 401,
      });
    });
  });
});
