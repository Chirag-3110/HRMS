/**
 * Tests for LoadingSkeleton component
 * Feature: phelbo-superadmin-labs
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSkeleton } from '../LoadingSkeleton';

describe('LoadingSkeleton', () => {
  describe('Card Variant', () => {
    it('should render card variant by default', () => {
      render(<LoadingSkeleton />);
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByLabelText('Loading card content')).toBeInTheDocument();
    });

    it('should render card variant when explicitly specified', () => {
      render(<LoadingSkeleton variant="card" />);
      expect(screen.getByLabelText('Loading card content')).toBeInTheDocument();
    });

    it('should include visually hidden loading text', () => {
      render(<LoadingSkeleton variant="card" />);
      expect(screen.getByText('Loading...')).toHaveClass('sr-only');
    });

    it('should apply custom className', () => {
      const { container } = render(<LoadingSkeleton variant="card" className="custom-class" />);
      const skeleton = container.querySelector('.custom-class');
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe('Table Variant', () => {
    it('should render table variant with default rows', () => {
      render(<LoadingSkeleton variant="table" />);
      expect(screen.getByLabelText('Loading table data')).toBeInTheDocument();
    });

    it('should render specified number of rows', () => {
      const { container } = render(<LoadingSkeleton variant="table" rows={3} />);
      const skeleton = screen.getByLabelText('Loading table data');
      
      // Count the table row elements (excluding header)
      const rows = skeleton.querySelectorAll('.flex.gap-4.py-3');
      expect(rows).toHaveLength(3);
    });

    it('should render table header', () => {
      const { container } = render(<LoadingSkeleton variant="table" />);
      const skeleton = screen.getByLabelText('Loading table data');
      
      // Table header has border-b class
      const header = skeleton.querySelector('.border-b');
      expect(header).toBeInTheDocument();
    });

    it('should include visually hidden loading text', () => {
      render(<LoadingSkeleton variant="table" />);
      expect(screen.getByText('Loading...')).toHaveClass('sr-only');
    });
  });

  describe('Chart Variant', () => {
    it('should render chart variant', () => {
      render(<LoadingSkeleton variant="chart" />);
      expect(screen.getByLabelText('Loading chart')).toBeInTheDocument();
    });

    it('should render chart elements (bars/lines)', () => {
      const { container } = render(<LoadingSkeleton variant="chart" />);
      const skeleton = screen.getByLabelText('Loading chart');
      
      // Chart has a container with h-64 class for the chart area
      const chartArea = skeleton.querySelector('.h-64');
      expect(chartArea).toBeInTheDocument();
    });

    it('should include visually hidden loading text', () => {
      render(<LoadingSkeleton variant="chart" />);
      expect(screen.getByText('Loading...')).toHaveClass('sr-only');
    });
  });

  describe('Accessibility', () => {
    it('should have role="status" for all variants', () => {
      const { rerender } = render(<LoadingSkeleton variant="table" />);
      expect(screen.getByRole('status')).toBeInTheDocument();

      rerender(<LoadingSkeleton variant="card" />);
      expect(screen.getByRole('status')).toBeInTheDocument();

      rerender(<LoadingSkeleton variant="chart" />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should have aria-label for each variant', () => {
      const { rerender } = render(<LoadingSkeleton variant="table" />);
      expect(screen.getByLabelText('Loading table data')).toBeInTheDocument();

      rerender(<LoadingSkeleton variant="card" />);
      expect(screen.getByLabelText('Loading card content')).toBeInTheDocument();

      rerender(<LoadingSkeleton variant="chart" />);
      expect(screen.getByLabelText('Loading chart')).toBeInTheDocument();
    });

    it('should have aria-hidden on skeleton elements', () => {
      const { container } = render(<LoadingSkeleton variant="card" />);
      const skeletonElements = container.querySelectorAll('[aria-hidden="true"]');
      expect(skeletonElements.length).toBeGreaterThan(0);
    });
  });

  describe('Animation', () => {
    it('should have animate-pulse class on skeleton elements', () => {
      const { container } = render(<LoadingSkeleton variant="card" />);
      const skeletonElements = container.querySelectorAll('.animate-pulse');
      expect(skeletonElements.length).toBeGreaterThan(0);
    });
  });

  describe('Ref forwarding', () => {
    it('should forward ref to the container element', () => {
      const ref = { current: null };
      render(<LoadingSkeleton ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });
});
