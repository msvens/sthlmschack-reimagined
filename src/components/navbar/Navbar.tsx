'use client';

import { useState } from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { Link } from '@/components/Link';
import { NavItem } from './NavItem';
import { NavDropdown } from './NavDropdown';
import { NavbarMobileMenu } from './NavbarMobileMenu';
import type { NavbarProps, NavItem as NavItemType } from './types';

function renderNavItem(item: NavItemType, display: 'icon' | 'text' | 'both') {
  if (item.kind === 'link') {
    return <NavItem key={item.id} item={item} display={display} />;
  }
  return <NavDropdown key={item.id} item={item} display={display} />;
}

export function Navbar({ brand, display = 'text', showBorder = true, centerItems = [], rightItems = [] }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const allMobileItems: NavItemType[] = [...centerItems, ...rightItems];

  const borderClass = showBorder
    ? 'border-b border-gray-200 dark:border-gray-700 shadow-sm'
    : '';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-white dark:bg-dark-bg ${borderClass}`}>
      <div className="px-2 mx-auto max-w-full py-2">
        <div className="flex items-center justify-between h-12">
          {/* Left: Brand */}
          <div className="flex items-center shrink-0 pl-1">
            <Link
              href={brand.href}
              color="inherit"
              underline="never"
              className="text-base font-light leading-tight tracking-widest uppercase text-gray-900 dark:text-gray-200"
            >
              {brand.lines.map((line, i) => (
                <span key={i} className="block">{line}</span>
              ))}
            </Link>
          </div>

          {/* Center: Primary navigation (desktop) */}
          {centerItems.length > 0 && (
            <div className="hidden md:flex items-center gap-1">
              {centerItems.map((item) => renderNavItem(item, display))}
            </div>
          )}

          {/* Right: Secondary items (desktop) + Hamburger (mobile) */}
          <div className="flex items-center gap-1">
            {rightItems.length > 0 && (
              <div className="hidden md:flex items-center gap-1">
                {rightItems.map((item) => renderNavItem(item, display))}
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMenuOpen((o) => !o)}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Bars3Icon className="w-6 h-6" />
              <span className="sr-only">Menu</span>
            </button>
          </div>
        </div>
      </div>

      <NavbarMobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        items={allMobileItems}
      />
    </nav>
  );
}
