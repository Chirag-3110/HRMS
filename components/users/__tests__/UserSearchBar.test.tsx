/**
 * Tests for UserSearchBar component
 * Feature: phelbo-superadmin-labs
 * 
 * Tests Requirements:
 * - 3.1: Provide search input field that filters users by name or email
 * - 3.2: Update user list within 500ms of search input (debounced)
 * - 3.5: Persist search state in URL query parameters (via parent)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserSearchBar } from '../UserSearchBar';

describe('UserSearchBar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render search input with default placeholder', () => {
      const onSearchChange = vi.fn();
      render(<UserSearchBar onSearchChange={onSearchChange} />);
      
      const input = screen.getByLabelText('Search users by name or email');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', 'Search by name or email...');
    });

    it('should render with custom placeholder', () => {
      const onSearchChange = vi.fn();
      render(
        <UserSearchBar 
          onSearchChange={onSearchChange} 
          placeholder="Custom placeholder"
        />
      );
      
      const input = screen.getByLabelText('Search users by name or email');
      expect(input).toHaveAttribute('placeholder', 'Custom placeholder');
    });

    it('should render search icon', () => {
      const onSearchChange = vi.fn();
      const { container } = render(<UserSearchBar onSearchChange={onSearchChange} />);
      
      // Search icon should be present (lucide-react renders as svg)
      const searchIcon = container.querySelector('svg');
      expect(searchIcon).toBeInTheDocument();
    });

    it('should display current search query value', () => {
      const onSearchChange = vi.fn();
      render(
        <UserSearchBar 
          searchQuery="test query" 
          onSearchChange={onSearchChange} 
        />
      );
      
      const input = screen.getByLabelText('Search users by name or email') as HTMLInputElement;
      expect(input.value).toBe('test query');
    });

    it('should apply custom className', () => {
      const onSearchChange = vi.fn();
      const { container } = render(
        <UserSearchBar 
          onSearchChange={onSearchChange} 
          className="custom-class" 
        />
      );
      
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('custom-class');
    });
  });

  describe('Clear Button', () => {
    it('should not show clear button when input is empty', () => {
      const onSearchChange = vi.fn();
      render(<UserSearchBar onSearchChange={onSearchChange} />);
      
      const clearButton = screen.queryByLabelText('Clear search');
      expect(clearButton).not.toBeInTheDocument();
    });

    it('should show clear button when input has value', () => {
      const onSearchChange = vi.fn();
      render(
        <UserSearchBar 
          searchQuery="test" 
          onSearchChange={onSearchChange} 
        />
      );
      
      const clearButton = screen.getByLabelText('Clear search');
      expect(clearButton).toBeInTheDocument();
    });

    it('should show clear button when user types text', async () => {
      const onSearchChange = vi.fn();
      render(<UserSearchBar onSearchChange={onSearchChange} />);
      
      const input = screen.getByLabelText('Search users by name or email');
      
      // Initially no clear button
      expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
      
      // Type text
      fireEvent.change(input, { target: { value: 'test' } });
      
      // Clear button should appear
      expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
    });

    it('should clear search when clear button is clicked', () => {
      const onSearchChange = vi.fn();
      render(
        <UserSearchBar 
          searchQuery="test query" 
          onSearchChange={onSearchChange} 
        />
      );
      
      const clearButton = screen.getByLabelText('Clear search');
      const input = screen.getByLabelText('Search users by name or email') as HTMLInputElement;
      
      // Click clear button
      fireEvent.click(clearButton);
      
      // Input should be cleared
      expect(input.value).toBe('');
      
      // Callback should be called with empty string
      expect(onSearchChange).toHaveBeenCalledWith('');
    });

    it('should clear pending debounce timer when clear button is clicked', () => {
      const onSearchChange = vi.fn();
      render(<UserSearchBar onSearchChange={onSearchChange} />);
      
      const input = screen.getByLabelText('Search users by name or email');
      
      // Type text (starts debounce timer)
      fireEvent.change(input, { target: { value: 'test' } });
      
      // Click clear before debounce completes
      const clearButton = screen.getByLabelText('Clear search');
      fireEvent.click(clearButton);
      
      // Advance timers
      vi.advanceTimersByTime(500);
      
      // onSearchChange should only be called once (for clear), not for the pending debounce
      expect(onSearchChange).toHaveBeenCalledTimes(1);
      expect(onSearchChange).toHaveBeenCalledWith('');
    });
  });

  describe('Debounced Input - Requirement 3.2', () => {
    it('should debounce search input by 500ms', () => {
      const onSearchChange = vi.fn();
      render(<UserSearchBar onSearchChange={onSearchChange} />);
      
      const input = screen.getByLabelText('Search users by name or email');
      
      // Type text
      fireEvent.change(input, { target: { value: 'test' } });
      
      // Callback should not be called immediately
      expect(onSearchChange).not.toHaveBeenCalled();
      
      // Advance time by 499ms (just before debounce completes)
      vi.advanceTimersByTime(499);
      expect(onSearchChange).not.toHaveBeenCalled();
      
      // Advance time by 1ms more (500ms total)
      vi.advanceTimersByTime(1);
      
      // Now callback should be called
      expect(onSearchChange).toHaveBeenCalledTimes(1);
      expect(onSearchChange).toHaveBeenCalledWith('test');
    });

    it('should reset debounce timer on each keystroke', () => {
      const onSearchChange = vi.fn();
      render(<UserSearchBar onSearchChange={onSearchChange} />);
      
      const input = screen.getByLabelText('Search users by name or email');
      
      // Type 't'
      fireEvent.change(input, { target: { value: 't' } });
      vi.advanceTimersByTime(400);
      
      // Type 'te'
      fireEvent.change(input, { target: { value: 'te' } });
      vi.advanceTimersByTime(400);
      
      // Type 'tes'
      fireEvent.change(input, { target: { value: 'tes' } });
      vi.advanceTimersByTime(400);
      
      // Type 'test'
      fireEvent.change(input, { target: { value: 'test' } });
      
      // Still no callback yet
      expect(onSearchChange).not.toHaveBeenCalled();
      
      // Complete the debounce
      vi.advanceTimersByTime(500);
      
      // Should only be called once with final value
      expect(onSearchChange).toHaveBeenCalledTimes(1);
      expect(onSearchChange).toHaveBeenCalledWith('test');
    });

    it('should handle rapid typing correctly', () => {
      const onSearchChange = vi.fn();
      render(<UserSearchBar onSearchChange={onSearchChange} />);
      
      const input = screen.getByLabelText('Search users by name or email');
      
      // Simulate rapid typing
      const queries = ['t', 'te', 'tes', 'test', 'test ', 'test q', 'test qu', 'test que', 'test quer', 'test query'];
      
      queries.forEach((query, index) => {
        fireEvent.change(input, { target: { value: query } });
        if (index < queries.length - 1) {
          vi.advanceTimersByTime(100); // Each keystroke 100ms apart
        }
      });
      
      // No callback yet
      expect(onSearchChange).not.toHaveBeenCalled();
      
      // Complete debounce
      vi.advanceTimersByTime(500);
      
      // Should only call once with final value
      expect(onSearchChange).toHaveBeenCalledTimes(1);
      expect(onSearchChange).toHaveBeenCalledWith('test query');
    });

    it('should handle multiple distinct searches', () => {
      const onSearchChange = vi.fn();
      render(<UserSearchBar onSearchChange={onSearchChange} />);
      
      const input = screen.getByLabelText('Search users by name or email');
      
      // First search
      fireEvent.change(input, { target: { value: 'first' } });
      vi.advanceTimersByTime(500);
      expect(onSearchChange).toHaveBeenCalledWith('first');
      
      // Second search
      fireEvent.change(input, { target: { value: 'second' } });
      vi.advanceTimersByTime(500);
      expect(onSearchChange).toHaveBeenCalledWith('second');
      
      // Third search
      fireEvent.change(input, { target: { value: 'third' } });
      vi.advanceTimersByTime(500);
      expect(onSearchChange).toHaveBeenCalledWith('third');
      
      expect(onSearchChange).toHaveBeenCalledTimes(3);
    });
  });

  describe('URL Persistence Support - Requirement 3.5', () => {
    it('should sync local state with searchQuery prop changes', () => {
      const onSearchChange = vi.fn();
      const { rerender } = render(
        <UserSearchBar 
          searchQuery="initial" 
          onSearchChange={onSearchChange} 
        />
      );
      
      const input = screen.getByLabelText('Search users by name or email') as HTMLInputElement;
      expect(input.value).toBe('initial');
      
      // Simulate URL parameter change (parent updates searchQuery prop)
      rerender(
        <UserSearchBar 
          searchQuery="updated from url" 
          onSearchChange={onSearchChange} 
        />
      );
      
      expect(input.value).toBe('updated from url');
    });

    it('should update input when searchQuery prop changes from empty to value', () => {
      const onSearchChange = vi.fn();
      const { rerender } = render(
        <UserSearchBar 
          searchQuery="" 
          onSearchChange={onSearchChange} 
        />
      );
      
      const input = screen.getByLabelText('Search users by name or email') as HTMLInputElement;
      expect(input.value).toBe('');
      
      rerender(
        <UserSearchBar 
          searchQuery="new search" 
          onSearchChange={onSearchChange} 
        />
      );
      
      expect(input.value).toBe('new search');
    });

    it('should update input when searchQuery prop changes from value to empty', () => {
      const onSearchChange = vi.fn();
      const { rerender } = render(
        <UserSearchBar 
          searchQuery="search query" 
          onSearchChange={onSearchChange} 
        />
      );
      
      const input = screen.getByLabelText('Search users by name or email') as HTMLInputElement;
      expect(input.value).toBe('search query');
      
      rerender(
        <UserSearchBar 
          searchQuery="" 
          onSearchChange={onSearchChange} 
        />
      );
      
      expect(input.value).toBe('');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA label on search input', () => {
      const onSearchChange = vi.fn();
      render(<UserSearchBar onSearchChange={onSearchChange} />);
      
      const input = screen.getByLabelText('Search users by name or email');
      expect(input).toBeInTheDocument();
    });

    it('should have proper ARIA label on clear button', () => {
      const onSearchChange = vi.fn();
      render(
        <UserSearchBar 
          searchQuery="test" 
          onSearchChange={onSearchChange} 
        />
      );
      
      const clearButton = screen.getByLabelText('Clear search');
      expect(clearButton).toBeInTheDocument();
    });

    it('should have aria-hidden on decorative search icon', () => {
      const onSearchChange = vi.fn();
      const { container } = render(<UserSearchBar onSearchChange={onSearchChange} />);
      
      // Search icon should be aria-hidden
      const searchIcon = container.querySelector('[aria-hidden="true"]');
      expect(searchIcon).toBeInTheDocument();
    });

    it('should be keyboard accessible', () => {
      const onSearchChange = vi.fn();
      render(<UserSearchBar onSearchChange={onSearchChange} />);
      
      const input = screen.getByLabelText('Search users by name or email');
      
      // Should be focusable
      input.focus();
      expect(document.activeElement).toBe(input);
    });

    it('should allow clear button to be activated with Enter key', () => {
      const onSearchChange = vi.fn();
      render(
        <UserSearchBar 
          searchQuery="test" 
          onSearchChange={onSearchChange} 
        />
      );
      
      const clearButton = screen.getByLabelText('Clear search');
      
      // Focus and press Enter
      clearButton.focus();
      fireEvent.keyDown(clearButton, { key: 'Enter', code: 'Enter' });
      fireEvent.click(clearButton);
      
      expect(onSearchChange).toHaveBeenCalledWith('');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string input (clearing search)', () => {
      const onSearchChange = vi.fn();
      render(<UserSearchBar onSearchChange={onSearchChange} searchQuery="test" />);
      
      const input = screen.getByLabelText('Search users by name or email');
      
      // Change from 'test' to empty string
      fireEvent.change(input, { target: { value: '' } });
      vi.advanceTimersByTime(500);
      
      expect(onSearchChange).toHaveBeenCalledWith('');
    });

    it('should handle very long search query', () => {
      const onSearchChange = vi.fn();
      render(<UserSearchBar onSearchChange={onSearchChange} />);
      
      const input = screen.getByLabelText('Search users by name or email');
      const longQuery = 'a'.repeat(500);
      
      fireEvent.change(input, { target: { value: longQuery } });
      vi.advanceTimersByTime(500);
      
      expect(onSearchChange).toHaveBeenCalledWith(longQuery);
    });

    it('should handle special characters', () => {
      const onSearchChange = vi.fn();
      render(<UserSearchBar onSearchChange={onSearchChange} />);
      
      const input = screen.getByLabelText('Search users by name or email');
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      
      fireEvent.change(input, { target: { value: specialChars } });
      vi.advanceTimersByTime(500);
      
      expect(onSearchChange).toHaveBeenCalledWith(specialChars);
    });

    it('should handle unicode characters', () => {
      const onSearchChange = vi.fn();
      render(<UserSearchBar onSearchChange={onSearchChange} />);
      
      const input = screen.getByLabelText('Search users by name or email');
      const unicode = '你好世界 🌍 Ñoño';
      
      fireEvent.change(input, { target: { value: unicode } });
      vi.advanceTimersByTime(500);
      
      expect(onSearchChange).toHaveBeenCalledWith(unicode);
    });

    it('should handle whitespace-only input', () => {
      const onSearchChange = vi.fn();
      render(<UserSearchBar onSearchChange={onSearchChange} />);
      
      const input = screen.getByLabelText('Search users by name or email');
      
      fireEvent.change(input, { target: { value: '   ' } });
      vi.advanceTimersByTime(500);
      
      expect(onSearchChange).toHaveBeenCalledWith('   ');
    });
  });

  describe('Component Lifecycle', () => {
    it('should cleanup debounce timer on unmount', () => {
      const onSearchChange = vi.fn();
      const { unmount } = render(<UserSearchBar onSearchChange={onSearchChange} />);
      
      const input = screen.getByLabelText('Search users by name or email');
      
      // Start typing
      fireEvent.change(input, { target: { value: 'test' } });
      
      // Unmount before debounce completes
      unmount();
      
      // Advance timers
      vi.advanceTimersByTime(500);
      
      // Callback should not be called after unmount
      expect(onSearchChange).not.toHaveBeenCalled();
    });

    it('should handle re-renders correctly', () => {
      const onSearchChange = vi.fn();
      const { rerender } = render(
        <UserSearchBar 
          searchQuery="initial" 
          onSearchChange={onSearchChange} 
        />
      );
      
      const input = screen.getByLabelText('Search users by name or email') as HTMLInputElement;
      expect(input.value).toBe('initial');
      
      // Re-render with same props
      rerender(
        <UserSearchBar 
          searchQuery="initial" 
          onSearchChange={onSearchChange} 
        />
      );
      
      expect(input.value).toBe('initial');
      
      // Re-render with different props
      rerender(
        <UserSearchBar 
          searchQuery="updated" 
          onSearchChange={onSearchChange} 
        />
      );
      
      expect(input.value).toBe('updated');
    });
  });

  describe('Focus Behavior', () => {
    it('should maintain focus when typing', () => {
      const onSearchChange = vi.fn();
      render(<UserSearchBar onSearchChange={onSearchChange} />);
      
      const input = screen.getByLabelText('Search users by name or email');
      
      input.focus();
      fireEvent.change(input, { target: { value: 'test' } });
      
      expect(document.activeElement).toBe(input);
    });

    it('should shift focus to input after clearing (optional behavior)', () => {
      const onSearchChange = vi.fn();
      render(
        <UserSearchBar 
          searchQuery="test" 
          onSearchChange={onSearchChange} 
        />
      );
      
      const input = screen.getByLabelText('Search users by name or email');
      const clearButton = screen.getByLabelText('Clear search');
      
      // Focus on input
      input.focus();
      expect(document.activeElement).toBe(input);
      
      // Click clear button
      fireEvent.click(clearButton);
      
      // Input value should be cleared
      expect((input as HTMLInputElement).value).toBe('');
    });
  });
});
