'use client';

import { PageLayout } from "@/components/layout/PageLayout";
import { Card } from "@/components/Card";
import { useLanguage } from "@/context/LanguageContext";
import { getTranslation } from "@/lib/translations";

export default function CalendarPage() {
  const { language } = useLanguage();
  const t = getTranslation(language);

  return (
    <PageLayout>
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          {t.pages.calendar.title}
        </h1>
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          {t.pages.calendar.subtitle}
        </p>

        <Card padding="lg">
          <p className="text-center text-gray-500 dark:text-gray-500">
            {t.pages.calendar.placeholder}
          </p>
        </Card>
    </PageLayout>
  );
}
