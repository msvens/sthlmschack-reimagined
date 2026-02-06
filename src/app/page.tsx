'use client';

import Link from 'next/link';
import { PageLayout } from "@/components/layout/PageLayout";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { getTranslation } from "@/lib/translations";
import { CalendarIcon, TrophyIcon, UserIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline';

export default function Home() {
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const t = getTranslation(language);

  return (
    <PageLayout>
      {/* Hero Section */}
      <div className="text-center mb-16 md:mb-24">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-gray-200">
          {t.home.hero.title}{" "}
          <span className="text-gray-900 dark:text-gray-200">{t.home.hero.titleHighlight}</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {t.home.hero.subtitle}
        </p>
      </div>

      {/* Navigation Links */}
      <div className="max-w-md mx-auto space-y-8">
        <Link
          href="/calendar"
          className="flex items-center gap-4 group"
        >
          <div className="text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
            <CalendarIcon className="w-8 h-8 stroke-[1.5]" />
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-200 group-hover:underline">
              {t.home.cards.calendar.title}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t.home.cards.calendar.description}
            </div>
          </div>
        </Link>

        <Link
          href="/results"
          className="flex items-center gap-4 group"
        >
          <div className="text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
            <TrophyIcon className="w-8 h-8 stroke-[1.5]" />
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-200 group-hover:underline">
              {t.home.cards.results.title}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t.home.cards.results.description}
            </div>
          </div>
        </Link>

        <Link
          href="/players"
          className="flex items-center gap-4 group"
        >
          <div className="text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
            <UserIcon className="w-8 h-8 stroke-[1.5]" />
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-200 group-hover:underline">
              {t.home.cards.players.title}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t.home.cards.players.description}
            </div>
          </div>
        </Link>

        <Link
          href="/organizations"
          className="flex items-center gap-4 group"
        >
          <div className="text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
            <BuildingOffice2Icon className="w-8 h-8 stroke-[1.5]" />
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-200 group-hover:underline">
              {t.home.cards.organizations.title}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t.home.cards.organizations.description}
            </div>
          </div>
        </Link>
      </div>

      {/* Theme/Language hint - show language option in the OTHER language */}
      <div className="text-center mt-16 text-sm text-gray-500 dark:text-gray-400">
        <button
          onClick={() => setLanguage(language === 'en' ? 'sv' : 'en')}
          className="underline hover:text-gray-900 dark:hover:text-gray-200"
        >
          {language === 'en' ? 'Tillgänglig på svenska' : 'Available in English'}
        </button>
        {' · '}
        <button
          onClick={toggleTheme}
          className="underline hover:text-gray-900 dark:hover:text-gray-200"
        >
          {theme === 'dark'
            ? (language === 'en' ? 'Light mode' : 'Ljust läge')
            : (language === 'en' ? 'Dark mode' : 'Mörkt läge')
          }
        </button>
      </div>
    </PageLayout>
  );
}
