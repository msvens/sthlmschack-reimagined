import { ReactNode } from 'react';
import { PageSpacing } from './PageSpacing';

export interface PageLayoutProps {
  /** Page content */
  children: ReactNode;
  /** Maximum width of content container. Only includes values actually used in the project. */
  maxWidth?: '3xl' | '4xl' | '5xl' | '7xl';
  /** PageSpacing height - 'default' (96px), 'no_spacing' (56px - navbar height), or any arbitrary value */
  spacing?: 'default' | 'no_spacing' | string;
  /** Make the page full screen height (min-h-screen) */
  fullScreen?: boolean;
  /** Additional className for the content container */
  className?: string;
}

export function PageLayout({
  children,
  maxWidth = '7xl',
  spacing = 'default',
  fullScreen = false,
  className = ''
}: PageLayoutProps) {
  // Map maxWidth to actual Tailwind classes (required for JIT compiler)
  const maxWidthClasses = {
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '7xl': 'max-w-7xl',
  };

  const maxWidthClass = maxWidthClasses[maxWidth];
  const containerClass = fullScreen ? 'min-h-screen' : '';

  return (
    <>
      <PageSpacing height={spacing} />
      <div className={containerClass}>
        <div className={`${maxWidthClass} mx-auto px-4 mb-8 ${className}`}>
          {children}
        </div>
      </div>
    </>
  );
}