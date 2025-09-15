'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
}

function FooterLink({ href, children }: FooterLinkProps) {
  return (
    <Link 
      href={href} 
      className="uppercase mx-4 text-xs transition-colors"
      style={{ color: 'var(--color-mui-text-secondary)' }}
    >
      {children}
    </Link>
  );
}

export function Footer() {
  const { language } = useLanguage();
  const t = getTranslation(language);

  return (
    <footer className="w-full border-t" style={{ backgroundColor: 'var(--color-mui-background-paper)', borderColor: 'var(--color-mui-divider)' }}>
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center">
        {/* Left side - Project info */}
        <div className="mb-4 md:mb-0">
          <div className="text-sm" style={{ color: 'var(--color-mui-text-primary)' }}>
            {t.footer.projectInfo.title}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--color-mui-text-secondary)' }}>
            {t.footer.projectInfo.subtitle}
          </div>
        </div>

        {/* Center - Navigation links */}
        <div className="flex flex-wrap justify-center">
          <FooterLink href="/events">{t.footer.navigation.events}</FooterLink>
          <FooterLink href="/calendar">{t.footer.navigation.calendar}</FooterLink>
          <FooterLink href="/results">{t.footer.navigation.results}</FooterLink>
          <FooterLink href="/players">{t.footer.navigation.players}</FooterLink>
          <FooterLink href="/about">{t.footer.navigation.about}</FooterLink>
        </div>

        {/* Right side - External links */}
        <div className="mt-4 md:mt-0 text-center md:text-right">
          <div className="text-xs mb-2" style={{ color: 'var(--color-mui-text-secondary)' }}>
            {t.footer.external.poweredBy}
          </div>
          <div className="flex space-x-4">
            <Link 
              href="https://www.stockholmsschack.se/" 
              className="text-xs transition-colors"
              style={{ color: 'var(--color-mui-text-secondary)' }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Stockholm Schackförbund
            </Link>
            <Link 
              href="https://schack.se/" 
              className="text-xs transition-colors"
              style={{ color: 'var(--color-mui-text-secondary)' }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Svenska Schackförbundet
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
