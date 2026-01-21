'use client';

import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/Card';
import { changelog, ChangelogEntry, ChangelogSection } from '@/data/changelog';

function SectionBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    Added: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    Changed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    Fixed: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    Removed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    Infrastructure: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  };

  const colorClass = colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';

  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${colorClass}`}>
      {type}
    </span>
  );
}

function ChangelogSectionView({ section }: { section: ChangelogSection }) {
  return (
    <div className="mb-4">
      <SectionBadge type={section.type} />
      <ul className="mt-2 space-y-1 text-gray-600 dark:text-gray-400">
        {section.items.map((item, idx) => (
          <li key={idx} className="flex items-start">
            <span className="mr-2 text-gray-400">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChangelogEntryView({ entry }: { entry: ChangelogEntry }) {
  return (
    <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <div className="flex items-baseline gap-3 mb-4">
        <h2 className="text-xl font-medium text-gray-900 dark:text-gray-200">
          {entry.version === 'Unreleased' ? 'Unreleased' : `v${entry.version}`}
        </h2>
        {entry.date && (
          <span className="text-sm text-gray-500 dark:text-gray-500">
            {entry.date}
          </span>
        )}
      </div>
      {entry.sections.map((section, idx) => (
        <ChangelogSectionView key={idx} section={section} />
      ))}
    </div>
  );
}

export default function ChangelogPage() {
  return (
    <PageLayout maxWidth="4xl">
      <Card padding="lg" border={false} className="pt-0">
        <h1 className="text-3xl font-light mb-2 text-gray-900 dark:text-gray-200">
          Changelog
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          All notable changes to msvens chess.
        </p>

        {changelog.map((entry, idx) => (
          <ChangelogEntryView key={idx} entry={entry} />
        ))}
      </Card>
    </PageLayout>
  );
}