import * as React from "react";
import { cn } from "@/lib/utils";

export interface LoadingSkeletonProps {
  /**
   * The variant determines the type of loading skeleton to display
   * - 'table': Shows a skeleton for table rows
   * - 'card': Shows a skeleton for card content
   * - 'chart': Shows a skeleton for chart/analytics content
   */
  variant?: "table" | "card" | "chart";
  /**
   * Number of rows/items to show in the skeleton (mainly for table variant)
   * @default 5
   */
  rows?: number;
  /**
   * Additional CSS classes to apply to the container
   */
  className?: string;
}

/**
 * LoadingSkeleton component for displaying loading states
 * 
 * A reusable component that displays animated loading placeholders
 * matching the layout of actual content. Follows the design system
 * and provides variants for different content types.
 * 
 * @example
 * ```tsx
 * // Table skeleton
 * <LoadingSkeleton variant="table" rows={10} />
 * 
 * // Card skeleton
 * <LoadingSkeleton variant="card" />
 * 
 * // Chart skeleton
 * <LoadingSkeleton variant="chart" />
 * ```
 */
export const LoadingSkeleton = React.forwardRef<
  HTMLDivElement,
  LoadingSkeletonProps
>(({ variant = "card", rows = 5, className }, ref) => {
  // Base skeleton element with animation
  const SkeletonLine = ({ className: lineClassName }: { className?: string }) => (
    <div
      className={cn(
        "animate-pulse bg-gray-200 rounded",
        lineClassName
      )}
      aria-hidden="true"
    />
  );

  // Table variant - shows skeleton rows with columns
  if (variant === "table") {
    return (
      <div
        ref={ref}
        className={cn("w-full space-y-3", className)}
        role="status"
        aria-label="Loading table data"
      >
        {/* Table header skeleton */}
        <div className="flex gap-4 pb-3 border-b">
          <SkeletonLine className="h-4 w-1/5" />
          <SkeletonLine className="h-4 w-1/4" />
          <SkeletonLine className="h-4 w-1/6" />
          <SkeletonLine className="h-4 w-1/6" />
          <SkeletonLine className="h-4 w-1/5" />
        </div>

        {/* Table rows skeleton */}
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex gap-4 py-3">
            <SkeletonLine className="h-4 w-1/5" />
            <SkeletonLine className="h-4 w-1/4" />
            <SkeletonLine className="h-4 w-1/6" />
            <SkeletonLine className="h-4 w-1/6" />
            <SkeletonLine className="h-4 w-1/5" />
          </div>
        ))}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  // Card variant - shows skeleton for card content
  if (variant === "card") {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border bg-card shadow p-6 space-y-4",
          className
        )}
        role="status"
        aria-label="Loading card content"
      >
        {/* Card title */}
        <SkeletonLine className="h-6 w-2/5" />
        
        {/* Card content lines */}
        <div className="space-y-3">
          <SkeletonLine className="h-4 w-full" />
          <SkeletonLine className="h-4 w-4/5" />
          <SkeletonLine className="h-4 w-3/5" />
        </div>
        
        {/* Card footer */}
        <div className="flex gap-3 pt-2">
          <SkeletonLine className="h-10 w-24" />
          <SkeletonLine className="h-10 w-24" />
        </div>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  // Chart variant - shows skeleton for analytics/chart content
  if (variant === "chart") {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border bg-card shadow p-6 space-y-4",
          className
        )}
        role="status"
        aria-label="Loading chart"
      >
        {/* Chart title */}
        <div className="space-y-2">
          <SkeletonLine className="h-6 w-1/3" />
          <SkeletonLine className="h-3 w-1/2" />
        </div>
        
        {/* Chart area - simulating bars or lines */}
        <div className="h-64 flex items-end gap-4 pt-4">
          <SkeletonLine className="h-32 w-full" />
          <SkeletonLine className="h-48 w-full" />
          <SkeletonLine className="h-40 w-full" />
          <SkeletonLine className="h-56 w-full" />
          <SkeletonLine className="h-44 w-full" />
          <SkeletonLine className="h-52 w-full" />
        </div>
        
        {/* Chart legend */}
        <div className="flex gap-6 pt-4">
          <div className="flex items-center gap-2">
            <SkeletonLine className="h-3 w-3 rounded-full" />
            <SkeletonLine className="h-3 w-16" />
          </div>
          <div className="flex items-center gap-2">
            <SkeletonLine className="h-3 w-3 rounded-full" />
            <SkeletonLine className="h-3 w-16" />
          </div>
        </div>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  // Fallback to card variant
  return null;
});

LoadingSkeleton.displayName = "LoadingSkeleton";
