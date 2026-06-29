/**
 * Tests for User Creation Page
 * 
 * These tests verify the user creation page functionality:
 * - Renders the UserForm component in create mode
 * - Handles form submission with createUser mutation
 * - Displays success notification on successful creation
 * - Displays error notification on failure
 * - Redirects to user list after successful creation
 * - Handles cancel action properly
 * 
 * Validates Requirements:
 * - 5.1: Provide "Create User" form
 * - 5.2: Require email, full name, and role fields
 * - 5.3: Create user account
 * - 5.4: Display error for duplicate email
 * - 5.5: Display field-specific validation errors
 * - 5.6: Display success message and redirect to user list
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CreateUserPage from '../page';
import { useRouter } from 'next/navigation';
import { useCreateUser } from '@/lib/hooks/useUserMutations';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(() => ({
    get: vi.fn(() => 'apex-logistics'),
  })),
}));

// Mock useCreateUser hook
vi.mock('@/lib/hooks/useUserMutations', () => ({
  useCreateUser: vi.fn(),
}));

// Mock UserForm component
vi.mock('@/components/users/UserForm', () => ({
  UserForm: vi.fn(({ mode, onSubmit, onCancel, isLoading }) => (
    <div data-testid="user-form">
      <span data-testid="form-mode">{mode}</span>
      <button onClick={() => onSubmit({ email: 'test@example.com', fullName: 'Test User', role: 'Member' })}>
        Submit
      </button>
      <button onClick={onCancel}>Cancel</button>
      {isLoading && <span data-testid="loading">Loading...</span>}
    </div>
  )),
}));

// Mock notification components
vi.mock('@/components/common/ErrorNotification', () => ({
  ErrorNotification: vi.fn(({ message, onDismiss }) => (
    <div data-testid="error-notification">
      <span>{message}</span>
      <button onClick={onDismiss}>Dismiss</button>
    </div>
  )),
}));

vi.mock('@/components/common/SuccessNotification', () => ({
  SuccessNotification: vi.fn(({ message, onDismiss }) => (
    <div data-testid="success-notification">
      <span>{message}</span>
      <button onClick={onDismiss}>Dismiss</button>
    </div>
  )),
}));

// Mock lucide-react
vi.mock('lucide-react', () => ({
  ArrowLeft: () => <span>ArrowLeft</span>,
}));

// Mock Button component
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

describe('CreateUserPage', () => {
  let queryClient: QueryClient;
  let mockRouter: any;
  let mockCreateUserMutate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Create a new QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Setup router mock
    mockRouter = {
      push: vi.fn(),
    };
    (useRouter as any).mockReturnValue(mockRouter);

    // Setup useCreateUser mock
    mockCreateUserMutate = vi.fn();
    (useCreateUser as any).mockReturnValue({
      mutate: mockCreateUserMutate,
      isPending: false,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <CreateUserPage />
      </QueryClientProvider>
    );
  };

  it('renders the page with correct title and description', () => {
    renderPage();

    expect(screen.getByText('Create New User')).toBeInTheDocument();
    expect(screen.getByText('Add a new user to the Phelbo platform')).toBeInTheDocument();
  });

  it('renders UserForm in create mode', () => {
    renderPage();

    const formMode = screen.getByTestId('form-mode');
    expect(formMode).toHaveTextContent('create');
  });

  it('renders back button that navigates to user list', async () => {
    renderPage();

    const backButton = screen.getByLabelText('Back to users list');
    await userEvent.click(backButton);

    expect(mockRouter.push).toHaveBeenCalledWith('/users');
  });

  it('renders help text about welcome email', () => {
    renderPage();

    expect(
      screen.getByText(/After creating a user, they will receive a welcome email/i)
    ).toBeInTheDocument();
  });

  it('handles form submission successfully', async () => {
    // Mock successful user creation
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      fullName: 'Test User',
      role: 'Member' as const,
      status: 'active' as const,
      registrationDate: new Date().toISOString(),
    };

    (useCreateUser as any).mockImplementation((callbacks: any) => ({
      mutate: (data: any) => {
        callbacks?.onSuccess(mockUser);
      },
      isPending: false,
    }));

    renderPage();

    const submitButton = screen.getByText('Submit');
    await userEvent.click(submitButton);

    // Should display success notification
    await waitFor(() => {
      expect(screen.getByTestId('success-notification')).toBeInTheDocument();
      expect(screen.getByText(/User "Test User" created successfully/i)).toBeInTheDocument();
    });

    // Should redirect to user list after delay
    await waitFor(
      () => {
        expect(mockRouter.push).toHaveBeenCalledWith('/users');
      },
      { timeout: 2000 }
    );
  });

  it('handles duplicate email error', async () => {
    // Mock error for duplicate email
    const duplicateError = new Error('User with this email already exists');

    (useCreateUser as any).mockImplementation((callbacks: any) => ({
      mutate: (data: any) => {
        callbacks?.onError(duplicateError);
      },
      isPending: false,
    }));

    renderPage();

    const submitButton = screen.getByText('Submit');
    await userEvent.click(submitButton);

    // Should display error notification
    await waitFor(() => {
      expect(screen.getByTestId('error-notification')).toBeInTheDocument();
      expect(
        screen.getByText(/A user with this email address already exists/i)
      ).toBeInTheDocument();
    });

    // Should NOT redirect
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('handles validation error', async () => {
    // Mock validation error
    const validationError = new Error('Validation failed');

    (useCreateUser as any).mockImplementation((callbacks: any) => ({
      mutate: (data: any) => {
        callbacks?.onError(validationError);
      },
      isPending: false,
    }));

    renderPage();

    const submitButton = screen.getByText('Submit');
    await userEvent.click(submitButton);

    // Should display error notification with validation message
    await waitFor(() => {
      expect(screen.getByTestId('error-notification')).toBeInTheDocument();
      expect(
        screen.getByText(/Please check the form fields and ensure all required information is valid/i)
      ).toBeInTheDocument();
    });
  });

  it('handles generic error', async () => {
    // Mock generic error
    const genericError = new Error('Network error');

    (useCreateUser as any).mockImplementation((callbacks: any) => ({
      mutate: (data: any) => {
        callbacks?.onError(genericError);
      },
      isPending: false,
    }));

    renderPage();

    const submitButton = screen.getByText('Submit');
    await userEvent.click(submitButton);

    // Should display error notification
    await waitFor(() => {
      expect(screen.getByTestId('error-notification')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('handles cancel action', async () => {
    renderPage();

    const cancelButton = screen.getByText('Cancel');
    await userEvent.click(cancelButton);

    expect(mockRouter.push).toHaveBeenCalledWith('/users');
  });

  it('shows loading state during submission', () => {
    // Mock loading state
    (useCreateUser as any).mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    });

    renderPage();

    // Should pass isLoading prop to UserForm
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('allows dismissing success notification', async () => {
    // Mock successful user creation
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      fullName: 'Test User',
      role: 'Member' as const,
      status: 'active' as const,
      registrationDate: new Date().toISOString(),
    };

    (useCreateUser as any).mockImplementation((callbacks: any) => ({
      mutate: (data: any) => {
        callbacks?.onSuccess(mockUser);
      },
      isPending: false,
    }));

    renderPage();

    const submitButton = screen.getByText('Submit');
    await userEvent.click(submitButton);

    // Wait for success notification
    await waitFor(() => {
      expect(screen.getByTestId('success-notification')).toBeInTheDocument();
    });

    // Dismiss notification
    const dismissButton = screen.getByText('Dismiss');
    await userEvent.click(dismissButton);

    // Notification should be removed
    await waitFor(() => {
      expect(screen.queryByTestId('success-notification')).not.toBeInTheDocument();
    });
  });

  it('allows dismissing error notification', async () => {
    // Mock error
    const error = new Error('Test error');

    (useCreateUser as any).mockImplementation((callbacks: any) => ({
      mutate: (data: any) => {
        callbacks?.onError(error);
      },
      isPending: false,
    }));

    renderPage();

    const submitButton = screen.getByText('Submit');
    await userEvent.click(submitButton);

    // Wait for error notification
    await waitFor(() => {
      expect(screen.getByTestId('error-notification')).toBeInTheDocument();
    });

    // Dismiss notification
    const dismissButton = screen.getByText('Dismiss');
    await userEvent.click(dismissButton);

    // Notification should be removed
    await waitFor(() => {
      expect(screen.queryByTestId('error-notification')).not.toBeInTheDocument();
    });
  });
});
