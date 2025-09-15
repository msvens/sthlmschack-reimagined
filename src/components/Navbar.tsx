'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  CalendarIcon,
  TrophyIcon,
  ClockIcon,
  Bars3Icon,
  GlobeAltIcon,
  SunIcon,
  MoonIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { getTranslation } from '@/lib/translations';
import { IconButton } from './IconButton';

const navigation = [
  { name: 'upcomingEvents', href: '/events', icon: ClockIcon },
  { name: 'calendar', href: '/calendar', icon: CalendarIcon },
  { name: 'results', href: '/results', icon: TrophyIcon },
  { name: 'players', href: '/players', icon: UserIcon },
];

const languages = [
  { code: 'en', name: 'english', flag: '🇺🇸' },
  { code: 'sv', name: 'swedish', flag: '🇸🇪' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  
  const t = getTranslation(language);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleLanguageMenu = () => {
    setIsLanguageMenuOpen(!isLanguageMenuOpen);
  };

  const handleLanguageChange = (langCode: 'en' | 'sv') => {
    setLanguage(langCode);
    setIsLanguageMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b shadow-sm" style={{ backgroundColor: 'var(--color-mui-background-paper)', borderColor: 'var(--color-mui-divider)' }}>
      <div className="px-1 mx-auto max-w-full py-2">
        <div className="flex justify-between h-12">
          {/* App Name - Left aligned (matching mphotos-ui exactly) */}
          <div className="flex items-center flex-shrink-0 pl-1">
            <Link href="/" className="text-base font-light leading-tight tracking-widest uppercase" style={{ color: 'var(--color-mui-text-primary)' }}>
              <span className="block">Stockholm</span>
              <span className="block">Chess</span>
            </Link>
          </div>
          
          {/* Navigation Icons and Controls - Right aligned (matching mphotos-ui exactly) */}
          <div className="flex items-center pr-1">
            {/* Navigation Icons - Center */}
            <div className="hidden md:flex md:space-x-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="inline-flex items-center justify-center"
                    title={t.navbar.navigation[item.name as keyof typeof t.navbar.navigation]}
                  >
                    <IconButton
                      icon={item.icon}
                      size="large"
                      className={isActive
                        ? 'bg-transparent hover:bg-opacity-20'
                        : 'bg-transparent hover:bg-opacity-20'
                      }
                      style={{
                        color: isActive ? 'var(--color-mui-text-primary)' : 'var(--color-mui-text-secondary)',
                        backgroundColor: 'transparent'
                      }}
                    />
                    <span className="sr-only">{t.navbar.navigation[item.name as keyof typeof t.navbar.navigation]}</span>
                  </Link>
                );
              })}
            </div>
            
            {/* Theme Toggle */}
            <div className="ml-2">
              <IconButton
                icon={theme === 'dark' ? SunIcon : MoonIcon}
                onClick={toggleTheme}
                size="large"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                className="bg-transparent hover:bg-opacity-20"
                style={{
                  color: 'var(--color-mui-text-secondary)',
                  backgroundColor: 'transparent'
                }}
              />
            </div>

            {/* Language Switcher */}
            <div className="relative ml-2">
              <IconButton
                icon={GlobeAltIcon}
                onClick={toggleLanguageMenu}
                size="large"
                title={`Current: ${languages.find(l => l.code === language)?.flag} ${languages.find(l => l.code === language)?.code.toUpperCase()}`}
                className="bg-transparent hover:bg-opacity-20"
                style={{
                  color: 'var(--color-mui-text-secondary)',
                  backgroundColor: 'transparent'
                }}
              />

              {/* Language Dropdown */}
              <div 
                className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border transition-all duration-200 ${
                  isLanguageMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
                }`}
                style={{ backgroundColor: 'var(--color-mui-background-paper)', borderColor: 'var(--color-mui-divider)' }}
              >
                <div className="py-1">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code as 'en' | 'sv')}
                      className="w-full text-left px-4 py-2 text-sm transition-colors"
                      style={{
                        color: language === lang.code ? 'var(--color-mui-text-primary)' : 'var(--color-mui-text-secondary)',
                        backgroundColor: language === lang.code ? 'var(--color-mui-background-hover)' : 'transparent'
                      }}
                    >
                      <span className="mr-3">{lang.flag}</span>
                      {t.navbar.language[lang.name as keyof typeof t.navbar.language]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden ml-2">
              <IconButton
                icon={Bars3Icon}
                onClick={toggleMenu}
                size="large"
                className="bg-transparent hover:bg-opacity-20"
                style={{
                  color: 'var(--color-mui-text-secondary)',
                  backgroundColor: 'transparent'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <div 
        className={`fixed inset-0 transition-opacity duration-200 z-40 ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Mobile menu */}
      <div 
        className={`md:hidden fixed top-12 right-0 h-[calc(100vh-48px)] w-56 shadow-lg transition-all duration-200 ease-in-out z-50 ${
          isMenuOpen 
            ? 'opacity-100 translate-x-0' 
            : 'opacity-0 translate-x-4 pointer-events-none'
        }`}
        style={{ backgroundColor: 'var(--color-mui-background-paper)', borderLeft: '1px solid var(--color-mui-divider)' }}
      >
        <div className="py-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center px-4 py-3 transition-colors"
                style={{
                  color: isActive ? 'var(--color-mui-text-primary)' : 'var(--color-mui-text-secondary)'
                }}
              >
                <item.icon className="w-8 h-8 stroke-[1.25]" aria-hidden="true" />
                <span className="ml-4 text-lg font-light">
                  {t.navbar.navigation[item.name as keyof typeof t.navbar.navigation]}
                </span>
              </Link>
            );
          })}
          
          {/* Theme toggle in mobile menu */}
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--color-mui-divider)' }}>
            <div className="px-4 py-2 text-sm font-medium uppercase tracking-wide" style={{ color: 'var(--color-mui-text-disabled)' }}>
              Theme
            </div>
            <button
              onClick={() => {
                toggleTheme();
                setIsMenuOpen(false);
              }}
              className="w-full text-left flex items-center px-4 py-3 transition-colors"
              style={{ color: 'var(--color-mui-text-secondary)' }}
            >
              {theme === 'dark' ? (
                <SunIcon className="w-8 h-8 stroke-[1.25] mr-4" aria-hidden="true" />
              ) : (
                <MoonIcon className="w-8 h-8 stroke-[1.25] mr-4" aria-hidden="true" />
              )}
              <span className="text-lg font-light">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>
          </div>
          
          {/* Language options in mobile menu */}
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--color-mui-divider)' }}>
            <div className="px-4 py-2 text-sm font-medium uppercase tracking-wide" style={{ color: 'var(--color-mui-text-disabled)' }}>
              Language
            </div>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  handleLanguageChange(lang.code as 'en' | 'sv');
                  setIsMenuOpen(false);
                }}
                className="w-full text-left flex items-center px-4 py-3 transition-colors"
                style={{
                  color: language === lang.code ? 'var(--color-mui-text-primary)' : 'var(--color-mui-text-secondary)'
                }}
              >
                <span className="mr-4 text-lg">{lang.flag}</span>
                <span className="text-lg font-light">
                  {t.navbar.language[lang.name as keyof typeof t.navbar.language]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
