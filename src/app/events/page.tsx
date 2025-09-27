'use client';

import { PageSpacing } from "@/components/layout/PageSpacing";
import { Card } from "@/components/layout/Card";
import { useLanguage } from "@/context/LanguageContext";
import { getTranslation } from "@/lib/translations";

export default function EventsPage() {
  const { language } = useLanguage();
  const t = getTranslation(language);

  return (
    <>
      <PageSpacing />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-mui-text-primary)' }}>
          {t.pages.events.title}
        </h1>
        <p className="mb-8" style={{ color: 'var(--color-mui-text-secondary)' }}>
          {t.pages.events.subtitle}
        </p>
        
        <Card padding="lg">
          <p className="text-center" style={{ color: 'var(--color-mui-text-disabled)' }}>
            {t.pages.events.placeholder}
          </p>
        </Card>
      </div>
    </>
  );
}
