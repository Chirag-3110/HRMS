/**
 * UserTable Component Usage Examples
 * 
 * This file demonstrates how to use the UserTable component in different scenarios.
 * These examples are for reference only and should not be imported into the application.
 */

import { UserTable, User } from './UserTable';

// Example 1: Basic usage with sample data
export function BasicUserTableExample() {
  const users: User[] = [
    {
      id: '1',
      email: 'john.doe@example.com',
      fullName: 'John Doe',
      phoneNumber: '+1234567890',
      role: 'Admin',
      status: 'active',
      registrationDate: '2024-01-15T10:30:00Z',
      lastLoginDate: '2024-03-20T14:20:00Z',
    },
    {
      id: '2',
      email: 'jane.smith@example.com',
      fullName: 'Jane Smith',
      role: 'Member',
      status: 'active',
      registrationDate: '2024-02-10T09:15:00Z',
      lastLoginDate: '2024-03-19T11:45:00Z',
    },
    {
      id: '3',
      email: 'bob.wilson@example.com',
      fullName: 'Bob Wilson',
      role: 'Guest',
      status: 'deactivated',
      registrationDate: '2024-03-01T16:00:00Z',
    },
  ];

  return (
    <UserTable
      users={users}
      onUserClick={(id) => console.log('View user:', id)}
      onView={(id) => console.log('View action:', id)}
      onEdit={(id) => console.log('Edit action:', id)}
      onDelete={(id) => console.log('Delete action:', id)}
    />
  );
}

// Example 2: Loading state
export function LoadingUserTableExample() {
  return <UserTable users={[]} isLoading={true} />;
}

// Example 3: Empty state (no users)
export function EmptyUserTableExample() {
  return <UserTable users={[]} isLoading={false} />;
}

// Example 4: With navigation (Next.js router)
export function UserTableWithNavigation() {
  // In a real Next.js component, you would use:
  // import { useRouter } from 'next/navigation';
  // const router = useRouter();

  const users: User[] = [
    {
      id: '1',
      email: 'user@example.com',
      fullName: 'Example User',
      role: 'Member',
      status: 'active',
      registrationDate: '2024-01-01T00:00:00Z',
    },
  ];

  return (
    <UserTable
      users={users}
      // Row click navigates to detail page
      onUserClick={(id) => {
        // router.push(`/users/${id}`);
        console.log('Navigate to:', `/users/${id}`);
      }}
      // Edit button opens edit page
      onEdit={(id) => {
        // router.push(`/users/${id}/edit`);
        console.log('Navigate to:', `/users/${id}/edit`);
      }}
      // Delete button triggers delete confirmation
      onDelete={(id) => {
        // openDeleteModal(id);
        console.log('Open delete modal for:', id);
      }}
    />
  );
}

// Example 5: Integration with TanStack Query (React Query)
export function UserTableWithQuery() {
  // In a real component, you would use:
  // import { useQuery } from '@tanstack/react-query';
  // import { fetchUsers } from '@/lib/api/users';
  //
  // const { data, isLoading } = useQuery({
  //   queryKey: ['users'],
  //   queryFn: fetchUsers,
  // });

  const mockData = {
    users: [
      {
        id: '1',
        email: 'user@example.com',
        fullName: 'Example User',
        role: 'Member' as const,
        status: 'active' as const,
        registrationDate: '2024-01-01T00:00:00Z',
      },
    ],
  };
  const isLoading = false;

  return (
    <UserTable
      users={mockData.users}
      isLoading={isLoading}
      onView={(id) => console.log('View:', id)}
      onEdit={(id) => console.log('Edit:', id)}
      onDelete={(id) => console.log('Delete:', id)}
    />
  );
}

// Example 6: With custom action handlers
export function UserTableWithCustomActions() {
  const users: User[] = [
    {
      id: '1',
      email: 'user@example.com',
      fullName: 'Example User',
      role: 'Admin',
      status: 'active',
      registrationDate: '2024-01-01T00:00:00Z',
    },
  ];

  const handleView = (userId: string) => {
    // Open view modal or navigate to detail page
    console.log('Viewing user:', userId);
  };

  const handleEdit = (userId: string) => {
    // Open edit modal or navigate to edit page
    console.log('Editing user:', userId);
  };

  const handleDelete = async (userId: string) => {
    // Show confirmation dialog
    const confirmed = window.confirm('Are you sure you want to delete this user?');
    if (confirmed) {
      try {
        // await deleteUser(userId);
        console.log('User deleted:', userId);
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  return (
    <UserTable
      users={users}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}

// Example 7: Minimal usage (only view action)
export function MinimalUserTableExample() {
  const users: User[] = [
    {
      id: '1',
      email: 'user@example.com',
      fullName: 'Example User',
      role: 'Member',
      status: 'active',
      registrationDate: '2024-01-01T00:00:00Z',
    },
  ];

  return (
    <UserTable
      users={users}
      onView={(id) => console.log('View user:', id)}
      // No edit or delete actions
    />
  );
}
