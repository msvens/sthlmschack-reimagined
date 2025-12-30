'use client';

import Link from 'next/link';
import { PageLayout } from "@/components/layout/PageLayout";
import { Card } from "@/components/Card";
import { useLanguage } from "@/context/LanguageContext";
import { getTranslation } from "@/lib/translations";

export default function Home() {
  const { language } = useLanguage();
  const t = getTranslation(language);

  return (
    <PageLayout>
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-gray-200">
            {t.home.hero.title}{" "}
            <span className="text-gray-900 dark:text-gray-200">{t.home.hero.titleHighlight}</span>
          </h1>
          <p className="text-xl max-w-3xl mx-auto text-gray-600 dark:text-gray-400">
            {t.home.hero.subtitle}
          </p>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card hover className="transition-shadow">
            <div className="mb-4 text-gray-900 dark:text-gray-200">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-200">
              {t.home.cards.calendar.title}
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              {t.home.cards.calendar.description}
            </p>
            <Link
              href="/calendar"
              className="hover:underline font-medium text-gray-900 dark:text-gray-200"
            >
              {t.home.cards.calendar.link} →
            </Link>
          </Card>

          <Card hover className="transition-shadow">
            <div className="mb-4 text-gray-900 dark:text-gray-200">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-200">
              {t.home.cards.results.title}
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              {t.home.cards.results.description}
            </p>
            <Link
              href="/results"
              className="hover:underline font-medium text-gray-900 dark:text-gray-200"
            >
              {t.home.cards.results.link} →
            </Link>
          </Card>

          <Card hover className="transition-shadow">
            <div className="mb-4 text-gray-900 dark:text-gray-200">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-200">
              {t.home.cards.players.title}
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              {t.home.cards.players.description}
            </p>
            <Link
              href="/players"
              className="hover:underline font-medium text-gray-900 dark:text-gray-200"
            >
              {t.home.cards.players.link} →
            </Link>
          </Card>
        </div>

        {/* About Section */}
        <Card padding="lg">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-200">
            {t.home.about.title}
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            {t.home.about.paragraph1}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            {t.home.about.paragraph2}
          </p>
        </Card>
    </PageLayout>
  );
}
