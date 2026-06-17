'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useOrganizations } from '@/context/OrganizationsContext';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageTitle } from '@/components/PageTitle';
import { SearchableSelectableList, SearchableSelectableListItem } from '@/components/SearchableSelectableList';
import { Toggle } from '@/components/Toggle';
import { ClubMapView } from '@/components/organizations/ClubMapView';
import { SsfRankingPanel } from '@/components/organizations/SsfRankingPanel';
import {
  getSavedTab,
  setSavedTab,
  isOrganizationsTab,
  type OrganizationsTab,
} from '@/components/organizations/organizationsPrefs';
import { getTranslation } from '@/lib/translations';

const TABS: readonly OrganizationsTab[] = ['clubs', 'map', 'districts', 'ssf'];

export default function OrganizationsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { getAllClubs, districts, loading, error } = useOrganizations();
  const t = getTranslation(language);

  const [activeTab, setActiveTab] = useState<OrganizationsTab>('clubs');
  // School clubs are ~62% of active clubs and not "real" clubs — hidden by default.
  const [includeSchoolClubs, setIncludeSchoolClubs] = useState(false);

  // Restore tab on mount: a ?tab= param wins (deep links / redirects from the
  // old sub-routes), otherwise the last-used tab. Default render stays SSR-safe.
  useEffect(() => {
    const restore = () => {
      const param = new URLSearchParams(window.location.search).get('tab');
      if (isOrganizationsTab(param)) {
        setActiveTab(param);
        return;
      }
      const saved = getSavedTab();
      if (saved) setActiveTab(saved);
    };
    restore();
  }, []);

  const selectTab = (tab: OrganizationsTab) => {
    setActiveTab(tab);
    setSavedTab(tab);
  };

  const clubs = useMemo(() => {
    const all = getAllClubs({ activeOnly: true, hasRatingPlayersOnly: true });
    return includeSchoolClubs ? all : all.filter((c) => c.schoolClub !== 1);
  }, [getAllClubs, includeSchoolClubs]);

  const clubItems: SearchableSelectableListItem[] = useMemo(
    () => clubs.map((club) => ({ id: club.id, label: club.name, subtitle: club.city || undefined })),
    [clubs],
  );

  const districtItems: SearchableSelectableListItem[] = useMemo(
    () =>
      [...districts]
        .sort((a, b) => a.name.localeCompare(b.name, 'sv'))
        .map((d) => ({ id: d.id, label: d.name, subtitle: d.city || undefined })),
    [districts],
  );

  const org = t.pages.organizations;

  return (
    <PageLayout maxWidth="4xl">
      <PageTitle title={org.title} subtitle={org.subtitle} />

      {/* Tabs: Clubs / Club Map / Districts / SSF Ranking */}
      <div className="mb-6 mt-2 flex border-b border-gray-200 dark:border-gray-700">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => selectTab(tab)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'border-b-2 text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {org.tabs[tab]}
          </button>
        ))}
      </div>

      {(activeTab === 'clubs' || activeTab === 'map') && (
        <div className="mb-4">
          <Toggle
            checked={includeSchoolClubs}
            onChange={setIncludeSchoolClubs}
            label={org.includeSchoolClubs}
          />
        </div>
      )}

      {error && (
        <div className="text-center text-red-600 dark:text-red-400">{error}</div>
      )}

      {!error && activeTab === 'clubs' && (
        <div className="space-y-4">
          <div className="max-w-md">
            <SearchableSelectableList
              items={clubItems}
              selectedId={null}
              onSelect={(id) => router.push(`/organizations/clubs/${id}`)}
              placeholder={org.clubs.searchPlaceholder}
            />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {loading ? org.loading : `${clubs.length} ${org.clubs.activeClubs}`}
          </div>
        </div>
      )}

      {!error && activeTab === 'map' && (
        <ClubMapView clubs={clubs} language={language} loading={loading} />
      )}

      {!error && activeTab === 'districts' && (
        <div className="space-y-4">
          <div className="max-w-md">
            <SearchableSelectableList
              items={districtItems}
              selectedId={null}
              onSelect={(id) => router.push(`/organizations/districts/${id}`)}
              placeholder={org.districts.selectDistrict}
            />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {loading ? org.loading : `${districts.length} ${org.districts.title.toLowerCase()}`}
          </div>
        </div>
      )}

      {!error && activeTab === 'ssf' && <SsfRankingPanel />}
    </PageLayout>
  );
}
