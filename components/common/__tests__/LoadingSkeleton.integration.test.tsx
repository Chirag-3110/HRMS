/**
 * Integration tests for LoadingSkeleton component
 * Feature: phelbo-superadmin-labs
 * 
 * These tests verify that LoadingSkeleton integrates correctly
 * with the rest of the design system and can be imported/exported properly
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import * as CommonComponents from '../index';

describe('LoadingSkeleton Integration', () => {
  it('should be exported from common components index', () => {
    expect(CommonComponents.LoadingSkeleton).toBeDefined();
    expect(typeof CommonComponents.LoadingSkeleton).toBe('object');
  });

  it('should export LoadingSkeletonProps type', () => {
    // This test verifies the type is exported at compile time
    // Runtime verification is not possible for types
    const props: CommonComponents.LoadingSkeletonProps = {
      variant: 'table',
      rows: 10,
      className: 'test',
    };
    
    expect(props.variant).toBe('table');
    expect(props.rows).toBe(10);
    expect(props.className).toBe('test');
  });

  it('should render when imported from common components', () => {
    const { LoadingSkeleton } = CommonComponents;
    const { container } = render(<LoadingSkeleton variant="card" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should match design system styling', () => {
    const { container } = render(<CommonComponents.LoadingSkeleton variant="card" />);
    const cardSkeleton = container.firstChild as HTMLElement;
    
    // Verify design system classes are applied
    expect(cardSkeleton.className).toContain('rounded-xl');
    expect(cardSkeleton.className).toContain('border');
    expect(cardSkeleton.className).toContain('bg-card');
    expect(cardSkeleton.className).toContain('shadow');
  });

  it('should work alongside other common components', () => {
    const { ErrorNotification, SuccessNotification, LoadingSkeleton } = CommonComponents;
    
    const { container } = render(
      <div>
        <LoadingSkeleton variant="table" />
        <ErrorNotification message="Test error" onDismiss={() => {}} />
        <SuccessNotification message="Test success" onDismiss={() => {}} />
      </div>
    );
    
    expect(container).toBeInTheDocument();
  });
});
