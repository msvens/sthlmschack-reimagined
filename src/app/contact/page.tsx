'use client';

import { useState, FormEvent } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageTitle } from '@/components/PageTitle';
import { Card } from '@/components/Card';
import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';

// Formspree endpoint - set this in your .env.local file
// NEXT_PUBLIC_FORMSPREE_ENDPOINT=https://formspree.io/f/your-form-id
const FORMSPREE_ENDPOINT = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT || '';

type FormStatus = 'idle' | 'sending' | 'success' | 'error';

export default function ContactPage() {
  const { language } = useLanguage();
  const t = getTranslation(language);

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!FORMSPREE_ENDPOINT) {
      console.error('Formspree endpoint not configured');
      setStatus('error');
      return;
    }

    setStatus('sending');

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, message }),
      });

      if (response.ok) {
        setStatus('success');
        setEmail('');
        setMessage('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const isConfigured = !!FORMSPREE_ENDPOINT;

  return (
    <PageLayout maxWidth="3xl">
      <PageTitle
        title={t.pages.contact.title}
        subtitle={t.pages.contact.subtitle}
      />

      <Card padding="lg" border={false}>
        {!isConfigured ? (
          <div className="p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Under construction. Check back soon!
            </p>
          </div>
        ) : status === 'success' ? (
          <div className="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
            <p className="text-green-800 dark:text-green-200">
              {t.pages.contact.form.success}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {t.pages.contact.form.email}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.pages.contact.form.emailPlaceholder}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  placeholder-gray-400 dark:placeholder-gray-500"
                disabled={status === 'sending'}
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {t.pages.contact.form.message}
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t.pages.contact.form.messagePlaceholder}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                disabled={status === 'sending'}
              />
            </div>

            {status === 'error' && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-200 text-sm">
                  {t.pages.contact.form.error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'sending' || !isConfigured}
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700
                disabled:bg-gray-400 disabled:cursor-not-allowed
                text-white font-medium rounded-lg transition-colors
                focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {status === 'sending'
                ? t.pages.contact.form.sending
                : t.pages.contact.form.submit}
            </button>
          </form>
        )}
      </Card>
    </PageLayout>
  );
}
