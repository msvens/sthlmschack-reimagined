'use client';

import {
  CalendarIcon,
  TrophyIcon,
  UserIcon,
  BuildingOffice2Icon,
  Cog6ToothIcon,
  SunIcon,
  MoonIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { getTranslation } from '@/lib/translations';
import { Navbar } from '@/components/navbar';
import type { NavLinkItem, NavDropdownItem, NavBrand } from '@/components/navbar';

export default function NavbarConfig() {
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const t = getTranslation(language);

  const brand: NavBrand = {
    href: '/',
    lines: ['msvens', 'chess'],
  };

  const centerItems: NavLinkItem[] = [
    {
      kind: 'link',
      id: 'calendar',
      href: '/calendar',
      icon: CalendarIcon,
      label: t.navbar.navigation.calendar,
    },
    {
      kind: 'link',
      id: 'results',
      href: '/results',
      icon: TrophyIcon,
      label: t.navbar.navigation.results,
    },
    {
      kind: 'link',
      id: 'players',
      href: '/players',
      icon: UserIcon,
      label: t.navbar.navigation.players,
    },
    {
      kind: 'link',
      id: 'organizations',
      href: '/organizations',
      icon: BuildingOffice2Icon,
      label: t.navbar.navigation.organizations,
    },
  ];

  const themeLabel = theme === 'dark' ? t.navbar.lightMode : t.navbar.darkMode;
  const themeIcon = theme === 'dark' ? SunIcon : MoonIcon;

  // Show the language you'd switch TO
  const languageLabel = language === 'en' ? '🇸🇪 Svenska' : '🇺🇸 English';

  const moreDropdown: NavDropdownItem = {
    kind: 'dropdown',
    id: 'more',
    icon: Cog6ToothIcon,
    label: t.navbar.more,
    items: [
      {
        kind: 'link',
        id: 'elo',
        href: '/elo',
        icon: AcademicCapIcon,
        label: 'ELO',
      },
      {
        kind: 'action',
        id: 'theme',
        icon: themeIcon,
        label: themeLabel,
        onClick: toggleTheme,
      },
      {
        kind: 'action',
        id: 'language',
        label: languageLabel,
        onClick: () => setLanguage(language === 'en' ? 'sv' : 'en'),
      },
    ],
  };

  return (
    <Navbar
      brand={brand}
      display="text"
      centerItems={centerItems}
      rightItems={[moreDropdown]}
    />
  );
}
