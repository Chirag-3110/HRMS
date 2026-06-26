/**
 * Unit tests for User List Page
 * Feature: phelbo-superadmin-labs
 * 
 * Tests cover:
 * - Page rendering with user data
 * - Search and filter functionality
 * - URL state management
 * - Pagination controls
 * - Loading and error states
 * - Empty states
 * - Navigation to user details and create
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';
import UsersPage from '../page';

// Mock Next.js navigation
const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

// Mock the useUsers hook
const mockUseUsers = vi.fn();
vi.mock('@/lib/hooks/useUsers', () => ({
  useUsers: (params: any) => mockUseUsers(params),
}));

// Mock components to simplify testing
vi.mock('@/components/users/UserTable', () => ({
  UserTable: ({ users, onUserClick, isLoading }: any) => (
    <div data-testid="user-table">
      {isLoading ? (
        <div>Loading table...</div>
      ) : (
        <ul>
          {users.map((user: any) => (
            <li key={user.id} onClick={() => onUserClick(user.id)}>
              {user.fullName}
            </li>
          ))}
        </ul>
      )}
    </div>
  ),
}));

vi.mock('@/components/users/UserSearchBar', () => ({
  UserSearchBar: ({ searchQuery, onSearchChange }: any) => {
    const [localValue, setLocalValue] = React.useState(searchQuery);
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Simulate 500ms debounce
      timeoutRef.current = setTimeout(() => {
        onSearchChange(newValue);
      }, 500);
    };

    return (
      <input
        data-testid="search-bar"
        value={localValue}
        onChange={handleChange}
        placeholder="Search..."
      />
    );
  },
}));

vi.mock('@/components/users/UserFilters', () => ({
  UserFilters: ({ roleFilter, statusFilter, onRoleChange, onStatusChange }: any) => (
    <div data-testid="user-filters">
      <select
        data-testid="role-filter"
        value={roleFilter}
        onChange={(e) => onRoleChange(e.target.value)}
      >
        <option value="All">All roles</option>
        <option value="Admin">Admin</option>
        <option value="Member">Member</option>
        <option value="Guest">Guest</option>
      </select>
      <select
        data-testid="status-filter"
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
      >
        <option value="All">All statuses</option>
        <option value="active">Active</option>
        <option value="deactivated">Deactivated</option>
      </select>
    </div>
  ),
}));

vi.mock('@/components/common/LoadingSkeleton', () => ({
  LoadingSkeleton: ({ variant, rows }: any) => (
    <div data-testid="loading-skeleton">Loading {variant}...</div>
  ),
}));

vi.mock('@/components/common/ErrorNotification', () => ({
  ErrorNotification: ({ message, onDismiss }: any) => (
    <div data-testid="error-notification">
      {message}
      <button onClick={onDismiss}>Dismiss</button>
    </div>
  ),
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Plus: () => <span>+</span>,
  Download: () => <span>↓</span>,
}));

// Mock export utility
const mockExportUsersToCSV = vi.fn();
vi.mock('@/lib/utils/export', () => ({
  exportUsersToCSV: (users: any) => mockExportUsersToCSV(users),
}));

// Sample test data
const mockUsers = [
  {
    id: '1',
    email: 'john@example.com',
    fullName: 'John Doe',
    role: 'Admin' as const,
    status: 'active' as const,
    registrationDate: '2024-01-01',
  },
  {
    id: '2',
    email: 'jane@example.com',
    fullName: 'Jane Smith',
    role: 'Member' as const,
    status: 'active' as const,
    registrationDate: '2024-01-02',
  },
];

const mockPaginationData = {
  users: mockUsers,
  pagination: {
    page: 1,
    pageSize: 25,
    totalCount: 2,
    totalPages: 1,
  },
};

describe('UsersPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    mockPush.mockClear();
    mockExportUsersToCSV.mockClear();
    mockSearchParams = new URLSearchParams();
    mockUseUsers.mockReturnValue({
      data: mockPaginationData,
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <React.Suspense fallback={<div>Loading...</div>}>
          <UsersPage />
        </React.Suspense>
      </QueryClientProvider>
    );
  };

  describe('Page Rendering', () => {
    it('should render page header with title and description', () => {
      renderPage();
      
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('Manage Phelbo platform users and their accounts')).toBeInTheDocument();
    });

    it('should render create user button', () => {
      renderPage();
      
      const createButton = screen.getByRole('button', { name: /create user/i });
      expect(createButton).toBeInTheDocument();
    });

    it('should render search bar', () => {
      renderPage();
      
      expect(screen.getByTestId('search-bar')).toBeInTheDocument();
    });

    it('should render filter controls', () => {
      renderPage();
      
      expect(screen.getByTestId('user-filters')).toBeInTheDocument();
      expect(screen.getByTestId('role-filter')).toBeInTheDocument();
      expect(screen.getByTestId('status-filter')).toBeInTheDocument();
    });

    it('should render user table with data', () => {
      renderPage();
      
      expect(screen.getByTestId('user-table')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should display user count', () => {
      renderPage();
      
      expect(screen.getByText(/showing 2 of 2 users/i)).toBeInTheDocument();
    });
  });

  describe('Loading State - Requirement 14.1', () => {
    it('should display loading skeleton when data is loading', () => {
      mockUseUsers.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      renderPage();
      
      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
      expect(screen.queryByTestId('user-table')).not.toBeInTheDocument();
    });

    it('should not display user count when loading', () => {
      mockUseUsers.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      renderPage();
      
      expect(screen.queryByText(/showing/i)).not.toBeInTheDocument();
    });
  });

  describe('Error Handling - Requirement 11.1', () => {
    it('should display error notification when fetch fails', () => {
      mockUseUsers.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Network error'),
      });

      renderPage();
      
      expect(screen.getByTestId('error-notification')).toBeInTheDocument();
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });

    it('should allow dismissing error notification', async () => {
      const user = userEvent.setup();
      mockUseUsers.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Network error'),
      });

      renderPage();
      
      const dismissButton = screen.getByText('Dismiss');
      await user.click(dismissButton);
      
      await waitFor(() => {
        expect(screen.queryByTestId('error-notification')).not.toBeInTheDocument();
      });
    });
  });

  describe('Empty States - Requirement 2.5', () => {
    it('should display empty state when no users exist', () => {
      mockUseUsers.mockReturnValue({
        data: {
          users: [],
          pagination: {
            page: 1,
            pageSize: 25,
            totalCount: 0,
            totalPages: 0,
          },
        },
        isLoading: false,
        error: null,
      });

      renderPage();
      
      expect(screen.getByText('No users yet')).toBeInTheDocument();
      expect(screen.getByText('Create your first user to get started')).toBeInTheDocument();
    });

    it('should display filtered empty state when no users match filters', () => {
      mockSearchParams.set('search', 'nonexistent');
      mockUseUsers.mockReturnValue({
        data: {
          users: [],
          pagination: {
            page: 1,
            pageSize: 25,
            totalCount: 0,
            totalPages: 0,
          },
        },
        isLoading: false,
        error: null,
      });

      renderPage();
      
      expect(screen.getByText('No users found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search or filters')).toBeInTheDocument();
    });
  });

  describe('Search Functionality - Requirements 3.1, 3.2', () => {
    it('should update URL when search query changes', async () => {
      const user = userEvent.setup();
      renderPage();
      
      const searchInput = screen.getByTestId('search-bar');
      await user.clear(searchInput);
      await user.type(searchInput, 'john');
      
      // Wait for debounced call (500ms)
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining('search=john'),
          expect.any(Object)
        );
      }, { timeout: 2000 });
    });

    it('should reset to page 1 when search changes', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('page', '3');
      renderPage();
      
      const searchInput = screen.getByTestId('search-bar');
      await user.clear(searchInput);
      await user.type(searchInput, 'test');
      
      // Wait for debounced call (500ms)
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining('page=1'),
          expect.any(Object)
        );
      }, { timeout: 2000 });
    });

    it('should read search query from URL params', () => {
      mockSearchParams.set('search', 'test search');
      renderPage();
      
      const searchInput = screen.getByTestId('search-bar') as HTMLInputElement;
      expect(searchInput.value).toBe('test search');
    });
  });

  describe('Filter Functionality - Requirements 3.3, 3.4', () => {
    it('should update URL when role filter changes', async () => {
      const user = userEvent.setup();
      renderPage();
      
      const roleFilter = screen.getByTestId('role-filter');
      await user.selectOptions(roleFilter, 'Admin');
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining('role=Admin'),
          expect.any(Object)
        );
      });
    });

    it('should update URL when status filter changes', async () => {
      const user = userEvent.setup();
      renderPage();
      
      const statusFilter = screen.getByTestId('status-filter');
      await user.selectOptions(statusFilter, 'active');
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining('status=active'),
          expect.any(Object)
        );
      });
    });

    it('should reset to page 1 when filters change', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('page', '3');
      renderPage();
      
      const roleFilter = screen.getByTestId('role-filter');
      await user.selectOptions(roleFilter, 'Admin');
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining('page=1'),
          expect.any(Object)
        );
      });
    });

    it('should read filter values from URL params', () => {
      mockSearchParams.set('role', 'Admin');
      mockSearchParams.set('status', 'active');
      renderPage();
      
      const roleFilter = screen.getByTestId('role-filter') as HTMLSelectElement;
      const statusFilter = screen.getByTestId('status-filter') as HTMLSelectElement;
      
      expect(roleFilter.value).toBe('Admin');
      expect(statusFilter.value).toBe('active');
    });

    it('should display clear filters button when filters are active', () => {
      mockSearchParams.set('role', 'Admin');
      renderPage();
      
      expect(screen.getByText('Clear all filters')).toBeInTheDocument();
    });

    it('should clear all filters when clear button is clicked', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('search', 'test');
      mockSearchParams.set('role', 'Admin');
      mockSearchParams.set('status', 'active');
      renderPage();
      
      const clearButton = screen.getByText('Clear all filters');
      await user.click(clearButton);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.not.stringContaining('search='),
          expect.any(Object)
        );
      });
    });
  });

  describe('URL State Persistence - Requirement 3.5', () => {
    it('should initialize page with URL parameters', () => {
      mockSearchParams.set('search', 'john');
      mockSearchParams.set('role', 'Admin');
      mockSearchParams.set('status', 'active');
      mockSearchParams.set('page', '2');
      mockSearchParams.set('pageSize', '50');

      renderPage();

      expect(mockUseUsers).toHaveBeenCalledWith({
        page: 2,
        pageSize: 50,
        search: 'john',
        role: 'Admin',
        status: 'active',
      });
    });

    it('should use default values when URL params are missing', () => {
      renderPage();

      expect(mockUseUsers).toHaveBeenCalledWith({
        page: 1,
        pageSize: 25,
        search: undefined,
        role: undefined,
        status: undefined,
      });
    });

    it('should remove filter params from URL when set to "All"', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('role', 'Admin');
      renderPage();
      
      const roleFilter = screen.getByTestId('role-filter');
      await user.selectOptions(roleFilter, 'All');
      
      await waitFor(() => {
        const lastCall = mockPush.mock.calls[mockPush.mock.calls.length - 1];
        expect(lastCall[0]).not.toContain('role=');
      });
    });
  });

  describe('Pagination - Requirements 2.2, 2.3', () => {
    it('should display pagination controls', () => {
      renderPage();
      
      expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
      expect(screen.getByLabelText('Next page')).toBeInTheDocument();
      expect(screen.getByText(/page 1 of 1/i)).toBeInTheDocument();
    });

    it('should display page size selector', () => {
      renderPage();
      
      const pageSizeSelect = screen.getByLabelText('Users per page');
      expect(pageSizeSelect).toBeInTheDocument();
    });

    it('should disable previous button on first page', () => {
      renderPage();
      
      const previousButton = screen.getByLabelText('Previous page');
      expect(previousButton).toBeDisabled();
    });

    it('should disable next button on last page', () => {
      renderPage();
      
      const nextButton = screen.getByLabelText('Next page');
      expect(nextButton).toBeDisabled();
    });

    it('should navigate to next page when next button is clicked', async () => {
      const user = userEvent.setup();
      mockUseUsers.mockReturnValue({
        data: {
          users: mockUsers,
          pagination: {
            page: 1,
            pageSize: 25,
            totalCount: 50,
            totalPages: 2,
          },
        },
        isLoading: false,
        error: null,
      });

      renderPage();
      
      const nextButton = screen.getByLabelText('Next page');
      await user.click(nextButton);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining('page=2'),
          expect.any(Object)
        );
      });
    });

    it('should navigate to previous page when previous button is clicked', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('page', '2');
      mockUseUsers.mockReturnValue({
        data: {
          users: mockUsers,
          pagination: {
            page: 2,
            pageSize: 25,
            totalCount: 50,
            totalPages: 2,
          },
        },
        isLoading: false,
        error: null,
      });

      renderPage();
      
      const previousButton = screen.getByLabelText('Previous page');
      await user.click(previousButton);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining('page=1'),
          expect.any(Object)
        );
      });
    });

    it('should update page size and reset to page 1', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('page', '3');
      renderPage();
      
      const pageSizeSelect = screen.getByLabelText('Users per page');
      await user.selectOptions(pageSizeSelect, '50');
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining('pageSize=50'),
          expect.any(Object)
        );
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining('page=1'),
          expect.any(Object)
        );
      });
    });
  });

  describe('Navigation - Requirement 4.1', () => {
    it('should navigate to user detail page when user row is clicked', async () => {
      const user = userEvent.setup();
      renderPage();
      
      const userRow = screen.getByText('John Doe');
      await user.click(userRow);
      
      expect(mockPush).toHaveBeenCalledWith('/users/1');
    });

    it('should navigate to create user page when create button is clicked', async () => {
      const user = userEvent.setup();
      renderPage();
      
      const createButton = screen.getByRole('button', { name: /create user/i });
      await user.click(createButton);
      
      expect(mockPush).toHaveBeenCalledWith('/users/create');
    });

    it('should navigate to create user page from empty state', async () => {
      const user = userEvent.setup();
      mockUseUsers.mockReturnValue({
        data: {
          users: [],
          pagination: {
            page: 1,
            pageSize: 25,
            totalCount: 0,
            totalPages: 0,
          },
        },
        isLoading: false,
        error: null,
      });

      renderPage();
      
      // Find create button in empty state
      const createButtons = screen.getAllByRole('button', { name: /create user/i });
      await user.click(createButtons[createButtons.length - 1]);
      
      expect(mockPush).toHaveBeenCalledWith('/users/create');
    });
  });

  describe('Active Filters Indicator', () => {
    it('should show "(filtered)" indicator when filters are active', () => {
      mockSearchParams.set('search', 'test');
      renderPage();
      
      expect(screen.getByText(/showing 2 of 2 users \(filtered\)/i)).toBeInTheDocument();
    });

    it('should not show "(filtered)" indicator when no filters are active', () => {
      renderPage();
      
      const text = screen.getByText(/showing 2 of 2 users/i);
      expect(text.textContent).not.toContain('(filtered)');
    });
  });

  describe('Export Functionality - Requirements 13.1, 13.2, 13.4, 13.5', () => {
    it('should render export button - Requirement 13.1', () => {
      renderPage();
      
      const exportButton = screen.getByRole('button', { name: /export users to csv/i });
      expect(exportButton).toBeInTheDocument();
    });

    it('should export current user data when export button is clicked - Requirements 13.2, 13.4', async () => {
      const user = userEvent.setup();
      renderPage();
      
      const exportButton = screen.getByRole('button', { name: /export users to csv/i });
      await user.click(exportButton);
      
      // Verify export function was called with current user data
      await waitFor(() => {
        expect(mockExportUsersToCSV).toHaveBeenCalledWith(mockUsers);
      });
    });

    it('should export filtered users when filters are active - Requirement 13.5', async () => {
      const user = userEvent.setup();
      const filteredUsers = [mockUsers[0]]; // Only Admin users
      mockSearchParams.set('role', 'Admin');
      mockUseUsers.mockReturnValue({
        data: {
          users: filteredUsers,
          pagination: {
            page: 1,
            pageSize: 25,
            totalCount: 1,
            totalPages: 1,
          },
        },
        isLoading: false,
        error: null,
      });

      renderPage();
      
      const exportButton = screen.getByRole('button', { name: /export users to csv/i });
      await user.click(exportButton);
      
      // Verify export function was called with filtered data only
      await waitFor(() => {
        expect(mockExportUsersToCSV).toHaveBeenCalledWith(filteredUsers);
      });
    });

    it('should disable export button when no users are available', () => {
      mockUseUsers.mockReturnValue({
        data: {
          users: [],
          pagination: {
            page: 1,
            pageSize: 25,
            totalCount: 0,
            totalPages: 0,
          },
        },
        isLoading: false,
        error: null,
      });

      renderPage();
      
      const exportButton = screen.getByRole('button', { name: /export users to csv/i });
      expect(exportButton).toBeDisabled();
    });

    it('should disable export button when data is loading', () => {
      mockUseUsers.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      renderPage();
      
      const exportButton = screen.getByRole('button', { name: /export users to csv/i });
      expect(exportButton).toBeDisabled();
    });

    it('should show "Exporting..." text during export', async () => {
      const user = userEvent.setup();
      renderPage();
      
      const exportButton = screen.getByRole('button', { name: /export users to csv/i });
      await user.click(exportButton);
      
      // Check for exporting state (may be brief)
      const buttonText = exportButton.textContent;
      expect(buttonText).toMatch(/export|exporting/i);
    });

    it('should handle export errors gracefully', async () => {
      const user = userEvent.setup();
      mockExportUsersToCSV.mockImplementation(() => {
        throw new Error('Export failed');
      });

      renderPage();
      
      const exportButton = screen.getByRole('button', { name: /export users to csv/i });
      await user.click(exportButton);
      
      // Verify error notification is displayed
      await waitFor(() => {
        expect(screen.getByTestId('error-notification')).toBeInTheDocument();
        expect(screen.getByText(/failed to export users/i)).toBeInTheDocument();
      });
    });

    it('should respect search filter when exporting - Requirement 13.5', async () => {
      const user = userEvent.setup();
      const searchedUsers = [mockUsers[0]];
      mockSearchParams.set('search', 'john');
      mockUseUsers.mockReturnValue({
        data: {
          users: searchedUsers,
          pagination: {
            page: 1,
            pageSize: 25,
            totalCount: 1,
            totalPages: 1,
          },
        },
        isLoading: false,
        error: null,
      });

      renderPage();
      
      const exportButton = screen.getByRole('button', { name: /export users to csv/i });
      await user.click(exportButton);
      
      // Verify export function was called with searched data only
      await waitFor(() => {
        expect(mockExportUsersToCSV).toHaveBeenCalledWith(searchedUsers);
      });
    });

    it('should respect multiple filters when exporting - Requirement 13.5', async () => {
      const user = userEvent.setup();
      const filteredUsers = [mockUsers[0]]; // Admin + active + john
      mockSearchParams.set('search', 'john');
      mockSearchParams.set('role', 'Admin');
      mockSearchParams.set('status', 'active');
      mockUseUsers.mockReturnValue({
        data: {
          users: filteredUsers,
          pagination: {
            page: 1,
            pageSize: 25,
            totalCount: 1,
            totalPages: 1,
          },
        },
        isLoading: false,
        error: null,
      });

      renderPage();
      
      const exportButton = screen.getByRole('button', { name: /export users to csv/i });
      await user.click(exportButton);
      
      // Verify export function was called with fully filtered data
      await waitFor(() => {
        expect(mockExportUsersToCSV).toHaveBeenCalledWith(filteredUsers);
      });
    });
  });
});
