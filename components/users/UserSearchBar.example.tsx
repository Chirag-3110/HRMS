/**
 * UserSearchBar Component Usage Example
 * 
 * This example demonstrates how to integrate the UserSearchBar component
 * with URL query parameter persistence.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserSearchBar } from './UserSearchBar';

/**
 * Example: Basic usage with state management
 */
export function BasicSearchExample() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Basic Search</h2>
      <UserSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <p className="mt-4 text-sm text-gray-600">
        Current search: {searchQuery || '(empty)'}
      </p>
    </div>
  );
}

/**
 * Example: Search with URL persistence
 * This is the recommended approach for the user list page
 */
export function URLPersistedSearchExample() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  // Sync with URL on mount
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    setSearchQuery(urlSearch);
  }, [searchParams]);

  // Update URL when search changes (debounced by component)
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    
    // Update URL query parameters
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set('search', query);
    } else {
      params.delete('search');
    }
    
    // Reset to first page when searching
    params.set('page', '1');
    
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Search with URL Persistence</h2>
      <UserSearchBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />
      <p className="mt-4 text-sm text-gray-600">
        URL search param: {searchParams.get('search') || '(none)'}
      </p>
    </div>
  );
}

/**
 * Example: Search with custom placeholder
 */
export function CustomPlaceholderExample() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Custom Placeholder</h2>
      <UserSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Find users by name, email, or ID..."
      />
    </div>
  );
}

/**
 * Example: Search with loading indicator
 * Demonstrates integration with data fetching
 */
export function SearchWithLoadingExample() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const handleSearchChange = async (query: string) => {
    setSearchQuery(query);
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mock results
      const mockResults = query
        ? [`Result 1 for "${query}"`, `Result 2 for "${query}"`, `Result 3 for "${query}"`]
        : [];
      
      setResults(mockResults);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Search with Loading State</h2>
      <UserSearchBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />
      <div className="mt-4">
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : (
          <div>
            <p className="text-sm font-medium mb-2">Results ({results.length}):</p>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {results.map((result, index) => (
                <li key={index}>{result}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Example: Full user list page integration
 * This demonstrates the complete integration including filters
 */
export function FullUserListExample() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get('page') || '1', 10)
  );

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set('search', query);
    } else {
      params.delete('search');
    }
    
    // Reset to first page when search changes
    params.set('page', '1');
    setCurrentPage(1);
    
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">User Management</h1>
        
        {/* Search and Filter Bar */}
        <div className="flex gap-4 items-center">
          <UserSearchBar
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
          />
          
          {/* Placeholder for filters (Task 6.4 - UserFilters component) */}
          <div className="text-sm text-gray-500">
            [Filter dropdowns will go here - Task 6.4]
          </div>
        </div>
      </div>

      {/* User list would go here */}
      <div className="border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          Showing users matching: <strong>{searchQuery || '(all users)'}</strong>
        </p>
        <p className="text-sm text-gray-600 mt-1">
          Page: {currentPage}
        </p>
      </div>
    </div>
  );
}
