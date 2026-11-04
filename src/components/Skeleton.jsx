import React from 'react';

/**
 * Modern Pulse Skeleton Component
 */
export const Skeleton = ({ className = '', variant = 'text', width, height }) => {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded';

  const variantClasses = {
    text: 'h-3.5 w-full rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  const style = {
    width: width || undefined,
    height: height || undefined,
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant] || ''} ${className}`}
      style={style}
    />
  );
};

/**
 * Skeleton for Table Rows with Avatar, Text, Badges, and Action Buttons
 */
export const TableSkeleton = ({ rows = 5, cols = 8 }) => {
  return (
    <div className="divide-y divide-gray-100">
      {Array.from({ length: rows }).map((_, rIndex) => (
        <tr key={rIndex} className="animate-pulse">
          <td className="py-4 px-5">
            <div className="flex items-center gap-3">
              <Skeleton variant="circular" className="w-9 h-9 shrink-0" />
              <div className="space-y-1.5 w-full max-w-[160px]">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-2.5 w-1/2" />
              </div>
            </div>
          </td>
          <td className="py-4 px-5">
            <div className="space-y-1 w-28">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-2.5 w-2/3" />
            </div>
          </td>
          <td className="py-4 px-5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-2 w-20 rounded-full" />
              <Skeleton className="h-3 w-8" />
            </div>
          </td>
          <td className="py-4 px-5">
            <Skeleton className="h-3.5 w-16" />
          </td>
          <td className="py-4 px-5">
            <div className="space-y-1 w-24">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-2 w-16" />
            </div>
          </td>
          <td className="py-4 px-5">
            <Skeleton className="h-3 w-20" />
          </td>
          <td className="py-4 px-5">
            <Skeleton className="h-6 w-20 rounded-full" />
          </td>
          <td className="py-4 px-5 text-center">
            <div className="flex items-center justify-center gap-2">
              <Skeleton variant="rectangular" className="w-7 h-7 rounded-lg" />
              <Skeleton variant="rectangular" className="w-7 h-7 rounded-lg" />
              <Skeleton variant="rectangular" className="w-7 h-7 rounded-lg" />
            </div>
          </td>
        </tr>
      ))}
    </div>
  );
};

/**
 * Skeleton for Dashboard Metric Stat Cards
 */
export const CardSkeleton = () => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs animate-pulse space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton variant="rectangular" className="w-10 h-10 rounded-xl" />
      </div>
      <div className="flex items-baseline gap-2">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-4 w-14 rounded-full" />
      </div>
      <Skeleton className="h-2.5 w-36" />
    </div>
  );
};

