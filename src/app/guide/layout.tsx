'use client';

import { usePathname, useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import { SelectableList } from '@/components/SelectableList';
import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';

const sections = [
  { id: 'formats', path: '/guide/formats' },
] as const;

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { language } = useLanguage();
  const t = getTranslation(language);

  const labelMap: Record<string, string> = {
    formats: t.pages.guide.navigation.formats,
  };

  const items = sections.map((s) => ({
    id: s.id,
    label: labelMap[s.id],
  }));

  const activeId = sections.find((s) => pathname.startsWith(s.path))?.id ?? 'formats';

  const handleSelect = (id: string | number) => {
    const section = sections.find((s) => s.id === id);
    if (section) router.push(section.path);
  };

  return (
    <PageLayout maxWidth="5xl">
      {/* Mobile dropdown */}
      <div className="lg:hidden mb-6">
        <SelectableList
          variant="dropdown"
          items={items}
          selectedId={activeId}
          onSelect={handleSelect}
        />
      </div>

      <div className="flex flex-row gap-8">
        {/* Desktop sidebar */}
        <div className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-24">
            <SelectableList
              variant="vertical"
              items={items}
              selectedId={activeId}
              onSelect={handleSelect}
            />
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </PageLayout>
  );
}
