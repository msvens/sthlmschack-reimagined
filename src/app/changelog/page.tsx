'use client';

import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/Card';
import { Badge, BadgeColor } from '@/components/Badge';
import { changelog, ChangelogEntry, ChangelogSection } from '@/data/changelog';

function SectionBadge({ type }: { type: string }) {
  const colors: Record<string, BadgeColor> = {
    Added: 'green',
    Changed: 'blue',
    Fixed: 'yellow',
    Removed: 'red',
    Infrastructure: 'purple',
  };

  return (
    <Badge color={colors[type] || 'gray'} shape="rounded">
      {type}
    </Badge>
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