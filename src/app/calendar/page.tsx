'use client';

import { PageSpacing } from "@/components/layout/PageSpacing";
import { useLanguage } from "@/context/LanguageContext";
import { getTranslation } from "@/lib/translations";

export default function CalendarPage() {
  const { language } = useLanguage();
  const t = getTranslation(language);

  return (
    <>
      <PageSpacing />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-mui-text-primary)' }}>
          {t.pages.calendar.title}
        </h1>
        <p className="mb-8" style={{ color: 'var(--color-mui-text-secondary)' }}>
          {t.pages.calendar.subtitle}
        </p>
        
        <div className="p-8 rounded-lg border" style={{ backgroundColor: 'var(--color-mui-background-paper)', borderColor: 'var(--color-mui-divider)' }}>
          <p className="text-center" style={{ color: 'var(--color-mui-text-disabled)' }}>
            {t.pages.calendar.placeholder}
          </p>
        </div>
      </div>
    </>
  );
}
