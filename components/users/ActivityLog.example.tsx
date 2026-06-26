/**
 * ActivityLog Component Example
 * 
 * This file demonstrates how to use the ActivityLog component in a real application.
 */

'use client';

import React from 'react';
import { ActivityLog } from './ActivityLog';
import type { Activity } from '@/lib/api/users';

// Mock activity data for demonstration
const mockActivities: Activity[] = [
  {
    id: '1',
    timestamp: '2024-01-20T15:45:00.000Z',
    actionType: 'login',
    description: 'User logged in from Chrome on MacOS',
  },
  {
    id: '2',
    timestamp: '2024-01-20T14:30:00.000Z',
    actionType: 'profile_update',
    description: 'Updated profile picture',
  },
  {
    id: '3',
    timestamp: '2024-01-20T13:15:00.000Z',
    actionType: 'role_change',
    description: 'Role changed from Member to Admin by superadmin@example.com',
  },
  {
    id: '4',
    timestamp: '2024-01-19T16:20:00.000Z',
    actionType: 'password_reset',
    description: 'Password reset requested via email',
  },
  {
    id: '5',
    timestamp: '2024-01-19T10:05:00.000Z',
    actionType: 'email_verified',
    description: 'Email address verified successfully',
  },
  {
    id: '6',
    timestamp: '2024-01-18T18:45:00.000Z',
    actionType: 'logout',
    description: 'User logged out',
  },
  {
    id: '7',
    timestamp: '2024-01-18T09:30:00.000Z',
    actionType: 'login',
    description: 'User logged in from Firefox on Windows',
  },
  {
    id: '8',
    timestamp: '2024-01-17T14:15:00.000Z',
    actionType: 'profile_update',
    description: 'Updated phone number',
  },
  {
    id: '9',
    timestamp: '2024-01-17T11:00:00.000Z',
    actionType: 'status_change',
    description: 'Account status changed to active by superadmin@example.com',
  },
  {
    id: '10',
    timestamp: '2024-01-16T16:45:00.000Z',
    actionType: 'login',
    description: 'User logged in from Safari on iOS',
  },
];

/**
 * Example 1: Basic usage with activities
 */
export function BasicActivityLogExample() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Activity Log - Basic Example</h1>
      <ActivityLog activities={mockActivities} />
    </div>
  );
}

/**
 * Example 2: With loading state
 */
export function LoadingActivityLogExample() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Activity Log - Loading State</h1>
      <ActivityLog activities={[]} loading={true} />
    </div>
  );
}

/**
 * Example 3: Empty state
 */
export function EmptyActivityLogExample() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Activity Log - Empty State</h1>
      <ActivityLog activities={[]} />
    </div>
  );
}

/**
 * Example 4: Real-world integration with data fetching
 */
export function RealWorldActivityLogExample() {
  const [activities, setActivities] = React.useState<Activity[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate API call
    const fetchActivities = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call:
        // const response = await getUserDetail(userId);
        // setActivities(response.activities);
        
        // For demo purposes, use mock data after a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setActivities(mockActivities);
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Activity Log - Real-world Example</h1>
      <ActivityLog activities={activities} loading={loading} />
    </div>
  );
}

/**
 * Example 5: Large dataset with pagination (100+ activities)
 */
export function LargeDatasetActivityLogExample() {
  // Generate 150 mock activities
  const largeDataset: Activity[] = Array.from({ length: 150 }, (_, index) => {
    const date = new Date();
    date.setHours(date.getHours() - index);
    
    const actionTypes = ['login', 'logout', 'profile_update', 'role_change', 'password_reset', 'email_verified', 'status_change'];
    const actionType = actionTypes[index % actionTypes.length];
    
    return {
      id: `activity-${index + 1}`,
      timestamp: date.toISOString(),
      actionType,
      description: `Activity ${index + 1} - ${actionType.replace('_', ' ')}`,
    };
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Activity Log - Large Dataset (150 activities)</h1>
      <ActivityLog activities={largeDataset} />
    </div>
  );
}

/**
 * Default export for easy import
 */
export default function ActivityLogExamples() {
  const [selectedExample, setSelectedExample] = React.useState<string>('basic');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-4">ActivityLog Component Examples</h1>
          <p className="text-gray-600 mb-4">
            Select an example below to see different use cases of the ActivityLog component.
          </p>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedExample('basic')}
              className={`px-4 py-2 rounded-md ${
                selectedExample === 'basic'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Basic Example
            </button>
            <button
              onClick={() => setSelectedExample('loading')}
              className={`px-4 py-2 rounded-md ${
                selectedExample === 'loading'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Loading State
            </button>
            <button
              onClick={() => setSelectedExample('empty')}
              className={`px-4 py-2 rounded-md ${
                selectedExample === 'empty'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Empty State
            </button>
            <button
              onClick={() => setSelectedExample('realworld')}
              className={`px-4 py-2 rounded-md ${
                selectedExample === 'realworld'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Real-world Integration
            </button>
            <button
              onClick={() => setSelectedExample('large')}
              className={`px-4 py-2 rounded-md ${
                selectedExample === 'large'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Large Dataset
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          {selectedExample === 'basic' && <BasicActivityLogExample />}
          {selectedExample === 'loading' && <LoadingActivityLogExample />}
          {selectedExample === 'empty' && <EmptyActivityLogExample />}
          {selectedExample === 'realworld' && <RealWorldActivityLogExample />}
          {selectedExample === 'large' && <LargeDatasetActivityLogExample />}
        </div>
      </div>
    </div>
  );
}
