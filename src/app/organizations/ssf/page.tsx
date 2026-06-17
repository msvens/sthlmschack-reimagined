'use client';

import { useLanguage } from '@/context/LanguageContext';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageTitle } from '@/components/PageTitle';
import { SsfRankingPanel } from '@/components/organizations/SsfRankingPanel';
import { getTranslation } from '@/lib/translations';

export default function SSFRankingPage() {
  const { language } = useLanguage();
  const t = getTranslation(language);

  return (
    <PageLayout maxWidth="4xl">
      <div className="space-y-6">
        <PageTitle title={t.pages.organizations.ssf.title} subtitle={t.pages.organizations.ssf.subtitle} />
        <SsfRankingPanel />
      </div>
    </PageLayout>
  );
}
