import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  border?: boolean;
}

export function Card({
  children,
  className = '',
  padding = 'md',
  hover = false,
  clickable = false,
  onClick,
  border = true
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const baseClasses = border
    ? 'rounded-lg border bg-white dark:bg-dark-bg border-gray-200 dark:border-gray-700'
    : 'bg-white dark:bg-dark-bg';
  const hoverClasses = hover || clickable ? 'hover:shadow-lg transition-shadow' : '';
  const clickableClasses = clickable ? 'cursor-pointer' : '';

  const combinedClassName = [
    baseClasses,
    paddingClasses[padding],
    hoverClasses,
    clickableClasses,
    className
  ].filter(Boolean).join(' ');

  if (clickable && onClick) {
    return (
      <div
        className={combinedClassName}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClick();
          }
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div className={combinedClassName}>
      {children}
    </div>
  );
}

