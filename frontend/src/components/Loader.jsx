import React from 'react';

const Loader = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div
        className={`${sizeClasses[size]} border-brand-200 border-t-brand-600 rounded-full animate-spin`}
      />
    </div>
  );
};

export default Loader;

export const SkeletonLoader = ({ type = 'table', count = 5 }) => {
  if (type === 'table') {
    return (
      <div className="w-full space-y-3 animate-pulse">
        <div className="h-10 bg-c-border/50 rounded-lg w-full" />
        {[...Array(count)].map((_, i) => (
          <div key={i} className="h-12 bg-c-border/25 rounded-lg w-full" />
        ))}
      </div>
    );
  }

  if (type === 'cards') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[...Array(count)].map((_, i) => (
          <div
            key={i}
            className="bg-c-card p-6 rounded-xl border border-c-border h-32 space-y-4"
          >
            <div className="h-4 bg-c-border/50 rounded w-1/2" />
            <div className="h-8 bg-c-border/70 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="animate-pulse space-y-4">
      <div className="h-6 bg-c-border/50 rounded w-1/4" />
      <div className="h-4 bg-c-border/25 rounded w-3/4" />
      <div className="h-4 bg-c-border/25 rounded w-1/2" />
    </div>
  );
};
