'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

/**
 * Props for the UserSearchBar component
 */
export interface UserSearchBarProps {
  /** Current search query value */
  searchQuery?: string;
  /** Callback when search query changes (debounced by 500ms) */
  onSearchChange: (query: string) => void;
  /** Placeholder text for search input */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * UserSearchBar Component
 * 
 * Provides a search input field for filtering users by name or email.
 * Implements debounced input handling and clear functionality.
 * 
 * Features:
 * - Search input with debounced handling (500ms)
 * - Clear search functionality with X button (appears when text is present)
 * - Supports URL query parameter persistence via parent component
 * - Responsive design with proper spacing
 * - Keyboard accessible with ARIA labels
 * 
 * Validates Requirements:
 * - 3.1: Provide search input field that filters users by name or email
 * - 3.2: Update user list within 500ms of search input (debounced)
 * - 3.5: Persist search state in URL query parameters (via parent)
 * 
 * Note: Filter controls (role and status dropdowns) are handled by the
 * separate UserFilters component (see task 6.4).
 * 
 * @example
 * ```tsx
 * <UserSearchBar
 *   searchQuery={searchQuery}
 *   onSearchChange={setSearchQuery}
 *   placeholder="Search users..."
 * />
 * ```
 */
export function UserSearchBar({
  searchQuery = '',
  onSearchChange,
  placeholder = 'Search by name or email...',
  className = '',
}: UserSearchBarProps) {
  // Local state for immediate input updates (before debouncing)
  const [localSearchQuery, setLocalSearchQuery] = React.useState(searchQuery);
  
  // Ref to store the debounce timer
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  /**
   * Sync local state with prop changes (e.g., from URL params)
   */
  React.useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  /**
   * Handle search input change with debouncing
   * Requirement 3.2: Update within 500ms
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalSearchQuery(newValue);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for 500ms debounce
    debounceTimerRef.current = setTimeout(() => {
      onSearchChange(newValue);
    }, 500);
  };

  /**
   * Handle clear search button click
   */
  const handleClearSearch = () => {
    setLocalSearchQuery('');
    onSearchChange('');
    
    // Clear any pending debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  };

  /**
   * Cleanup debounce timer on unmount
   */
  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative flex-1 max-w-md ${className}`}>
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
        <Input
          type="text"
          placeholder={placeholder}
          value={localSearchQuery}
          onChange={handleSearchChange}
          className="pl-9 pr-9"
          aria-label="Search users by name or email"
        />
        {localSearchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSearch}
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
