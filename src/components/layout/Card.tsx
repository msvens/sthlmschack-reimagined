import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

export function Card({
  children,
  className = '',
  padding = 'md',
  hover = false,
  clickable = false,
  onClick
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const baseClasses = 'rounded-lg border';
  const hoverClasses = hover || clickable ? 'hover:shadow-lg transition-shadow' : '';
  const clickableClasses = clickable ? 'cursor-pointer' : '';

  const combinedClassName = [
    baseClasses,
    paddingClasses[padding],
    hoverClasses,
    clickableClasses,
    className
  ].filter(Boolean).join(' ');

  const cardStyle = {
    backgroundColor: 'var(--color-mui-background-paper)',
    borderColor: 'var(--color-mui-divider)'
  };

  if (clickable && onClick) {
    return (
      <div
        className={combinedClassName}
        style={cardStyle}
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
    <div className={combinedClassName} style={cardStyle}>
      {children}
    </div>
  );
}

