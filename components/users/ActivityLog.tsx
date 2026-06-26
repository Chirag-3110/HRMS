/**
 * ActivityLog Component
 * 
 * Displays user activity history with pagination and filtering capabilities.
 * 
 * Features:
 * - Displays activity entries with timestamp, action type, and description
 * - Pagination (50 entries per page)
 * - Filters for activity type and date range
 * - Displays activities in reverse chronological order (newest first)
 * 
 * Validates Requirements:
 * - 9.1: Display user activity logs
 * - 9.2: Show activity entries with timestamp, action type, and description
 * - 9.3: Paginate activity logs with 50 entries per page
 * - 9.4: Provide filtering options for activity type and date range
 * - 9.5: Display activities in reverse chronological order (newest first)
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import type { Activity } from '@/lib/api/users';

export interface ActivityLogProps {
  /**
   * Array of activity entries for the user
   */
  activities: Activity[];
  
  /**
   * Optional loading state
   */
  loading?: boolean;
}

/**
 * Format timestamp to human-readable format
 */
function formatTimestamp(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  
  // Format: "Jan 15, 2024 at 3:45 PM"
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };
  
  const formattedDate = date.toLocaleDateString('en-US', dateOptions);
  const formattedTime = date.toLocaleTimeString('en-US', timeOptions);
  
  return `${formattedDate} at ${formattedTime}`;
}

/**
 * Format action type to human-readable format
 */
function formatActionType(actionType: string): string {
  return actionType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Extract unique action types from activities
 */
function getUniqueActionTypes(activities: Activity[]): string[] {
  const types = new Set(activities.map(activity => activity.actionType));
  return Array.from(types).sort();
}

/**
 * ActivityLog Component
 */
export function ActivityLog({ activities, loading = false }: ActivityLogProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedActionType, setSelectedActionType] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  const ITEMS_PER_PAGE = 50;
  
  // Get unique action types for filter dropdown
  const actionTypes = useMemo(() => getUniqueActionTypes(activities), [activities]);
  
  // Filter and sort activities
  const filteredActivities = useMemo(() => {
    let filtered = [...activities];
    
    // Filter by action type
    if (selectedActionType !== 'all') {
      filtered = filtered.filter(activity => activity.actionType === selectedActionType);
    }
    
    // Filter by date range
    if (startDate) {
      const startDateTime = new Date(startDate).getTime();
      filtered = filtered.filter(activity => {
        const activityTime = new Date(activity.timestamp).getTime();
        return activityTime >= startDateTime;
      });
    }
    
    if (endDate) {
      // Set end date to end of day (23:59:59)
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      filtered = filtered.filter(activity => {
        const activityTime = new Date(activity.timestamp).getTime();
        return activityTime <= endDateTime.getTime();
      });
    }
    
    // Sort in reverse chronological order (newest first)
    filtered.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    
    return filtered;
  }, [activities, selectedActionType, startDate, endDate]);
  
  // Pagination calculations
  const totalPages = Math.ceil(filteredActivities.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentActivities = filteredActivities.slice(startIndex, endIndex);
  
  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedActionType, startDate, endDate]);
  
  // Handle page navigation
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedActionType('all');
    setStartDate('');
    setEndDate('');
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 animate-pulse rounded" />
        <div className="h-64 bg-gray-200 animate-pulse rounded" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Activity Log</h2>
        <span className="text-sm text-gray-500">
          {filteredActivities.length} {filteredActivities.length === 1 ? 'activity' : 'activities'}
        </span>
      </div>
      
      {/* Filters */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">Filters</h3>
          {(selectedActionType !== 'all' || startDate || endDate) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-700"
            >
              Clear Filters
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Activity Type Filter */}
          <div className="space-y-2">
            <label htmlFor="activity-type" className="text-sm font-medium text-gray-700">
              Activity Type
            </label>
            <Select value={selectedActionType} onValueChange={setSelectedActionType}>
              <SelectTrigger id="activity-type">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {actionTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {formatActionType(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Start Date Filter */}
          <div className="space-y-2">
            <label htmlFor="start-date" className="text-sm font-medium text-gray-700">
              Start Date
            </label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate || undefined}
            />
          </div>
          
          {/* End Date Filter */}
          <div className="space-y-2">
            <label htmlFor="end-date" className="text-sm font-medium text-gray-700">
              End Date
            </label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || undefined}
            />
          </div>
        </div>
      </div>
      
      {/* Activity List */}
      {currentActivities.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">
            {filteredActivities.length === 0 && activities.length > 0
              ? 'No activities match the selected filters'
              : 'No activity history available'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentActivities.map((activity) => (
            <div
              key={activity.id}
              className="p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {formatActionType(activity.actionType)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {activity.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredActivities.length)} of{' '}
            {filteredActivities.length} activities
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {/* Show page numbers with ellipsis for large page counts */}
              {totalPages <= 7 ? (
                // Show all pages if 7 or fewer
                Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => goToPage(page)}
                    className="min-w-[2.5rem]"
                  >
                    {page}
                  </Button>
                ))
              ) : (
                // Show ellipsis for large page counts
                <>
                  {currentPage > 3 && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => goToPage(1)}>
                        1
                      </Button>
                      {currentPage > 4 && <span className="px-2 text-gray-500">...</span>}
                    </>
                  )}
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      return page === currentPage ||
                             page === currentPage - 1 ||
                             page === currentPage + 1 ||
                             page === 1 ||
                             page === totalPages;
                    })
                    .filter((page, index, array) => {
                      // Remove duplicates and pages already shown
                      if (currentPage <= 3 && page <= 3) return true;
                      if (currentPage >= totalPages - 2 && page >= totalPages - 2) return true;
                      return page >= currentPage - 1 && page <= currentPage + 1;
                    })
                    .map(page => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => goToPage(page)}
                        className="min-w-[2.5rem]"
                      >
                        {page}
                      </Button>
                    ))}
                  
                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && <span className="px-2 text-gray-500">...</span>}
                      <Button variant="outline" size="sm" onClick={() => goToPage(totalPages)}>
                        {totalPages}
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
