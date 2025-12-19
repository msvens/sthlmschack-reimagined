import { ReactNode } from 'react';
import { PageSpacing } from './PageSpacing';

export interface PageLayoutProps {
  /** Page content */
  children: ReactNode;
  /** Maximum width of content container */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
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
  const maxWidthClass = `max-w-${maxWidth}`;
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