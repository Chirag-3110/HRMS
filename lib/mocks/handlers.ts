/**
 * Mock API Handlers using MSW (Mock Service Worker)
 * 
 * This file provides mock API responses for development and testing.
 * It simulates the backend API endpoints for user management.
 * 
 * To use:
 * 1. Start the MSW server in browser mode
 * 2. All API calls will be intercepted and return mock data
 */

import { http, HttpResponse, delay } from 'msw';
import type { User, PaginatedUsersResponse, UserDetailResponse, Activity } from '../api/users';

// Mock user data
const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'john.doe@example.com',
    fullName: 'John Doe',
    phoneNumber: '+1 (555) 123-4567',
    role: 'Admin',
    status: 'active',
    registrationDate: '2024-01-15T10:30:00Z',
    lastLoginDate: '2024-03-20T14:45:00Z',
  },
  {
    id: 'user-2',
    email: 'jane.smith@example.com',
    fullName: 'Jane Smith',
    phoneNumber: '+1 (555) 234-5678',
    role: 'Member',
    status: 'active',
    registrationDate: '2024-02-01T08:00:00Z',
    lastLoginDate: '2024-03-19T16:20:00Z',
  },
  {
    id: 'user-3',
    email: 'bob.johnson@example.com',
    fullName: 'Bob Johnson',
    role: 'Guest',
    status: 'deactivated',
    registrationDate: '2024-01-20T12:15:00Z',
    lastLoginDate: '2024-02-15T09:30:00Z',
  },
  {
    id: 'user-4',
    email: 'alice.williams@example.com',
    fullName: 'Alice Williams',
    phoneNumber: '+1 (555) 456-7890',
    role: 'Member',
    status: 'active',
    registrationDate: '2024-02-10T14:00:00Z',
    lastLoginDate: '2024-03-21T10:15:00Z',
  },
  {
    id: 'user-5',
    email: 'charlie.brown@example.com',
    fullName: 'Charlie Brown',
    role: 'Admin',
    status: 'active',
    registrationDate: '2024-01-05T09:00:00Z',
    lastLoginDate: '2024-03-20T18:30:00Z',
  },
  {
    id: 'user-6',
    email: 'diana.prince@example.com',
    fullName: 'Diana Prince',
    phoneNumber: '+1 (555) 567-8901',
    role: 'Member',
    status: 'active',
    registrationDate: '2024-02-15T11:45:00Z',
    lastLoginDate: '2024-03-18T13:20:00Z',
  },
  {
    id: 'user-7',
    email: 'edward.norton@example.com',
    fullName: 'Edward Norton',
    role: 'Guest',
    status: 'active',
    registrationDate: '2024-03-01T10:00:00Z',
    lastLoginDate: '2024-03-15T15:45:00Z',
  },
  {
    id: 'user-8',
    email: 'fiona.gallagher@example.com',
    fullName: 'Fiona Gallagher',
    phoneNumber: '+1 (555) 678-9012',
    role: 'Member',
    status: 'deactivated',
    registrationDate: '2024-01-25T13:30:00Z',
    lastLoginDate: '2024-02-20T11:00:00Z',
  },
];

// Mock activities generator
function generateMockActivities(userId: string): Activity[] {
  const activities: Activity[] = [];
  const actionTypes = [
    'login',
    'logout',
    'profile_update',
    'role_change',
    'password_reset',
    'email_verified',
    'status_change',
  ];
  
  const descriptions = {
    login: 'User logged in from Chrome on MacOS',
    logout: 'User logged out',
    profile_update: 'Updated profile information',
    role_change: 'Role changed by admin',
    password_reset: 'Password reset requested via email',
    email_verified: 'Email address verified successfully',
    status_change: 'Account status changed by admin',
  };

  // Generate 15 recent activities
  for (let i = 0; i < 15; i++) {
    const date = new Date();
    date.setHours(date.getHours() - i * 2);
    
    const actionType = actionTypes[i % actionTypes.length];
    
    activities.push({
      id: `activity-${userId}-${i + 1}`,
      timestamp: date.toISOString(),
      actionType,
      description: descriptions[actionType as keyof typeof descriptions],
    });
  }

  return activities;
}

// API Base URL from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export const handlers = [
  /**
   * GET /users - Fetch paginated list of users with filtering
   */
  http.get(`${API_BASE_URL}/users`, async ({ request }) => {
    await delay(300); // Simulate network latency

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '25', 10);
    const search = url.searchParams.get('search') || '';
    const role = url.searchParams.get('role') || '';
    const status = url.searchParams.get('status') || '';

    // Filter users based on query parameters
    let filteredUsers = [...mockUsers];

    // Search filter (case-insensitive)
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.fullName.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
    }

    // Role filter
    if (role) {
      filteredUsers = filteredUsers.filter((user) => user.role === role);
    }

    // Status filter
    if (status) {
      filteredUsers = filteredUsers.filter((user) => user.status === status);
    }

    // Pagination
    const totalCount = filteredUsers.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    const response: PaginatedUsersResponse = {
      users: paginatedUsers,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
      },
    };

    return HttpResponse.json(response);
  }),

  /**
   * GET /users/:id - Fetch user detail with activity log
   */
  http.get(`${API_BASE_URL}/users/:id`, async ({ params }) => {
    await delay(200); // Simulate network latency

    const { id } = params;
    const user = mockUsers.find((u) => u.id === id);

    if (!user) {
      return new HttpResponse(
        JSON.stringify({ message: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const response: UserDetailResponse = {
      ...user,
      activities: generateMockActivities(user.id),
    };

    return HttpResponse.json(response);
  }),

  /**
   * POST /users - Create new user
   */
  http.post(`${API_BASE_URL}/users`, async ({ request }) => {
    await delay(400); // Simulate network latency

    const body = await request.json();
    const newUser: User = {
      id: `user-${mockUsers.length + 1}`,
      email: (body as any).email,
      fullName: (body as any).fullName,
      phoneNumber: (body as any).phoneNumber,
      role: (body as any).role,
      status: 'active',
      registrationDate: new Date().toISOString(),
    };

    // Check for duplicate email
    const existingUser = mockUsers.find((u) => u.email === newUser.email);
    if (existingUser) {
      return new HttpResponse(
        JSON.stringify({ message: 'Email already exists' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    mockUsers.push(newUser);
    return HttpResponse.json(newUser, { status: 201 });
  }),

  /**
   * PATCH /users/:id - Update user
   */
  http.patch(`${API_BASE_URL}/users/:id`, async ({ params, request }) => {
    await delay(350); // Simulate network latency

    const { id } = params;
    const body = await request.json();
    const userIndex = mockUsers.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return new HttpResponse(
        JSON.stringify({ message: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check for duplicate email if email is being updated
    if ((body as any).email && (body as any).email !== mockUsers[userIndex].email) {
      const existingUser = mockUsers.find((u) => u.email === (body as any).email);
      if (existingUser) {
        return new HttpResponse(
          JSON.stringify({ message: 'Email already exists' }),
          { status: 409, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Update user
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...(body as any),
    };

    return HttpResponse.json(mockUsers[userIndex]);
  }),

  /**
   * PATCH /users/:id/status - Update user status
   */
  http.patch(`${API_BASE_URL}/users/:id/status`, async ({ params, request }) => {
    await delay(250); // Simulate network latency

    const { id } = params;
    const body = await request.json();
    const userIndex = mockUsers.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return new HttpResponse(
        JSON.stringify({ message: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update status
    mockUsers[userIndex].status = (body as any).status;

    return HttpResponse.json(mockUsers[userIndex]);
  }),
];
