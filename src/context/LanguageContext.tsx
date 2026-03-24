'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { safeGetItem, safeSetItem } from '@/lib/storage';

export type Language = 'en' | 'sv';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('sv'); // Default to Swedish

  // Read saved language from localStorage on mount (not lazy initializer to avoid hydration mismatch)
  useEffect(() => {
    const loadSavedLanguage = () => {
      const saved = safeGetItem('language');
      if (saved === 'en' || saved === 'sv') {
        setLanguageState(saved);
      }
    };
    loadSavedLanguage();
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    // Save to localStorage (silently fails if unavailable)
    safeSetItem('language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}