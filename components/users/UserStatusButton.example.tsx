/**
 * UserStatusButton Usage Examples
 * 
 * This file demonstrates various ways to use the UserStatusButton component.
 */

import React, { useState } from 'react';
import { UserStatusButton } from './UserStatusButton';
import type { UserStatus } from '@/lib/schemas/user';

/**
 * Example 1: Basic Usage
 * Simplest implementation with just userId and currentStatus
 */
export function BasicExample() {
  const [status, setStatus] = useState<UserStatus>('active');
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Basic Usage</h3>
      <p className="text-sm text-gray-600">Current status: {status}</p>
      <UserStatusButton
        userId="user123"
        currentStatus={status}
        onStatusChange={(newStatus) => setStatus(newStatus)}
      />
    </div>
  );
}

/**
 * Example 2: With Callback
 * Demonstrates handling the status change callback
 */
export function CallbackExample() {
  const [status, setStatus] = useState<UserStatus>('active');
  const [lastChanged, setLastChanged] = useState<Date | null>(null);
  
  const handleStatusChange = (newStatus: UserStatus) => {
    setStatus(newStatus);
    setLastChanged(new Date());
    console.log('Status changed to:', newStatus);
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">With Callback</h3>
      <div className="text-sm text-gray-600">
        <p>Current status: <span className="font-medium">{status}</span></p>
        {lastChanged && (
          <p>Last changed: {lastChanged.toLocaleString()}</p>
        )}
      </div>
      <UserStatusButton
        userId="user456"
        currentStatus={status}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

/**
 * Example 3: Different Button Variants
 * Shows various button styling options
 */
export function VariantExample() {
  const [status] = useState<UserStatus>('active');
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Button Variants</h3>
      
      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-600 mb-2">Default variant (outline)</p>
          <UserStatusButton
            userId="user789"
            currentStatus={status}
            variant="outline"
          />
        </div>
        
        <div>
          <p className="text-sm text-gray-600 mb-2">Default variant</p>
          <UserStatusButton
            userId="user790"
            currentStatus={status}
            variant="default"
          />
        </div>
        
        <div>
          <p className="text-sm text-gray-600 mb-2">Ghost variant</p>
          <UserStatusButton
            userId="user791"
            currentStatus={status}
            variant="ghost"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Example 4: Different Button Sizes
 * Shows various button sizing options
 */
export function SizeExample() {
  const [status] = useState<UserStatus>('deactivated');
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Button Sizes</h3>
      
      <div className="flex items-center gap-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">Small</p>
          <UserStatusButton
            userId="user792"
            currentStatus={status}
            size="sm"
          />
        </div>
        
        <div>
          <p className="text-sm text-gray-600 mb-2">Default</p>
          <UserStatusButton
            userId="user793"
            currentStatus={status}
            size="default"
          />
        </div>
        
        <div>
          <p className="text-sm text-gray-600 mb-2">Large</p>
          <UserStatusButton
            userId="user794"
            currentStatus={status}
            size="lg"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Example 5: In a User Detail View
 * Shows realistic usage within a user detail context
 */
export function UserDetailExample() {
  const [user, setUser] = useState({
    id: 'user999',
    name: 'John Doe',
    email: 'john.doe@example.com',
    status: 'active' as UserStatus,
  });
  
  const handleStatusChange = (newStatus: UserStatus) => {
    setUser((prev) => ({ ...prev, status: newStatus }));
  };
  
  return (
    <div className="space-y-4 p-6 border rounded-lg">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold">{user.name}</h3>
          <p className="text-gray-600">{user.email}</p>
          <p className="text-sm text-gray-500 mt-1">
            Status:{' '}
            <span
              className={
                user.status === 'active'
                  ? 'text-green-600 font-medium'
                  : 'text-red-600 font-medium'
              }
            >
              {user.status === 'active' ? 'Active' : 'Deactivated'}
            </span>
          </p>
        </div>
        
        <UserStatusButton
          userId={user.id}
          currentStatus={user.status}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
}

/**
 * Example 6: Multiple Buttons in a List
 * Shows usage within a user list or table
 */
export function ListExample() {
  const [users, setUsers] = useState([
    { id: '1', name: 'Alice Smith', status: 'active' as UserStatus },
    { id: '2', name: 'Bob Johnson', status: 'deactivated' as UserStatus },
    { id: '3', name: 'Carol Williams', status: 'active' as UserStatus },
  ]);
  
  const handleStatusChange = (userId: string, newStatus: UserStatus) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, status: newStatus } : user
      )
    );
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">User List with Status Buttons</h3>
      
      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-gray-500">ID: {user.id}</p>
            </div>
            
            <UserStatusButton
              userId={user.id}
              currentStatus={user.status}
              onStatusChange={(newStatus) =>
                handleStatusChange(user.id, newStatus)
              }
              size="sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Complete Examples Component
 * Renders all examples together
 */
export function UserStatusButtonExamples() {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold mb-2">UserStatusButton Examples</h1>
        <p className="text-gray-600">
          Various examples demonstrating the UserStatusButton component usage
        </p>
      </div>
      
      <BasicExample />
      <CallbackExample />
      <VariantExample />
      <SizeExample />
      <UserDetailExample />
      <ListExample />
    </div>
  );
}
