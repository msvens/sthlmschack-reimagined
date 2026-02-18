'use client';

import { Link } from '@/components/Link';
import { usePathname } from 'next/navigation';
import type { NavLinkItem } from './types';

interface NavItemProps {
  item: NavLinkItem;
  display: 'icon' | 'text' | 'both';
}

export function NavItem({ item, display }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
  const Icon = item.icon;

  const activeClass = isActive
    ? 'text-gray-900 dark:text-gray-200'
    : 'text-gray-600 dark:text-gray-400';

  return (
    <Link
      href={item.href}
      color="inherit"
      underline="never"
      title={item.title ?? item.label}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${activeClass}`}
    >
      {(display === 'icon' || display === 'both') && Icon && (
        <Icon className="w-5 h-5" aria-hidden="true" />
      )}
      {(display === 'text' || display === 'both') && (
        <span>{item.label}</span>
      )}
      {display === 'icon' && !Icon && (
        <span>{item.label}</span>
      )}
      <span className="sr-only">{item.label}</span>
    </Link>
  );
}
