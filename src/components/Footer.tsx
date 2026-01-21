'use client';

import { Link } from '@/components/Link';
import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}

function FooterLink({ href, children, external = false }: FooterLinkProps) {
  const externalProps = external
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {};

  return (
    <Link
      href={href}
      className="uppercase mx-2 text-[10px] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      {...externalProps}
    >
      {children}
    </Link>
  );
}

export function Footer() {
  const { language } = useLanguage();
  const t = getTranslation(language);

  return (
    <footer className="w-full">
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-2 flex justify-center items-center">
        <FooterLink href="/about">{t.footer.navigation.about}</FooterLink>
        <FooterLink href="https://schack.se/" external>schack.se</FooterLink>
        <FooterLink href="https://www.stockholmsschack.se/" external>stockholmsschack.se</FooterLink>
      </div>
    </footer>
  );
}
