/**
 * Unit tests for User API interfaces
 * 
 * These tests verify that the TypeScript interfaces are correctly defined
 * and can be used to create valid user objects.
 */

import { describe, it, expect } from 'vitest';
import type { 
  User, 
  PaginatedUsersResponse, 
  UserDetailResponse, 
  Activity,
  Pagination
} from './users';

describe('User API Interfaces', () => {
  describe('User interface', () => {
    it('should accept a valid user object with all required fields', () => {
      const user: User = {
        id: 'user-123',
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'Admin',
        status: 'active',
        registrationDate: '2024-01-01T00:00:00Z',
      };

      expect(user).toBeDefined();
      expect(user.id).toBe('user-123');
      expect(user.email).toBe('test@example.com');
      expect(user.fullName).toBe('Test User');
      expect(user.role).toBe('Admin');
      expect(user.status).toBe('active');
    });

    it('should accept a user with optional fields', () => {
      const user: User = {
        id: 'user-456',
        email: 'test2@example.com',
        fullName: 'Test User 2',
        phoneNumber: '+1234567890',
        role: 'Member',
        status: 'deactivated',
        registrationDate: '2024-01-01T00:00:00Z',
        lastLoginDate: '2024-01-15T10:30:00Z',
      };

      expect(user).toBeDefined();
      expect(user.phoneNumber).toBe('+1234567890');
      expect(user.lastLoginDate).toBe('2024-01-15T10:30:00Z');
    });

    it('should accept all valid role values', () => {
      const roles: Array<User['role']> = ['Admin', 'Member', 'Guest'];
      
      roles.forEach(role => {
        const user: User = {
          id: 'user-123',
          email: 'test@example.com',
          fullName: 'Test User',
          role,
          status: 'active',
          registrationDate: '2024-01-01T00:00:00Z',
        };
        
        expect(user.role).toBe(role);
      });
    });

    it('should accept all valid status values', () => {
      const statuses: Array<User['status']> = ['active', 'deactivated'];
      
      statuses.forEach(status => {
        const user: User = {
          id: 'user-123',
          email: 'test@example.com',
          fullName: 'Test User',
          role: 'Member',
          status,
          registrationDate: '2024-01-01T00:00:00Z',
        };
        
        expect(user.status).toBe(status);
      });
    });
  });

  describe('Pagination interface', () => {
    it('should accept valid pagination metadata', () => {
      const pagination: Pagination = {
        page: 1,
        pageSize: 25,
        totalCount: 100,
        totalPages: 4,
      };

      expect(pagination).toBeDefined();
      expect(pagination.page).toBe(1);
      expect(pagination.pageSize).toBe(25);
      expect(pagination.totalCount).toBe(100);
      expect(pagination.totalPages).toBe(4);
    });
  });

  describe('PaginatedUsersResponse interface', () => {
    it('should accept a valid paginated response', () => {
      const response: PaginatedUsersResponse = {
        users: [
          {
            id: 'user-1',
            email: 'user1@example.com',
            fullName: 'User One',
            role: 'Admin',
            status: 'active',
            registrationDate: '2024-01-01T00:00:00Z',
          },
          {
            id: 'user-2',
            email: 'user2@example.com',
            fullName: 'User Two',
            role: 'Member',
            status: 'active',
            registrationDate: '2024-01-02T00:00:00Z',
          },
        ],
        pagination: {
          page: 1,
          pageSize: 10,
          totalCount: 2,
          totalPages: 1,
        },
      };

      expect(response).toBeDefined();
      expect(response.users).toHaveLength(2);
      expect(response.pagination.totalCount).toBe(2);
    });

    it('should accept an empty users array', () => {
      const response: PaginatedUsersResponse = {
        users: [],
        pagination: {
          page: 1,
          pageSize: 10,
          totalCount: 0,
          totalPages: 0,
        },
      };

      expect(response).toBeDefined();
      expect(response.users).toHaveLength(0);
      expect(response.pagination.totalCount).toBe(0);
    });
  });

  describe('Activity interface', () => {
    it('should accept a valid activity object', () => {
      const activity: Activity = {
        id: 'activity-123',
        timestamp: '2024-01-15T10:30:00Z',
        actionType: 'login',
        description: 'User logged in successfully',
      };

      expect(activity).toBeDefined();
      expect(activity.id).toBe('activity-123');
      expect(activity.timestamp).toBe('2024-01-15T10:30:00Z');
      expect(activity.actionType).toBe('login');
      expect(activity.description).toBe('User logged in successfully');
    });

    it('should accept various action types', () => {
      const actionTypes = [
        'login',
        'logout',
        'profile_update',
        'role_change',
        'status_change',
      ];

      actionTypes.forEach(actionType => {
        const activity: Activity = {
          id: 'activity-123',
          timestamp: '2024-01-15T10:30:00Z',
          actionType,
          description: `Action: ${actionType}`,
        };

        expect(activity.actionType).toBe(actionType);
      });
    });
  });

  describe('UserDetailResponse interface', () => {
    it('should extend User and include activities', () => {
      const userDetail: UserDetailResponse = {
        id: 'user-123',
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'Admin',
        status: 'active',
        registrationDate: '2024-01-01T00:00:00Z',
        activities: [
          {
            id: 'activity-1',
            timestamp: '2024-01-15T10:30:00Z',
            actionType: 'login',
            description: 'User logged in',
          },
          {
            id: 'activity-2',
            timestamp: '2024-01-15T09:00:00Z',
            actionType: 'profile_update',
            description: 'User updated profile',
          },
        ],
      };

      expect(userDetail).toBeDefined();
      expect(userDetail.id).toBe('user-123');
      expect(userDetail.email).toBe('test@example.com');
      expect(userDetail.activities).toHaveLength(2);
      expect(userDetail.activities[0].actionType).toBe('login');
    });

    it('should accept user detail with empty activities array', () => {
      const userDetail: UserDetailResponse = {
        id: 'user-456',
        email: 'newuser@example.com',
        fullName: 'New User',
        role: 'Guest',
        status: 'active',
        registrationDate: '2024-01-20T00:00:00Z',
        activities: [],
      };

      expect(userDetail).toBeDefined();
      expect(userDetail.activities).toHaveLength(0);
    });

    it('should include all User fields plus activities', () => {
      const userDetail: UserDetailResponse = {
        id: 'user-789',
        email: 'complete@example.com',
        fullName: 'Complete User',
        phoneNumber: '+1234567890',
        role: 'Admin',
        status: 'active',
        registrationDate: '2024-01-01T00:00:00Z',
        lastLoginDate: '2024-01-15T10:30:00Z',
        activities: [
          {
            id: 'activity-1',
            timestamp: '2024-01-15T10:30:00Z',
            actionType: 'login',
            description: 'User logged in',
          },
        ],
      };

      expect(userDetail).toBeDefined();
      expect(userDetail.phoneNumber).toBe('+1234567890');
      expect(userDetail.lastLoginDate).toBe('2024-01-15T10:30:00Z');
      expect(userDetail.activities).toHaveLength(1);
    });
  });
});
