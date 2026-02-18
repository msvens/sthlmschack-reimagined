'use client';

import { usePathname } from 'next/navigation';
import { Link } from '@/components/Link';
import type { NavItem, DropdownMenuItem } from './types';

interface NavbarMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: NavItem[];
}

function MobileDropdownItem({
  menuItem,
  onClose,
}: {
  menuItem: DropdownMenuItem;
  onClose: () => void;
}) {
  if (menuItem.kind === 'divider') {
    return <div className="my-1 border-t border-gray-200 dark:border-gray-700 mx-4" />;
  }

  const Icon = menuItem.icon;
  const baseClass = 'flex items-center px-4 py-3 transition-colors';

  if (menuItem.kind === 'link') {
    return (
      <Link
        href={menuItem.href}
        onClick={onClose}
        color="inherit"
        underline="never"
        className={`${baseClass} text-gray-600 dark:text-gray-400`}
      >
        {Icon && <Icon className="w-6 h-6 mr-3" aria-hidden="true" />}
        <span className="text-base font-light">{menuItem.label}</span>
      </Link>
    );
  }

  if (menuItem.kind === 'toggle') {
    return (
      <button
        onClick={() => {
          menuItem.onToggle();
          onClose();
        }}
        className={`w-full text-left ${baseClass} text-gray-600 dark:text-gray-400`}
      >
        {Icon && <Icon className="w-6 h-6 mr-3" aria-hidden="true" />}
        <span className="flex-1 text-base font-light">{menuItem.label}</span>
        <span
          className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${
            menuItem.isOn ? 'bg-gray-900 dark:bg-gray-200' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 rounded-full bg-white dark:bg-gray-900 transition-transform ${
              menuItem.isOn ? 'translate-x-4' : 'translate-x-1'
            }`}
          />
        </span>
      </button>
    );
  }

  // kind === 'action'
  const activeClass = menuItem.isActive
    ? 'text-gray-900 dark:text-gray-200'
    : 'text-gray-600 dark:text-gray-400';

  return (
    <button
      onClick={() => {
        menuItem.onClick();
        onClose();
      }}
      className={`w-full text-left ${baseClass} ${activeClass}`}
    >
      {Icon && <Icon className="w-6 h-6 mr-3" aria-hidden="true" />}
      <span className="text-base font-light">{menuItem.label}</span>
    </button>
  );
}

export function NavbarMobileMenu({ isOpen, onClose, items }: NavbarMobileMenuProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 transition-opacity duration-200 z-40 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`md:hidden fixed top-12 right-0 h-[calc(100vh-48px)] w-56 bg-white dark:bg-dark-bg border-l border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-200 ease-in-out z-50 ${
          isOpen
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 translate-x-4 pointer-events-none'
        }`}
      >
        <div className="py-2 overflow-y-auto h-full">
          {items.map((item, idx) => {
            if (item.kind === 'link') {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onClose}
                  color="inherit"
                  underline="never"
                  className={`flex items-center px-4 py-3 transition-colors ${
                    isActive ? 'text-gray-900 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {Icon && <Icon className="w-6 h-6 mr-3" aria-hidden="true" />}
                  <span className="text-base font-light">{item.label}</span>
                </Link>
              );
            }

            // kind === 'dropdown' — render as flat section
            return (
              <div key={item.id}>
                {idx > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700" />
                )}
                {item.mobileLabel && (
                  <div className="px-4 py-2 text-sm font-medium uppercase tracking-wide text-gray-400 dark:text-gray-600">
                    {item.mobileLabel}
                  </div>
                )}
                {item.items.map((menuItem, i) => (
                  <MobileDropdownItem
                    key={menuItem.kind === 'divider' ? `divider-${i}` : menuItem.id}
                    menuItem={menuItem}
                    onClose={onClose}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
