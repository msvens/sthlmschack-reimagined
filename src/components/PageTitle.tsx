import type { ReactNode } from 'react';

interface PageTitleProps {
  title: string;
  subtitle?: ReactNode;
  hideSubtitleOnMobile?: boolean;
}

export function PageTitle({ title, subtitle, hideSubtitleOnMobile = true }: PageTitleProps) {
  return (
    <div className="mb-10">
      <h1 className="text-3xl font-light tracking-wide mb-2 text-gray-900 dark:text-gray-200">
        {title}
      </h1>
      {subtitle && (
        <p className={`text-gray-600 dark:text-gray-400 ${hideSubtitleOnMobile ? 'hidden sm:block' : ''}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}